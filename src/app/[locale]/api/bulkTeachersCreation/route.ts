import { NextResponse } from "next/server";
import { parse } from "csv-parse";
import { Readable } from "stream";
import axios from "axios";
import { getPrismaClient } from "@/lib/prisma";

const clerkApiKey = "sk_test_eE2ZdMoVVr5taX4XRBm7NWuBRIP0BLgCcTXRWWGQg6";

export async function POST(request: Request) {
  const prisma = getPrismaClient();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer.toString());

    const teachers: any[] = [];
    await new Promise((resolve, reject) => {
      stream
        .pipe(
          parse({
            columns: true,
            trim: true,
            skip_empty_lines: true,
          })
        )
        .on("data", (row) => {
          console.log("Parsed row:", row);
          teachers.push({
            name: row.name,
            arabicName: row.arabicName,
            email: row.email,
            username: row.username,
            password: row.password,
            role: row.role || "TEACHER",
            academicYear: row.academicYear,
            subjects: row.subjects ? row.subjects.split(",").map((s: string) => s.trim()) : [],
            school: row.school,
            signature: row.signature || null,
          });
        })
        .on("end", resolve)
        .on("error", reject);
    });

    if (teachers.length === 0) {
      return NextResponse.json({ error: "No valid data found in CSV" }, { status: 400 });
    }

    console.log("Teachers to process:", teachers);

    const createdTeachers = [];
    const failedTeachers = [];

    for (const teacherData of teachers) {
      try {
        const newTeacher = await prisma.teacher.create({
          data: {
            name: teacherData.name,
            email: teacherData.email,
            password: teacherData.password,
            school: teacherData.school,
            academicYear: teacherData.academicYear,
            signature: teacherData.signature,
            arabicName: teacherData.arabicName,
            username: teacherData.username,
            role: teacherData.role,
            subjects: {
              create: await Promise.all(
                teacherData.subjects.map(async (subjectName: string) => {
                  const subject = await prisma.subject.upsert({
                    where: { name: subjectName },
                    update: {},
                    create: { name: subjectName, arabicName: subjectName },
                  });
                  return { subject: { connect: { id: subject.id } } };
                })
              ),
            },
          },
        });

        try {
          const clerkResponse = await axios.post(
            "https://api.clerk.dev/v1/users",
            {
              email_addresses: [{ email_address: teacherData.email }],
              first_name: teacherData.name,
              username: teacherData.username,
              password: teacherData.password,
              public_metadata: { role: teacherData.role, school: teacherData.school },
              external_id: newTeacher.id,
            },
            {
              headers: {
                Authorization: `Bearer ${clerkApiKey}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log(`Clerk user created for ${teacherData.email}`, clerkResponse.data);
        } catch (clerkError) {
          console.error(`Clerk error for ${teacherData.email}:`, clerkError.response?.data || clerkError.message);
          await prisma.teacher.delete({ where: { id: newTeacher.id } });
          failedTeachers.push({ email: teacherData.email, error: "Clerk user creation failed" });
          continue;
        }

        createdTeachers.push(newTeacher);
      } catch (error) {
        console.error(`Error processing teacher ${teacherData.email}:`, error);
        failedTeachers.push({ email: teacherData.email, error: error.message || "Unknown error" });
        continue;
      }
    }

    return NextResponse.json({
      message: `Successfully created ${createdTeachers.length} out of ${teachers.length} teachers`,
      failed: teachers.length - createdTeachers.length,
      failedTeachers,
    });
  } catch (error) {
    console.error("Error in bulk teacher creation:", error);
    return NextResponse.json({ error: "Failed to process CSV", details: error.message }, { status: 500 });
  }
}