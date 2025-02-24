import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import axios from 'axios';
import { getPrismaClient } from '@/lib/prisma';

// Clerk API Key (same as used in teacher logic)
const clerkApiKey = 'sk_test_eE2ZdMoVVr5taX4XRBm7NWuBRIP0BLgCcTXRWWGQg6'; // Replace with your actual Clerk API key

// Helper function to clean and validate dates
function cleanDate(dateString: string): string {
  const cleaned = dateString.replace(/[^\x00-\x7F]/g, '').replace(/[^\d\-\/]/g, '');
  return cleaned;
}

// Helper function to validate the date format
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

export async function POST(request: Request) {
  const prisma = getPrismaClient();
  try {
    const {
      name,
      arabicName,
      dob,
      school,
      academicYear,
      classId,
      nationality,
      iqamaNo,
      passportNo,
      expenses = 'paid',
      username,
      password,
    } = await request.json();

    if (!name || !dob || !classId || !academicYear) {
      return NextResponse.json(
        { error: 'Name, date of birth, class, and academic year are required.' },
        { status: 400 }
      );
    }

    const cleanedDob = cleanDate(dob);
    if (!isValidDate(cleanedDob)) {
      return NextResponse.json({ error: 'Invalid date format for date of birth.' }, { status: 400 });
    }

    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json({ error: 'Class not found.' }, { status: 404 });
    }

    // Fetch subjects assigned to the class
    const classSubjects = await prisma.classSubject.findMany({
      where: { classId },
    });

    if (!classSubjects.length) {
      return NextResponse.json({ error: 'No subjects found for the class.' }, { status: 400 });
    }

    // Step 1: Create the student in the database
    const newStudent = await prisma.student.create({
      data: {
        name,
        arabicName,
        dateOfBirth: new Date(cleanedDob),
        nationality,
        iqamaNo,
        passportNo,
        expenses,
        school,
        username,
        password,
        class: { connect: { id: classId } },
      },
    });

    console.log('Student created in the database:', newStudent);

    // Step 2: Create the user in Clerk using the student's database ID as `external_id`
    try {
      const clerkResponse = await axios.post(
        'https://api.clerk.dev/v1/users',
        {
          email_addresses: [{ email_address: `${username}@yourdomain.com` }], // Adjust email generation as needed
          first_name: name, // Use student's name as the first name
          username, // Include the username
          password, // Include the password
          public_metadata: { role: 'STUDENT', school }, // Store role and school in public metadata
          external_id: newStudent.id, // Use the student's ID from the database
        },
        {
          headers: {
            Authorization: `Bearer ${clerkApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(
        `Clerk user created successfully for student: ${username}`,
        clerkResponse.data
      );
    } catch (clerkError) {
      // Handle Clerk creation failure
      if (axios.isAxiosError(clerkError)) {
        console.error(
          'Failed to create Clerk user:',
          clerkError.response?.data || clerkError.message
        );
      } else if (clerkError instanceof Error) {
        console.error('Unexpected error:', clerkError.message);
      } else {
        console.error('An unknown error occurred:', clerkError);
      }

      // Clean up: Delete the student from the database if Clerk fails
      await prisma.student.delete({ where: { id: newStudent.id } });
      return NextResponse.json(
        { error: 'Failed to create Clerk user' },
        { status: 500 }
      );
    }

    // Step 3: Create marks for the student (existing logic)
    const trimesters = ['First Trimester', 'Second Trimester', 'Third Trimester'];

    const marksDataPromises = classSubjects.map(async (subject) => {
      const classTeacher = await prisma.classTeacher.findUnique({
        where: {
          classId_subjectId: {
            classId: classId,
            subjectId: subject.subjectId,
          },
        },
      });

      if (!classTeacher) {
        console.log(`Skipping marks creation for subject ${subject.subjectId} as no teacher is assigned.`);
        return null;
      }

      return trimesters.map((trimester) => ({
        id: randomUUID(),
        studentId: newStudent.id,
        subjectId: subject.subjectId,
        classTeacherId: classTeacher.id,
        academicYear,
        trimester,
        participation: 0,
        homework: 0,
        quiz: 0,
        project: 0,
        exam: 0,
      }));
    });

    const marksData = (await Promise.all(marksDataPromises)).filter((mark) => mark !== null).flat();

    if (marksData.length > 0) {
      await prisma.mark.createMany({
        data: marksData,
        skipDuplicates: true,
      });
    } else {
      console.log('No marks data to insert as no teacher was assigned to any subject.');
    }

    // Step 4: Return success response
    return NextResponse.json({
      message: 'Student and Clerk user created successfully',
      student: newStudent,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}