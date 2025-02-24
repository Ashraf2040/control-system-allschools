import { prisma } from '../src/lib/prisma';

async function main() {
  // Create Subjects
  const math = await prisma.subject.create({ data: { name: 'Math' } });
  const science = await prisma.subject.create({ data: { name: 'Science' } });

  // Create Teachers
  const teacher1 = await prisma.teacher.create({
    data: {
      email: 'teacher1@example.com',
      password: 'password123',
      name: 'Teacher One',
      subjects: { create: [{ subjectId: math.id }, { subjectId: science.id }] },
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      email: 'teacher2@example.com',
      password: 'password456',
      name: 'Teacher Two',
      subjects: { create: [{ subjectId: science.id }] },
    },
  });

  // Create Classes and assign to teachers
  const class1 = await prisma.class.create({ data: { name: 'Class 1' } });
  const class2 = await prisma.class.create({ data: { name: 'Class 2' } });

  await prisma.classTeacher.create({
    data: {
      teacherId: teacher1.id,
      classId: class1.id,
    },
  });

  await prisma.classTeacher.create({
    data: {
      teacherId: teacher2.id,
      classId: class2.id,
    },
  });

  // Add students to classes
  const student1 = await prisma.student.create({
    data: {
      name: 'Student One',
      classId: class1.id,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      name: 'Student Two',
      classId: class2.id,
    },
  });

  // Add marks for students in specific class-teacher association
  await prisma.mark.create({
    data: {
      participation: 8,
      behavior: 9,
      workingQuiz: 7,
      project: 10,
      finalExam: 9,
      totalMarks: 43,
      studentId: student1.id,
      classTeacherId: (await prisma.classTeacher.findFirst({ where: { teacherId: teacher1.id, classId: class1.id } }))!.id,
    },
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
