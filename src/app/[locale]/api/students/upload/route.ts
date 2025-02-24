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

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();
    const { fileContent, academicYear } = await request.json();
    console.log(academicYear);

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

    for (const row of records) {
      let cleanedDob: string | null = null;
      if (row.dob) {
        const cleaned = cleanDate(row.dob);
        if (isValidDate(cleaned)) {
          cleanedDob = cleaned;
        } else {
          errors.push(`Invalid date format for dob in row: ${JSON.stringify(row)}`);
          continue;
        }
      }

      if (!row.name || !row.className || !academicYear) {
        errors.push(`Missing required fields (name, className, academicYear) in row: ${JSON.stringify(row)}`);
        continue;
      }

      students.push({
        ...row,
        dob: cleanedDob ? new Date(cleanedDob) : null,
      });
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('\n') }, { status: 400 });
    }

    const createdStudents = [];
    const trimesters = ['First Trimester', 'Second Trimester', 'Third Trimester'];

    for (const student of students) {
      const {
        name,
        arabicName,
        school,
        className, // Use className (e.g., "1A", "5C")
        nationality,
        iqamaNo,
        passportNo,
        expenses = 'paid',
        username,
        password,
        dob,
      } = student;

      // Look up the class by className only (since 'school' isn't in Class model)
      const classRecord = await prisma.class.findFirst({
        where: {
          name: className, // Matches the 'name' field in your Class table (e.g., "1A", "5C")
        },
      });

      if (!classRecord) {
        errors.push(`Class not found for className: ${className}`);
        continue;
      }

      const classId = classRecord.id; // Get the classId from the found record

      // Step 1: Create the student in the database
      const newStudent = await prisma.student.create({
        data: {
          name,
          arabicName,
          school, // Store school in Student (as per your schema)
          nationality,
          iqamaNo,
          passportNo,
          expenses,
          username,
          password,
          dateOfBirth: dob,
          classId: classId, // Use resolved classId
        },
      });

      console.log('Student created in the database:', newStudent);

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
            external_id: newStudent.id,
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

        await prisma.student.delete({ where: { id: newStudent.id } });
        errors.push(`Failed to create Clerk user for student: ${username}`);
        continue;
      }

      createdStudents.push(newStudent);

      // Fetch subjects assigned to the class
      const classSubjects = await prisma.classSubject.findMany({
        where: { classId },
      });

      if (!classSubjects.length) {
        errors.push(`No subjects found for classId: ${classId}`);
        continue;
      }

      // Prepare marks data for each subject and trimester
      const marksData = classSubjects.flatMap(subject =>
        trimesters.map(trimester => ({
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
      await prisma.mark.createMany({
        data: marksData,
        skipDuplicates: true,
      });
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