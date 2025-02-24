import { getPrismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";


// Modify to accept query parameters (e.g. trimester)
export async function GET(request: Request) {
   const prisma = getPrismaClient()
  try {
    // Extract the trimester from the query parameters
    const url = new URL(request.url);
    const trimester = url.searchParams.get('trimester'); // Get the trimester from query params

    console.log("Trimester:", trimester);

    if (!trimester) {
      return NextResponse.json({ message: 'Trimester is required' }, { status: 400 });
    }

    // Fetch all teachers with their details, subjects, classes, and marks
    const teachers = await prisma.teacher.findMany({
      where: {
        role: 'TEACHER', // Ensure you're fetching only teachers
      },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
        classes: {
          include: {
            class: true, // Include the actual class name
            marks: {
              where: {
                trimester: trimester, // Filter marks by the selected trimester
              },
            },
          },
        },
      },
    });

    // Process progress data for each teacher
    const progressData = teachers.map((teacher) => {
      // Log teacher info
      console.log(`Processing teacher: ${teacher.name} (${teacher.id})`);

      // Filter for completed classes where all marks are filled and not zero
      const completedClasses = teacher.classes.filter((classTeacher) => {
        // Log info about the class and marks
        console.log(`Fetching marks for class: ${classTeacher.class.name}, trimester: ${trimester}, teacher ID: ${classTeacher.teacherId}`);

        // For each subject, check if all marks are filled
        const allMarksFilled = classTeacher.marks.length > 0 && classTeacher.marks.every((mark) => {
          return (
            mark.participation != null && mark.participation !== 0 &&
            mark.homework != null && mark.homework !== 0 &&
            mark.quiz != null && mark.quiz !== 0 &&
            // mark.project != null && mark.project !== 0 &&
            mark.exam != null && mark.exam !== 0
          );
        });

      
        return allMarksFilled;
      });

      // Now check for incomplete classes where marks are missing or zero
      const incompleteClasses = teacher.classes.filter((classTeacher) => {
        // Log info about marks in this class
      

        // Ensure marks are filtered by subject and trimester
        const subjectMarks = classTeacher.marks.filter((mark) => mark.subjectId); // Adjust subject filtering if necessary
        

        // Check if any marks are missing or zero
        return classTeacher.marks.length === 0 || classTeacher.marks.some((mark) => (
          mark.participation === 0 ||
          mark.homework === 0 ||
          mark.quiz === 0 ||
          // mark.project === 0 ||
          mark.exam === 0 
        ));
      });

      // Log the completed and incomplete classes for this teacher
      

      // Return the complete teacher object including details, subjects, and progress
      return {
        teacherId: teacher.id, // Teacher ID
        name: teacher.name, // Teacher name
        arabicName: teacher.arabicName, // Teacher Arabic name
        academicYear: teacher.academicYear, // Teacher's academic year
        email: teacher.email, // Teacher's email (or any other detail you want)
        role: teacher.role, // Teacher's role (in case needed)
        subjects: teacher.subjects.map((subject) => subject.subject.name), // Subjects taught by the teacher
        classesAssigned: teacher.classes.map((classTeacher) => classTeacher.class.name), // All classes assigned to the teacher
        completedClasses: completedClasses.map((classTeacher) => classTeacher.class.name), // Completed classes
        incompleteClasses: incompleteClasses.map((classTeacher) => classTeacher.class.name), // Incomplete classes
      };
    });

    // Return the combined data (teachers with details, subjects, classes, and progress information)
    return NextResponse.json(progressData);
  } catch (error) {
    console.error('Error fetching teachers with progress:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
