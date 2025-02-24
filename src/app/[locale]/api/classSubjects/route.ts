import { getPrismaClient } from '@/lib/prisma';
import { randomUUID } from 'crypto';

// GET request - Fetch all classes, subjects, and teachers
export async function GET(request: Request) {
  try {
    const prisma = getPrismaClient();
    const classes = await prisma.class.findMany({
      include: {
        subjects: {
          include: { subject: true },
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
          grade: classItem.grade,
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
    const prisma = getPrismaClient();
    const { type, name, classId, subjectIds, grade, teacherIds, academicYear, arabicName } = await request.json();
    console.log("yourclassid", classId, academicYear);

    // Validate input
    if (!type) {
      return new Response(JSON.stringify({ error: 'Type is required' }), { status: 400 });
    }

    // Add a new class
    if (type === 'class' && name && grade) {
      const newClass = await prisma.class.create({
        data: { name, grade },
      });
      return new Response(JSON.stringify({ success: true, newClass }), { status: 201 });
    }

    // Add a new subject
    if (type === 'subject' && name && arabicName) {
      const newSubject = await prisma.subject.create({
        data: { name, arabicName },
      });
      return new Response(JSON.stringify({ success: true, newSubject }), { status: 201 });
    }

    // Assign subjects to a class
    if (type === 'assignSubjects' && classId && Array.isArray(subjectIds) && subjectIds.length > 0) {
      const assignments = await Promise.all(
        subjectIds.map((subjectId: string) =>
          prisma.classSubject.upsert({
            where: { classId_subjectId: { classId, subjectId } },
            update: {},
            create: { classId, subjectId },
          })
        )
      );
      return new Response(JSON.stringify({ success: true, assignments }), { status: 200 });
    }

    // Assign teachers to subjects in a class
    if (type === 'assignTeacher' && classId && Array.isArray(teacherIds) && teacherIds.length > 0) {
      const teacherAssignments = await Promise.all(
        teacherIds.map(async (teacherId: string) => {
          const teacherSubjects = await prisma.subjectTeacher.findMany({
            where: { teacherId },
            include: { subject: true },
          });

          if (teacherSubjects.length === 0) {
            throw new Error(`Teacher with ID ${teacherId} does not have any subjects assigned.`);
          }

          const subjectId = teacherSubjects[0].subjectId; // Use the first subject for simplicity

          return prisma.classTeacher.upsert({
            where: { classId_teacherId_subjectId: { classId, teacherId, subjectId } },
            update: {},
            create: { classId, teacherId, subjectId },
          });
        })
      );

      return new Response(JSON.stringify({ success: true, teacherAssignments }), { status: 200 });
    }

    // Generate marks for all students when subjects are assigned
    if (type === 'generateMarks' && classId && subjectIds && academicYear) {
      console.log(`Generating marks for classId: ${classId}, subjects: ${subjectIds}, academicYear: ${academicYear}`);

      const trimesters = ['First Trimester', 'Second Trimester', 'Third Trimester'];

      // Get all students for the class
      const students = await prisma.student.findMany({ where: { classId } });
      console.log(`Found ${students.length} students for class ${classId}`);

      // Get the subjects assigned to the class
      const classSubjects = await prisma.classSubject.findMany({
        where: { classId, subjectId: { in: subjectIds } },
      });
      console.log(`Found ${classSubjects.length} subjects for class ${classId}:`, classSubjects.map(s => s.subjectId));

      // Fetch class teachers for the given class and subjects
      const classTeachers = await prisma.classTeacher.findMany({
        where: {
          classId,
          subjectId: { in: subjectIds },
        },
      });
      console.log(`Found ${classTeachers.length} class teachers for class ${classId}:`, classTeachers.map(t => ({
        teacherId: t.teacherId,
        subjectId: t.subjectId,
        classTeacherId: t.id,
      })));

      // Validate that each subject has a teacher assigned
      const subjectTeacherMap = new Map<string, string>();
      for (const subjectId of subjectIds) {
        const teacher = classTeachers.find(t => t.subjectId === subjectId);
        if (!teacher) {
          console.warn(`No teacher assigned for subject ${subjectId} in class ${classId}`);
          throw new Error(`No teacher assigned for subject ${subjectId} in class ${classId}`);
        }
        subjectTeacherMap.set(subjectId, teacher.id);
        console.log(`Mapped subject ${subjectId} to classTeacherId ${teacher.id}`);
      }

      // Prepare marks data for each student, subject, and trimester
      const marksData = students.flatMap((student) =>
        classSubjects.flatMap((classSubject) => {
          const classTeacherId = subjectTeacherMap.get(classSubject.subjectId);

          if (!classTeacherId) {
            console.error(`No classTeacherId found for subject ${classSubject.subjectId} in class ${classId}`);
            return []; // Skip this subject if no teacher is assigned
          }

          // Ensure classTeacherId is always set
          console.log(`Generating marks for student ${student.id}, subject ${classSubject.subjectId}, classTeacherId ${classTeacherId}`);

          return trimesters.map((trimester) => ({
            id: randomUUID(),
            studentId: student.id,
            subjectId: classSubject.subjectId,
            classTeacherId: classTeacherId, // Ensure this is always set
            classId,
            academicYear,
            trimester,
            participation: 0, // Default to 0, can be updated later
            homework: 0,
            quiz: 0,
            project: 0,
            exam: 0,
          }));
        })
      );

      // Validate marksData before insertion
      if (marksData.length === 0) {
        console.warn('No marks data to insert as no valid teacher-subject assignments were found.');
        return new Response(JSON.stringify({ error: 'No valid teacher-subject assignments found for mark generation' }), { status: 400 });
      }

      // Log marks data before insertion
      console.log(`Inserting ${marksData.length} mark records:`, marksData.map(m => ({
        studentId: m.studentId,
        subjectId: m.subjectId,
        classTeacherId: m.classTeacherId,
        trimester: m.trimester,
      })));

      // Insert all marks at once
      await prisma.mark.createMany({
        data: marksData,
        skipDuplicates: true,
      });

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
}

// DELETE request - Delete a class
export async function DELETE(request: Request) {
  try {
    const prisma = getPrismaClient();
    const { classId } = await request.json();

    if (!classId) {
      return new Response(JSON.stringify({ error: 'Class ID is required' }), { status: 400 });
    }

    await prisma.classSubject.deleteMany({ where: { classId } });
    await prisma.classTeacher.deleteMany({ where: { classId } });
    await prisma.student.deleteMany({ where: { classId } });
    await prisma.mark.deleteMany({ where: { classId } });
    await prisma.class.delete({ where: { id: classId } });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error deleting class:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete class' }), { status: 500 });
  }
}