import { getPrismaClient } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto'; // Import randomUUID for generating unique IDs

// const prisma = new PrismaClient();

// GET request - Fetch all classes, subjects, and teachers
export async function GET(request: Request) {
  try {
     const prisma = getPrismaClient()
    const classes = await prisma.class.findMany({
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    const subjects = await prisma.subject.findMany();
    const teachers = await prisma.teacher.findMany();

    return new Response(
      JSON.stringify({
        classes: classes.map((classItem) => ({
          id: classItem.id,
          name: classItem.name,
          subjects: classItem.subjects.map((item) => item.subject),
        })),
        subjects,
        teachers,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response(JSON.stringify({ error: 'Error fetching data' }), { status: 500 });
  }
}

// POST request - Add class, add subject, assign subjects, assign teachers, or generate marks
export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient()
    const { type, name, classId, subjectIds, teacherIds, academicYear,arabicName } = await request.json();

    // Validate input
    if (!type) {
      return new Response(JSON.stringify({ error: 'Type is required' }), { status: 400 });
    }

    // Add a new class
    if (type === 'class' && name) {
      const newClass = await prisma.class.create({
        data: { name,grade:"1" },
      });
      return new Response(JSON.stringify({ success: true, newClass }), { status: 201 });
    }

    // Add a new subject
    if (type === 'subject' && name&&arabicName) {
      const newSubject = await prisma.subject.create({
        data: {
          name,
          arabicName: arabicName,
        },
      });
      return new Response(JSON.stringify({ success: true, newSubject }), { status: 201 });
    }

    // Assign subjects to a class
    if (type === 'assignSubjects' && classId && Array.isArray(subjectIds) && subjectIds.length > 0) {
      const assignments = await Promise.all(
        subjectIds.map((subjectId: string) =>
          prisma.classSubject.upsert({
            where: {
              classId_subjectId: { classId, subjectId },
            },
            update: {},
            create: { classId, subjectId },
          })
        )
      );
      return new Response(JSON.stringify({ success: true, assignments }), { status: 200 });
    }

    // Assign teachers to subjects in a class
    if (type === 'assignTeacher' && classId && Array.isArray(teacherIds) && teacherIds.length > 0) {
      // Loop through each teacherId and assign the teacher to the class with their subject
      const teacherAssignments = await Promise.all(
        teacherIds.map(async (teacherId: string) => {
          // Fetch the subject(s) assigned to the teacher
          const teacherSubjects = await prisma.subjectTeacher.findMany({
            where: { teacherId },
            include: { subject: true }, // Include subject details if needed
          });
    
          // Ensure the teacher has at least one subject assigned
          if (teacherSubjects.length === 0) {
            throw new Error(`Teacher with ID ${teacherId} does not have any subjects assigned.`);
          }
    
          // For simplicity, assume the first subject assigned to the teacher
          const subjectId = teacherSubjects[0].subjectId;
    
          // Create or update the classTeacher record with the classId, teacherId, and subjectId
          return prisma.classTeacher.upsert({
            where: {
              classId_teacherId_subjectId: { classId, teacherId, subjectId }, // Ensure uniqueness
            },
            update: {},
            create: {
              classId,
              teacherId,
              subjectId, // Include the subjectId in the record
            },
          });
        })
      );
    
      return new Response(JSON.stringify({ success: true, teacherAssignments }), { status: 200 });
    }
    
    

    // Generate marks for all students when subjects are assigned
    if (type === 'generateMarks' && classId && subjectIds && academicYear) {
      try {
        const trimesters = ['First Trimester', 'Second Trimester', 'Third Trimester'];
    
        // Get all students for the class
        const students = await prisma.student.findMany({
          where: { classId },
        });
    
        // Get the subjects assigned to the class
        const classSubjects = await prisma.classSubject.findMany({
          where: { classId, subjectId: { in: subjectIds } },
        });
    
        // Fetch class teachers for the given class and subjects
        const classTeachers = await prisma.classTeacher.findMany({
          where: {
            classId,
            subjectId: { in: subjectIds },
          },
        });
    
        // Prepare a map of subjectId to classTeacherId for faster lookup
        const classTeacherMap = classTeachers.reduce((map, teacher) => {
          if (teacher.subjectId) { // Check if subjectId is not null
            map[teacher.subjectId] = teacher.id;
          }
          return map;
        }, {} as Record<string, string>);
    
        // Prepare marks data for each student, subject, and trimester
        const marksData = students.flatMap((student) =>
          classSubjects.flatMap((classSubject) => {
            const classTeacherId = classTeacherMap[classSubject.subjectId];
    
            // Skip creating marks if no class teacher is assigned for this subject
            if (!classTeacherId) {
              console.log(
                `Skipping marks creation for subject ${classSubject.subjectId} as no teacher is assigned.`
              );
              return [];
            }
    
            // Create marks for each trimester
            return trimesters.map((trimester) => ({
              id: randomUUID(),
              studentId: student.id,
              subjectId: classSubject.subjectId,
              classTeacherId, // Assign the correct classTeacherId
              academicYear,
              trimester,
              participation: 0,
              homework: 0,
              quiz: 0,
              project: 0,
             exam: 0,
            }));
          })
        );
    
        // Insert all marks at once
        if (marksData.length > 0) {
          await prisma.mark.createMany({
            data: marksData,
            skipDuplicates: true, // Avoid duplication errors
          });
        } else {
          console.log('No marks data to insert as no teacher was assigned to any subject.');
        }
    
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      } catch (error) {
        console.error('Error processing request:', error);
        return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
      }
    }
    

    // Handle invalid input
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
}
