// Assuming you're using pdf-lib for PDF generation

// src/app/[locale]/api/downloadStudentReports/route.ts
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";  // Ensure correct path for your Prisma client
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reportIds } = body;
console.log(reportIds)
    if (!reportIds || !Array.isArray(reportIds)) {
      return NextResponse.json(
        { error: "Invalid or missing report IDs." },
        { status: 400 }
      );
    }

    // Fetch reports from the database
    const reports = await prisma.studentReport.findMany({
      where: {
        id: { in: reportIds },
      },
      include: {
        teacher: true,
        subject: true,
      },
    });

    if (!reports || reports.length === 0) {
      return NextResponse.json(
        { error: "No reports found for the provided IDs." },
        { status: 404 }
      );
    }

    // Generate PDF (previous logic)
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    reports.forEach((report) => {
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const fontSize = 12;

      page.drawText(`Student Report for ${report.studentId}`, {
        x: 50,
        y: height - 50,
        size: fontSize + 2,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(`Subject: ${report.subject?.name || "N/A"}`, {
        x: 50,
        y: height - 80,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(`Teacher: ${report.teacher?.name || "N/A"}`, {
        x: 50,
        y: height - 110,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(`Status: ${report.status || "N/A"}`, {
        x: 50,
        y: height - 140,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(`Comments: ${report.comment || "No comments"}`, {
        x: 50,
        y: height - 170,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=student-reports.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Internal Server Error while generating PDF." },
      { status: 500 }
    );
  }
}

