import {prisma} from './src/lib/prisma';  // adjust the path based on your project structure

async function testInsert() {
  try {
    const mark = await prisma.mark.create({
      data: {
        studentId: "240",  // Replace with a valid student ID
        subjectId: "3",  // Replace with a valid subject ID
        classTeacherId: "4",  // Replace with a valid class teacher ID
      },
    });
    console.log("Mark inserted successfully", mark);
  } catch (error) {
    console.error("Error inserting mark:", error);
  }
}

testInsert();
