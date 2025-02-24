import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  try {
    const prisma = getPrismaClient();
    // Fetch all teachers with their related classes and marks information
    const teachers = await prisma.teacher.findMany({
      where: { role: 'TEACHER' },
      include: {
        // Including classes and the related marks for each class
        classes: {
          include: {
            class: true,  // Include class details
            marks: true,  // Include marks related to each class
          },
        },
      },
    });

    console.log(teachers)
    // Mapping through each teacher to process their progress
    const progressData = teachers.map((teacher) => {
      
      // Filtering completed classes where all marks are filled for students
      const completedClasses = teacher.classes.filter((classTeacher) => {
        if (classTeacher.marks.length === 0) {
         
          return false; // No marks, incomplete
        }

        // Checking if all marks are filled for all students in the class
        const allMarksFilled = classTeacher.marks.every((mark) => {
          const isFilled = (
            mark.participation != null && mark.participation > 0 &&
            mark.homework != null && mark.homework > 0 &&
            mark.quiz != null && mark.quiz > 0 &&
            mark.exam != null && mark.exam > 0
          );
  
          return isFilled;
        });

      
        return allMarksFilled;
      });

      // Filtering classes with missing marks
      const incompleteClasses = teacher.classes.filter((classTeacher) => {
        if (classTeacher.marks.length === 0) {
     
          return true; // No marks, incomplete
        }

        // Checking if any student has missing marks
        const hasMissingMarks = classTeacher.marks.some((mark) => {
          const isMissing = (
            mark.participation == null || mark.participation === 0 ||
            mark.homework == null || mark.homework === 0 ||
            mark.quiz == null || mark.quiz === 0 ||
            mark.exam == null || mark.exam === 0
          );
          return isMissing;
        });

       
        return hasMissingMarks;
      });

      // Returning teacher's name and the list of completed/incomplete classes
      return {
        teacherName: teacher.name,
        teacherId: teacher.id, // Including teacher ID for context
        completed: completedClasses.map((classTeacher) => classTeacher.class.name),
        incomplete: incompleteClasses.map((classTeacher) => classTeacher.class.name),
        // Optionally, include marks here if needed for each class
        marks: teacher.classes.map((classTeacher) => ({
          className: classTeacher.class.name,
          marks: classTeacher.marks,
        })),
      };
    });

    
    return NextResponse.json(progressData);
  } catch (error) {
    console.error('Error fetching teachers progress:', error);
    return NextResponse.error();
  }
}
