"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface Report {
  id: string;
  name: string;
  class: { id: string; name: string };
  reports: Array<{
    id: string;
    academicYear: string;
    comment: string;
    recommendations: string[];
    status: string;
    subject: { id: string; name: string; arabicName: string };
    teacher: { id: string; name: string; signature: string };
    trimester: string;
  }>;
}

const PrintForAll = ({ report }: { report: Report }) => {
  const t = useTranslations("report");

  if (!report) {
    return <div>No report data available</div>;
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

  // Iterate over the reports array and display each report.
  return (
    <div className="p-6 my-24 mx-auto print:p-6 print:m-0 max-w-7xl" dir="ltr">
      {/* Add the top box with student details */}
      <div className="border-4 border-[#CFCEFF] rounded-lg p-4 shadow-lg mb-6 bg-[#EDF9FD]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex items-center justify-center relative">
            <Image src="/forqan1.png" width={200} height={200} alt="Logo" className="absolute left-2 w-32" />
            <div className="font-bold">
              <p className="text-md text-center mb-4">AL FORQAN PRIVATE SCHOOL</p>
              <p className="text-md text-center mb-4">AMERICAN DIVISION</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-8 relative">
            <p className="font-bold flex items-center gap-6">
              <strong className="font-extrabold ">STUDENT'S NAME:</strong> {report.name}
            </p>
            <p className="font-semibold flex items-center gap-6">
              <strong className="font-extrabold">GRADE:</strong> {report.class.name}
            </p>
            {/* Make sure you have a date property */}
            <p className="font-semibold flex items-center gap-6">
              <strong className="font-extrabold">DATE:</strong> {/* Ensure 'date' property exists in your data */}
            </p>
          </div>
        </div>
        <p className="mt-4 italic p-4">
          <strong>NOTE TO PARENTS:</strong> This report offers an opportunity for better understanding of the student’s current achievement. Please study the comments below in order that steps can be taken to bring about progress, where needed, by the end of the period.
        </p>
      </div>

      {/* Student reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.reports?.map((reportItem, index) => {
          const arabicSubjects = ['Arabic', 'Social Arabic', 'Islamic'];
          const isArabicSubject = arabicSubjects.includes(reportItem.subject?.name);
          const direction = isArabicSubject ? 'rtl' : 'ltr';
          const terms = getTerms(reportItem.subject?.name);

          return (
            <div key={index} className={`border border-gray-300 rounded-lg p-6 shadow-lg even:bg-[#F1F0FF] odd:bg-[#FEFCE8]`} style={{ direction }}>
              <div className="mb-4 flex items-center justify-around mx-auto relative">
                <h3 className="text-xl font-bold mb-2">{terms.subject}: {isArabicSubject ? reportItem.subject?.arabicName : reportItem.subject?.name}</h3>
                <p className="text-lg mb-2 font-bold">
                  <strong>{terms.teacher}:</strong> {isArabicSubject ? reportItem.teacher?.arabicName : reportItem.teacher?.name}
                </p>
              </div>
              <p className="text-xl mb-4"><strong>{terms.status}: </strong><span className='font-bold underline'>{isArabicSubject ? t(reportItem.status) : reportItem.status || ''}</span></p>
              <p className="text-md mb-2"><strong>{terms.recommendations}:</strong> {reportItem.recommendations?.map((rec, idx) => <li key={idx}>{rec}</li>) || 'No Recommendations'}</p>
              <p className="text-md"><strong>{terms.comment}:</strong> {reportItem.comment || 'No Comment Provided'}</p>
              <div className='flex items-center justify-between mt-4'>
                <p className="text-md"><strong>{terms.quiz}: </strong><span className='font-bold'>{reportItem.quizScore || 'N/A'}</span></p>
                <p className="text-md"><strong>{terms.project}: </strong><span className='font-bold'>{reportItem.projectScore || 'N/A'}</span></p>
                <p className="flex items-center justify-center">
                  <span><strong>{terms.signature}: </strong></span>
                  <Image src={reportItem.teacher?.signature || ""} alt="signature" width={100} height={100} className='h-16 w-32' />
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrintForAll;
