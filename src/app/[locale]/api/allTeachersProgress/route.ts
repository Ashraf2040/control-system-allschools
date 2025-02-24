import { getPrismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const prisma = getPrismaClient();
  try {
    const url = new URL(request.url);
    const trimester = url.searchParams.get("trimester");

    console.log("Requested Trimester:", trimester);
    if (!trimester) {
      return NextResponse.json({ message: "Trimester is required" }, { status: 400 });
    }

    const teachers = await prisma.teacher.findMany({
      where: { role: "TEACHER" },
      include: {
        subjects: { include: { subject: true } },
        classes: {
          include: {
            class: true,
            marks: {
              where: { trimester: { equals: trimester, mode: "insensitive" } },
            },
          },
        },
      },
    });

    console.log(`Found ${teachers.length} teachers.`);

    const progressData = teachers.map((teacher) => {
      console.log(`\nProcessing teacher: ${teacher.name} (ID: ${teacher.id})`);

      const teacherSubjects = teacher.subjects.map((s) => ({
        id: s.subjectId.toString(), // Ensure subjectId is a string for consistent comparison
        name: s.subject.name,
      }));
      console.log(
        `Assigned Subjects:`,
        teacherSubjects.map((s) => `${s.name} (ID: ${s.id})`).join(", ")
      );
      const teacherSubjectIds = teacherSubjects.map((s) => s.id);

      const assignedClasses = teacher.classes.map((c) => c.class.name);
      console.log(`Assigned Classes: ${assignedClasses.join(", ") || "None"}`);

      const completedClasses = teacher.classes.filter((classTeacher) => {
        console.log(`\nEvaluating Class: ${classTeacher.class.name} (ClassTeacher ID: ${classTeacher.id})`);

        // Log all marks before filtering
        console.log(
          `All Marks for Class:`,
          classTeacher.marks.map((m) => ({
            subjectId: m.subjectId.toString(), // Ensure subjectId is a string
            participation: m.participation,
            homework: m.homework,
            quiz: m.quiz,
            exam: m.exam,
          }))
        );
        console.log("classTeacherMarks is", classTeacher.marks);

        const relevantMarks = classTeacher.marks.filter((mark) => {
          const markSubjectId = mark.subjectId.toString(); // Normalize to string
          console.log(`Checking mark subjectId: ${markSubjectId}, against teacherSubjectIds:`, teacherSubjectIds);
          return teacherSubjectIds.includes(markSubjectId);
        });
        console.log("relevantMarks", relevantMarks);
        console.log(
          `Relevant Marks for Teacher's Subjects:`,
          relevantMarks.map((m) => ({
            subjectId: m.subjectId.toString(),
            participation: m.participation,
            homework: m.homework,
            quiz: m.quiz,
            exam: m.exam,
          }))
        );

        // Check if quiz and exam are non-null and non-zero for completion
        const allQuizAndExamFilled =
          relevantMarks.length > 0 &&
          relevantMarks.every(
            (mark) => mark.quiz != null && mark.quiz > 0 && mark.exam != null && mark.exam > 0
          );

        console.log(`Class: ${classTeacher.class.name}, All Quiz and Exam Filled: ${allQuizAndExamFilled}`);
        console.log(
          `Reason: ${
            relevantMarks.length === 0
              ? "No relevant marks found"
              : allQuizAndExamFilled
              ? "All quiz and exam marks are non-null and non-zero"
              : "Some quiz or exam marks are missing or zero"
          }`
        );
        return allQuizAndExamFilled;
      });

      const incompleteClasses = teacher.classes.filter((classTeacher) => {
        console.log(`\nEvaluating Class for Incomplete: ${classTeacher.class.name} (ClassTeacher ID: ${classTeacher.id})`);

        console.log(
          `All Marks for Class (Incomplete Check):`,
          classTeacher.marks.map((m) => ({
            subjectId: m.subjectId.toString(),
            participation: m.participation,
            homework: m.homework,
            quiz: m.quiz,
            exam: m.exam,
          }))
        );

        const relevantMarks = classTeacher.marks.filter((mark) => {
          const markSubjectId = mark.subjectId.toString();
          return teacherSubjectIds.includes(markSubjectId);
        });
        console.log(
          `Relevant Marks for Teacher's Subjects (Incomplete Check):`,
          relevantMarks.map((m) => ({
            subjectId: m.subjectId.toString(),
            participation: m.participation,
            homework: m.homework,
            quiz: m.quiz,
            exam: m.exam,
          }))
        );

        const isIncomplete =
          relevantMarks.length === 0 ||
          relevantMarks.some((mark) => mark.quiz === 0 || mark.quiz == null || mark.exam === 0 || mark.exam == null);

        console.log(`Class: ${classTeacher.class.name}, Is Incomplete: ${isIncomplete}`);
        console.log(
          `Reason: ${
            relevantMarks.length === 0
              ? "No relevant marks found"
              : isIncomplete
              ? "Some quiz or exam marks are missing or zero"
              : "All quiz and exam marks are complete"
          }`
        );
        return isIncomplete;
      });

      const teacherData = {
        teacherId: teacher.id,
        name: teacher.name,
        arabicName: teacher.arabicName,
        academicYear: teacher.academicYear,
        email: teacher.email,
        role: teacher.role,
        subjects: teacherSubjects.map((s) => s.name),
        classesAssigned: assignedClasses,
        completedClasses: completedClasses.map((c) => c.class.name),
        incompleteClasses: incompleteClasses.map((c) => c.class.name),
      };
      console.log(`Teacher Progress Data:`, teacherData);
      return teacherData;
    });

    return NextResponse.json(progressData);
  } catch (error) {
    console.error("Error fetching teachers with progress:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}