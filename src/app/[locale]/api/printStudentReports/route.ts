import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.getAll("id"); // Get all IDs from query params

  if (!ids || ids.length === 0) {
    return NextResponse.json({ error: "No report IDs provided." }, { status: 400 });
  }

  try {
    // Fetch the reports from the database
    const reports = await prisma.studentReport.findMany({
      where: {
        studentId: { in: ids },
      },
      include: {
        subject: true, // Include subject details
        teacher: true, // Include teacher details
      },
    });

    // Filter out completely empty reports
    const validReports = reports.filter((report) => report);

    // Check if valid reports are empty
    if (!validReports || validReports.length === 0) {
      return NextResponse.json(
        { error: "No valid reports found for the given IDs." },
        { status: 404 }
      );
    }

    // Generate an HTML page with the valid reports for printing
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Reports</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .report { border: 1px solid #ddd; margin-bottom: 20px; padding: 15px; border-radius: 8px; }
          .header { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
          .details { font-size: 16px; margin-bottom: 5px; }
        </style>
      </head>
      <body>
        ${validReports
          .map(
            (report) => `
            <div class="report">
              <div class="header">Report for Student: ${report.studentId}</div>
              <div class="details"><strong>Subject:</strong> ${report.subject?.name || "Unknown Subject"}</div>
              <div class="details"><strong>Teacher:</strong> ${report.teacher?.name || "Unknown Teacher"}</div>
              <div class="details"><strong>Status:</strong> ${report.status || "Not Provided"}</div>
              <div class="details"><strong>Comments:</strong> ${report.comment || "No comments provided."}</div>
              <div class="details"><strong>Project Score:</strong> ${report.projectScore || "N/A"}</div>
              <div class="details"><strong>Quiz Score:</strong> ${report.quizScore || "N/A"}</div>
            </div>
          `
          )
          .join("")}
      </body>
      </html>
    `;

    return new Response(htmlContent, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports due to a server error." },
      { status: 500 }
    );
  }
}
