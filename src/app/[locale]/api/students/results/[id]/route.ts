import { getPrismaClient } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Student ID

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid student ID' });
  }

  try {
    const prisma=getPrismaClient()
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        marks: {
          include: {
            classTeacher: {
              include: {
                teacher: true,
                class: true,
              },
            },
            subject: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const resultData = {
      name: student.name,
      className: student.class.name,
      marks: student.marks.map((mark) => ({
        subjectName: mark.subject.name,
        handler: mark.homework,
        participation: mark.participation,
        quiz: mark.quiz,
        project: mark.project,
        exam: mark.exam,
        totalMarks: mark.totalMarks,
      })),
    };

    res.status(200).json(resultData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
