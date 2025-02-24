import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.getAll("id");

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
        subject: true,
        teacher: true,
      },
    });

    // Filter out completely empty reports
    const validReports = reports.filter((report) => report);

    if (!validReports || validReports.length === 0) {
      return NextResponse.json(
        { error: "No valid reports found for the given IDs." },
        { status: 404 }
      );
    }

    const getTerms = (subjectName: string) => {
      const arabicSubjects = ['Arabic', 'Social Arabic', 'Islamic'];
      if (arabicSubjects.includes(subjectName)) {
        return {
          subject: 'المادة',
          teacher: 'المعلم',
          status: 'مستوي الطالب',
          recommendations: 'بعض التوصيات',
          comment: 'تعليق',
          signature: 'التوقيع',
          project: 'المشروع',
          quiz: 'الاختبار الفتري',
        };
      } else {
        return {
          subject: 'Subject',
          teacher: 'Teacher',
          status: 'Status',
          recommendations: 'Recommendations',
          comment: 'Comment',
          signature: 'Signature',
          project: 'Project',
          quiz: 'Quiz',
        };
      }
    };

    const sortedReports = validReports.sort((a, b) => {
      const arabicSubjects = ['Arabic', 'Social Arabic', 'Islamic'];
      const isAArabic = arabicSubjects.includes(a.subject.name);
      const isBArabic = arabicSubjects.includes(b.subject.name);
      return isAArabic === isBArabic ? 0 : isAArabic ? 1 : -1;
    });

    // Generate HTML content for printing
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Student Reports</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .report { border: 1px solid #ddd; margin-bottom: 20px; padding: 15px; border-radius: 8px; }
          .header { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
          .details { font-size: 16px; margin-bottom: 5px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .note { font-style: italic; margin-top: 20px; }
          .bordered { border: 2px solid #ddd; padding: 10px; border-radius: 8px; }
          .highlight { background-color: #FEFCE8; }
          .report .details strong { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="grid">
          ${sortedReports.map((report) => {
            const terms = getTerms(report.subject.name);
            const isArabicSubject = ['Arabic', 'Social Arabic', 'Islamic'].includes(report.subject.name);
            return `
              <div class="report bordered ${isArabicSubject ? 'highlight' : ''}" dir="${isArabicSubject ? 'rtl' : 'ltr'}">
                <div class="header">
                  <strong>${terms.subject}:</strong> ${isArabicSubject ? report.subject.arabicName : report.subject.name}
                </div>
                <div class="details"><strong>${terms.teacher}:</strong> ${isArabicSubject ? report.teacher.arabicName : report.teacher.name}</div>
                <div class="details"><strong>${terms.status}:</strong> <span class="font-bold underline">${isArabicSubject ? report.status : report.status || ''}</span></div>
                <div class="details"><strong>${terms.recommendations}:</strong> ${report.recommendations?.join(', ') || 'No Recommendations'}</div>
                <div class="details"><strong>${terms.comment}:</strong> ${report.comment || 'No Comment Provided'}</div>
                <div class="details"><strong>${terms.quiz}:</strong> ${report.quizScore || 'N/A'}</div>
                <div class="details"><strong>${terms.project}:</strong> ${report.projectScore || 'N/A'}</div>
                <div class="details">
                  <strong>${terms.signature}:</strong>
                  <img src="${report.teacher.signature || ''}" alt="signature" width="100" height="100" />
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="note">
          <strong>NOTE TO PARENTS:</strong> This report offers an opportunity for better understanding of the student’s current achievement. Please study the comments below in order that steps can be taken to bring about progress, where needed, by the end of the period.
        </div>
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
