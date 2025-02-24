import { getPrismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const prisma = getPrismaClient();
  try {
    const url = new URL(request.url);
    const trimester = url.searchParams.get('trimester');

    if (!trimester) {
      return NextResponse.json({ message: 'Trimester is required' }, { status: 400 });
    }

    console.log(`Fetching teacher progress for trimester: ${trimester}`);

    // Fetch all teachers with their assigned classes and subjects
    const teachers = await prisma.teacher.findMany({
      where: {
        role: 'TEACHER',
      },
      include: {
        subjects: {
          include: {
            subject: true, // Include subject details
          },
        },
        classes: {
          include: {
            class: true, // Include class details
            marks: {
              where: {
                trimester: trimester,
              },
              include: {
                subject: true, // Include the subject tied to each mark
              },
            },
          },
        },
      },
    });

    console.log(`Found ${teachers.length} teachers.`);

    const progressData = teachers.map((teacher) => {
      // Log basic teacher info
      console.log(`Processing Teacher: ${teacher.name} (ID: ${teacher.id})`);

      // Get all assigned classes
      const assignedClasses = teacher.classes.map((classTeacher) => classTeacher.class.name);
      console.log(`Assigned Classes: ${assignedClasses.join(', ')}`);

      // Get subjects taught by the teacher
      const teacherSubjects = teacher.subjects.map((s) => ({
        id: s.subjectId,
        name: s.subject.name,
      }));
      console.log(`Teacher Subjects: ${teacherSubjects.map((s) => s.name).join(', ')}`);

      // Determine completed and incomplete classes based on subject marks
      const completedClasses = teacher.classes
        .filter((classTeacher) => {
          const classMarks = classTeacher.marks;
          console.log(
            `Class: ${classTeacher.class.name}, Marks: `,
            classMarks.map((m) => ({
              subject: m.subject.name,
              participation: m.participation,
              homework: m.homework,
              quiz: m.quiz,
              exam: m.exam,
            }))
          );

          // Check if all subjects taught by the teacher in this class have complete marks
          const subjectsInClass = classMarks.map((m) => m.subjectId);
          const teacherSubjectsInClass = teacherSubjects.filter((s) =>
            subjectsInClass.includes(s.id)
          );

          console.log(
            `Subjects in Class ${classTeacher.class.name} taught by teacher:`,
            teacherSubjectsInClass.map((s) => s.name)
          );

          if (teacherSubjectsInClass.length === 0) {
            console.log(`No subjects taught by ${teacher.name} in ${classTeacher.class.name}`);
            return false; // No subjects assigned, so not completed
          }

          // Check if all marks for teacher's subjects are complete
          const isCompleted = teacherSubjectsInClass.every((subject) => {
            const subjectMarks = classMarks.filter((m) => m.subjectId === subject.id);
            if (subjectMarks.length === 0) {
              console.log(`No marks for subject ${subject.name} in ${classTeacher.class.name}`);
              return false;
            }

            const allMarksComplete = subjectMarks.every(
              (mark) =>
                mark.participation != null &&
                mark.participation > 0 &&
                mark.homework != null &&
                mark.homework > 0 &&
                mark.quiz != null &&
                mark.quiz > 0 &&
                mark.exam != null &&
                mark.exam > 0
            );

            console.log(
              `Subject ${subject.name} in ${classTeacher.class.name} - All Marks Complete: ${allMarksComplete}`
            );
            return allMarksComplete;
          });

          console.log(`Class ${classTeacher.class.name} - Is Completed: ${isCompleted}`);
          return isCompleted;
        })
        .map((classTeacher) => classTeacher.class.name);

      // Incomplete classes: those with missing or incomplete marks for teacher's subjects
      const incompleteClasses = teacher.classes
        .filter((classTeacher) => {
          const classMarks = classTeacher.marks;

          const subjectsInClass = classMarks.map((m) => m.subjectId);
          const teacherSubjectsInClass = teacherSubjects.filter((s) =>
            subjectsInClass.includes(s.id)
          );

          if (teacherSubjectsInClass.length === 0) {
            return true; // No subjects assigned, so incomplete
          }

          const isIncomplete = teacherSubjectsInClass.some((subject) => {
            const subjectMarks = classMarks.filter((m) => m.subjectId === subject.id);
            if (subjectMarks.length === 0) {
              return true; // No marks for this subject
            }

            return subjectMarks.some(
              (mark) =>
                mark.participation == null ||
                mark.participation <= 0 ||
                mark.homework == null ||
                mark.homework <= 0 ||
                mark.quiz == null ||
                mark.quiz <= 0 ||
                mark.exam == null ||
                mark.exam <= 0
            );
          });

          console.log(`Class ${classTeacher.class.name} - Is Incomplete: ${isIncomplete}`);
          return isIncomplete;
        })
        .map((classTeacher) => classTeacher.class.name);

      const teacherData = {
        teacherId: teacher.id,
        name: teacher.name,
        arabicName: teacher.arabicName,
        academicYear: teacher.academicYear,
        email: teacher.email,
        role: teacher.role,
        subjects: teacherSubjects.map((s) => s.name),
        classesAssigned: assignedClasses,
        completedClasses,
        incompleteClasses,
      };

      console.log(`Teacher Progress Data: `, teacherData);
      return teacherData;
    });

    return NextResponse.json(progressData);
  } catch (error) {
    console.error('Error fetching teachers with progress:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}