import { NextResponse } from 'next/server';
import axios from 'axios';
import { getPrismaClient } from '@/lib/prisma';

const clerkApiKey = 'sk_test_eE2ZdMoVVr5taX4XRBm7NWuBRIP0BLgCcTXRWWGQg6'; // Replace with your actual Clerk API key

export async function POST(request: Request) {

  const prisma = getPrismaClient();
  try {
    const data = await request.json();
    console.log('Received data:', data);

    const {
      name,
      arabicName,
      email,
      password,
      academicYear,
      signature,
      subjects,
      school,
      username,
      role,
    } = data;
console.log(name,
  arabicName,
  email,
  password,
  academicYear,
  signature,
  subjects,
  school,
  username,
  role)
    // Fetch the user's school from the request object (set by middleware)

    // Step 1: Create the teacher in the database
    const newTeacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password,
        school,
        academicYear,
        signature,
        arabicName,
        username,
        role,
        subjects: {
          create: await Promise.all(
            subjects.map(async (subjectName: string) => {
              // Upsert the subject by name
              const subject = await prisma.subject.upsert({
                where: { name: subjectName },
                update: {}, // No update needed, just ensuring the subject exists
                create: { name: subjectName, arabicName: subjectName },
              });

              return {
                subject: { connect: { id: subject.id } }, // Connect by ID
              };
            })
          ),
        },
      },
    });

    console.log('Teacher created in the database:', newTeacher);

    // Step 2: Create the user in Clerk using the teacher's database ID as `external_id`
    try {
      

      const clerkResponse = await axios.post(
        'https://api.clerk.dev/v1/users',
        {
          email_addresses: [{ email_address: email }],
          first_name: name, // Use teacher's name as the first name
          username, // Include the username
          password, // Include the password
          public_metadata: { role, school }, // Store the roles in public metadata
          external_id: newTeacher.id, // Use the teacher's ID from the database
        },
        {
          headers: {
            Authorization: `Bearer ${clerkApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(
        `Clerk user created successfully for teacher: ${email}`,
        clerkResponse.data
      );
    } catch (clerkError) {
      // Narrowing the error type
      if (axios.isAxiosError(clerkError)) {
        // It's an Axios error, safe to access its properties
        console.error(
          'Failed to create Clerk user:',
          clerkError.response?.data || clerkError.message
        );
      } else if (clerkError instanceof Error) {
        // General error fallback
        console.error('Unexpected error:', clerkError.message);
      } else {
        console.error('An unknown error occurred:', clerkError);
      }

      // Optional: Handle cleanup if Clerk user creation fails
      await prisma.teacher.delete({ where: { id: newTeacher.id } });
      return NextResponse.json(
        { error: 'Failed to create Clerk user' },
        { status: 500 }
      );
    }

    // Step 3: Return success response
    return NextResponse.json({
      message: 'Teacher and Clerk user created successfully',
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}