import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function DELETE(request: Request) {
  try {
    const prisma = getPrismaClient();
    const { id } = await request.json();
console.log("teacherId",id)
    // Delete teacher's class and subject assignments
    await prisma.classTeacher.deleteMany({
      where: { teacherId: id },
    });

    await prisma.subjectTeacher.deleteMany({
      where: { teacherId: id },
    });
    await prisma.studentReport.deleteMany({
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
