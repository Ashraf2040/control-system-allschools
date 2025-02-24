"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useTrail } from '@react-three/drei';
import { useTranslations } from 'next-intl';
import ReportCard from '../../_components/ReportCard';


const StudentFullReport = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [studentName, setStudentName] = useState<string>('');
  const [studentGrade, setStudentGrade] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [noteToParents, setNoteToParents] = useState<string>('');
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("Progress");

  const arabicStauts = {
    Excellent: 'ممتاز',
    Good: 'جيد',
    Average: 'متوسط',
    BelowAverage: 'اقل من المتوسط',
  };

  useEffect(() => {
    const fetchStudentReports = async () => {
      try {
        const response = await fetch(`/api/getStudentFullReport/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch student reports');
        const data = await response.json();
        setStudentName(data[0]?.studentName || 'Unknown Student');
        setStudentGrade(data[0]?.class?.name || 'Unknown Grade');
        setDate(new Date(data[0]?.createdAt).toLocaleDateString('en-GB') || 'Date Not Provided');
        setNoteToParents('This report offers an opportunity for better understanding of the student\'s current achievement. Please study the comments below in order that steps can be taken to bring about progress, where needed, by the end of the period.');
        setReports(data);
      } catch (error) {
        toast.error('Error fetching student report.');
      }
    };

    fetchStudentReports();
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

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
        Excellent: 'ممتاز',
        Good: 'جيد',
        Average: 'متوسط',
        BelowAverage: 'اقل من المتوسط',
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

  const sortedReports = reports.sort((a, b) => {
    const arabicSubjects = ['Arabic', 'Social Arabic', 'Islamic'];
    const isAArabic = arabicSubjects.includes(a.subject.name);
    const isBArabic = arabicSubjects.includes(b.subject.name);
    return isAArabic === isBArabic ? 0 : isAArabic ? 1 : -1;
  });

  return (
    <div className="px-6 py-2 mx-auto print:p-2 print:m-0 max-w-6xl" dir="ltr">
      <div className="border-4 border-[#CFCEFF] rounded-lg p-4 shadow-lg mb-2 bg-[#EDF9FD]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex items-center justify-center relative">
            <Image src="/forqan1.png" width={100} height={100} alt="Logo" className="absolute left-2 w-20" />
            <div className="font-bold">
              <p className="text-md text-center mb-4">AL FORQAN PRIVATE SCHOOL</p>
              <p className="text-md text-center mb-4">AMERICAN DIVISION</p>
            </div>
          </div>

          <div className="flex flex-col gap-1 relative">
            <button onClick={handlePrint} className="absolute right-0 font-bold py-1 px-3 rounded print:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
                />
              </svg>
            </button>
            <p className="font-bold flex items-center gap-6">
              <strong className="font-extrabold ">STUDENT'S NAME:</strong> {studentName}
            </p>
            <p className="font-semibold flex items-center gap-6">
              <strong className="font-extrabold">GRADE:</strong> {studentGrade}
            </p>
            <p className="font-semibold flex items-center gap-6">
              <strong className="font-extrabold">DATE:</strong> {date.replace(/\//g, '-')}
            </p>
          </div>
        </div>
        <p className="italic mt-2">
          <strong>NOTE TO PARENTS:</strong> {noteToParents}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {sortedReports?.map((report, index) => {
          const arabicSubjects = ['Arabic', 'Social Arabic', 'Islamic'];
          const isArabicSubject = arabicSubjects.includes(report.subject.name);
          const direction = isArabicSubject ? 'rtl' : 'ltr';
          const terms = getTerms(report.subject.name);
          return (
           <ReportCard key={index} report={report} index={index} direction={direction} terms={terms} isArabicSubject={isArabicSubject} arabicStauts={arabicStauts} />
          );
        })}
      </div>
    </div>
  );
};

export default StudentFullReport;