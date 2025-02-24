import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { parse } from 'csv-parse/sync';
import axios from 'axios';
import { getPrismaClient } from '@/lib/prisma';

// Clerk API Key
const clerkApiKey = 'sk_test_eE2ZdMoVVr5taX4XRBm7NWuBRIP0BLgCcTXRWWGQg6'; // Replace with your actual Clerk API key

// Helper function to clean and validate dates
function cleanDate(dateString: string): string {
  const cleaned = dateString.replace(/[^\x00-\x7F]/g, '').replace(/[^\d\-\/]/g, '');
  return cleaned;
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

// Helper function to fetch all classes once and cache them
async function getClassMap(prisma: any) {
  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
  });
  return new Map(classes.map((c: { id: string; name: string }) => [c.name.toLowerCase(), c.id]));
}

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();
    const { fileContent, academicYear } = await request.json();
    console.log('Academic Year:', academicYear);

    if (!fileContent || !academicYear) {
      return NextResponse.json(
        { error: 'CSV file content and academic year are required.' },
        { status: 400 }
      );
    }

    let records: any[];

    // Check if the content is JSON or CSV
    if (fileContent.trim().startsWith('[{')) {
      records = JSON.parse(fileContent);
    } else {
      const buffer = Buffer.isBuffer(fileContent)
        ? fileContent
        : Buffer.from(fileContent, 'utf-8');

      records = parse(buffer.toString(), {
        columns: true,
        skip_empty_lines: true,
      });
    }

    const students = [];
    const errors = [];

    // Cache all classes once at the start to improve performance
    const classMap = await getClassMap(prisma);

    for (const [index, row] of records.entries()) {
      let cleanedDob: string | null = null;
      if (row.dob) {
        const cleaned = cleanDate(row.dob);
        if (isValidDate(cleaned)) {
          cleanedDob = cleaned;
        } else {
          errors.push(`Invalid date format for dob in row ${index + 1}: ${JSON.stringify(row)}`);
          continue;
        }
      }

      if (!row.name || !row.className || !academicYear) {
        errors.push(`Missing required fields (name, className, academicYear) in row ${index + 1}: ${JSON.stringify(row)}`);
        continue;
      }

      // Normalize className to ensure consistency
      const normalizedClassName = row.className.trim().toLowerCase();

      // Look up classId using the cached classMap
      const classId = classMap.get(normalizedClassName);
      if (!classId) {
        errors.push(`Class not found for className: ${row.className} (normalized: ${normalizedClassName}) in row ${index + 1}`);
        continue;
      }

      students.push({
        ...row,
        dob: cleanedDob ? new Date(cleanedDob) : null,
        classId, // Store the resolved classId for this student
      });
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('\n') }, { status: 400 });
    }

    const createdStudents = [];
    const trimesters = ['First Trimester', 'Second Trimester', 'Third Trimester'];

    for (const [index, student] of students.entries()) {
      const {
        name,
        arabicName,
        school,
        className,
        nationality,
        iqamaNo,
        passportNo,
        expenses = 'paid',
        username,
        password,
        dob,
        classId, // Use the pre-resolved classId from the student object
      } = student;

      console.log(`Processing student ${index + 1}: ${name}, classId: ${classId}, className: ${className}`);

      let newStudent: any = null; // Declare newStudent here to ensure it's scoped correctly

      // Step 1: Create the student in the database
      try {
        newStudent = await prisma.student.create({
          data: {
            name,
            arabicName,
            school,
            nationality,
            iqamaNo,
            passportNo,
            expenses,
            username,
            password,
            dateOfBirth: dob,
            classId, // Use the resolved classId
          },
        });

        console.log('Student created in the database:', newStudent);
      } catch (error) {
        console.error(`Error creating student ${name} (row ${index + 1}):`, error);
        errors.push(`Failed to create student ${name} (row ${index + 1}): ${error.message}`);
        continue;
      }

      // Step 2: Create the user in Clerk
      try {
        const clerkResponse = await axios.post(
          'https://api.clerk.dev/v1/users',
          {
            email_addresses: [{ email_address: `${username}@yourdomain.com` }],
            first_name: name,
            username,
            password,
            public_metadata: { role: 'STUDENT', school },
            external_id: newStudent.id, // Use newStudent.id after ensuring it's defined
          },
          {
            headers: {
              Authorization: `Bearer ${clerkApiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log(`Clerk user created successfully for student: ${username}`, clerkResponse.data);
      } catch (clerkError) {
        if (axios.isAxiosError(clerkError)) {
          console.error(
            'Failed to create Clerk user for student ${name} (row ${index + 1}):',
            clerkError.response?.data || clerkError.message
          );
        } else if (clerkError instanceof Error) {
          console.error('Unexpected error:', clerkError.message);
        } else {
          console.error('An unknown error occurred:', clerkError);
        }

        // Clean up: Delete the student from the database if Clerk user creation fails
        if (newStudent) {
          await prisma.student.delete({ where: { id: newStudent.id } });
        }
        errors.push(`Failed to create Clerk user for student ${name} (row ${index + 1})`);
        continue;
      }

      createdStudents.push(newStudent);

      // Fetch subjects assigned to the class
      const classSubjects = await prisma.classSubject.findMany({
        where: { classId },
      });

      if (!classSubjects.length) {
        errors.push(`No subjects found for classId: ${classId} in row ${index + 1}`);
        continue;
      }

      // Prepare marks data for each subject and trimester
      const marksData = classSubjects.flatMap((subject) =>
        trimesters.map((trimester) => ({
          id: randomUUID(),
          studentId: newStudent.id,
          subjectId: subject.subjectId,
          academicYear,
          trimester,
          participation: 0,
          homework: 0,
          quiz: 0,
          project: 0,
          exam: 0,
          classActivities: 0,
          memorizing: 0,
          oral: 0,
          reading: 0,
        }))
      );

      // Insert all marks at once
      try {
        await prisma.mark.createMany({
          data: marksData,
          skipDuplicates: true,
        });
        console.log(`Marks created for student ${name} in class ${className} (row ${index + 1})`);
      } catch (error) {
        console.error(`Error creating marks for student ${name} (row ${index + 1}):`, error);
        errors.push(`Failed to create marks for student ${name} (row ${index + 1}): ${error.message}`);
        continue;
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join('\n'), createdStudents },
        { status: 207 }
      );
    }

    return NextResponse.json(
      { message: 'All students and Clerk users created successfully', students: createdStudents },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during bulk upload:', error);
    return NextResponse.json({ error: 'Error during bulk upload.' }, { status: 500 });
  }
}