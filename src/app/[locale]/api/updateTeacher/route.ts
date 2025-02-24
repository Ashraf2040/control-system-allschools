import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const prisma = getPrismaClient();
    const data = await request.json();
    const { id, name, academicYear, classes, subjects, classId } = data;

    // Ensure teacher exists
    const teacherExists = await prisma.teacher.findUnique({ where: { id } });
    if (!teacherExists) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 400 });
    }

    await prisma.teacher.update({
      where: { id },
      data: { name, academicYear },
    });

    // Handle class assignments
    const currentClassTeachers = await prisma.classTeacher.findMany({
      where: { teacherId: id },
      select: { classId: true },
    });
    const currentClassIds = currentClassTeachers.map((ct) => ct.classId);
    const newClassIds = classes || [];
    const classesToRemove = currentClassIds.filter((cid) => !newClassIds.includes(cid));

    if (classesToRemove.length > 0) {
      await prisma.classTeacher.deleteMany({
        where: { teacherId: id, classId: { in: classesToRemove } },
      });
    }

    const newClassTeachers = newClassIds.filter((cid) => !currentClassIds.includes(cid));
    for (const cid of newClassTeachers) {
      await prisma.classTeacher.create({
        data: { teacherId: id, classId: cid },
      });
    }

    // Handle subject assignments
    const currentSubjectTeachers = await prisma.subjectTeacher.findMany({
      where: { teacherId: id },
      select: { subjectId: true },
    });
    const currentSubjectIds = currentSubjectTeachers.map((st) => st.subjectId);
    const newSubjectIds = (subjects || []).filter((sid: string) => !currentSubjectIds.includes(sid)); // Define newSubjectIds here
    const subjectsToRemove = currentSubjectIds.filter((sid) => !(subjects || []).includes(sid));

    if (subjectsToRemove.length > 0) {
      await prisma.subjectTeacher.deleteMany({
        where: { teacherId: id, subjectId: { in: subjectsToRemove } },
      });
    }

    // Upsert new subjects
    for (const subjectId of newSubjectIds) {
      await prisma.subjectTeacher.upsert({
        where: {
          subjectId_teacherId_classId: {
            subjectId,
            teacherId: id,
            classId: classId || null,
          },
        },
        update: {},
        create: {
          subjectId,
          teacherId: id,
          classId: classId || null,
        },
      });
    }

    return NextResponse.json({ message: 'Teacher updated successfully' });
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add DELETE route for teacher deletion
export async function DELETE(request: Request) {
  try {
    const prisma = getPrismaClient();
    const { id } = await request.json();

    const teacherExists = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacherExists) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 400 });
    }

    // Delete ClassTeacher and SubjectTeacher associations, but marks remain intact
    await prisma.classTeacher.deleteMany({
      where: { teacherId: id },
    });
    await prisma.subjectTeacher.deleteMany({
      where: { teacherId: id },
    });

    // Delete the teacher
    await prisma.teacher.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
  
  
