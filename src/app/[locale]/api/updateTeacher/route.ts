import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
    try {
      const prisma = getPrismaClient();
      const data = await request.json();
      const { id, name, academicYear, classes, subjects } = data;
    
      // Ensure teacher exists before proceeding
      const teacherExists = await prisma.teacher.findUnique({
        where: { id }, // Ensure we use the unique ID field
      });
    
      if (!teacherExists) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 400 });
      }
    
      // Step 1: Update the teacher's name and academic year
      await prisma.teacher.update({
        where: { id },
        data: { name, academicYear },
      });
    
      // Fetch current associations (same as before)
      const currentClassTeachers = await prisma.classTeacher.findMany({
        where: { teacherId: id },
        select: { classId: true },
      });
    
      const currentSubjectTeachers = await prisma.subjectTeacher.findMany({
        where: { teacherId: id },
        select: { subjectId: true },
      });
    
      // Remove old associations (same as before)
      const currentClassIds = currentClassTeachers.map((ct) => ct.classId);
      const newClassIds = classes;
      const classesToRemove = currentClassIds.filter(
        (classId) => !newClassIds.includes(classId)
      );
    
      const currentSubjectIds = currentSubjectTeachers.map((st) => st.subjectId);
      const newSubjectIds = subjects;
      const subjectsToRemove = currentSubjectIds.filter(
        (subjectId) => !newSubjectIds.includes(subjectId)
      );
    
      // Update ClassTeacher associations for removed classes (test teacher ID or null)
      const testTeacher = await prisma.teacher.findUnique({
        where: { id: 'test-teacher-id' }, // Make sure to use a valid test teacher ID here
      });
    
      if (classesToRemove.length > 0) {
        await prisma.classTeacher.updateMany({
          where: {
            teacherId: id,
            classId: { in: classesToRemove },
          },
          data: {
            teacherId: testTeacher ? testTeacher.id : null, // Assign a valid teacher or null
          },
        });
      }
    
      // Remove old SubjectTeacher relationships (same as before)
      if (subjectsToRemove.length > 0) {
        await prisma.subjectTeacher.deleteMany({
          where: {
            teacherId: id,
            subjectId: { in: subjectsToRemove },
          },
        });
      }
    
      // Add new ClassTeacher associations for new classes (same as before)
      const newClassTeachers = newClassIds.filter(
        (classId) => !currentClassIds.includes(classId)
      );
    
      for (const classId of newClassTeachers) {
        await prisma.classTeacher.create({
          data: {
            teacherId: id,
            classId,
          },
        });
        // Create marks logic here...
      }
    
      // Add new SubjectTeacher associations for new subjects (same as before)
      for (const subjectId of newSubjectIds) {
        await prisma.subjectTeacher.upsert({
          where: {
            subjectId_teacherId: { subjectId, teacherId: id },
          },
          update: {},
          create: {
            subjectId,
            teacherId: id,
          },
        });
      }
    
      return NextResponse.json({ message: 'Teacher updated successfully' });
    } catch (error) {
      console.error('Error updating teacher:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  
