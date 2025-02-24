import PrintButton from '@/app/[locale]/_components/PrintButton';
import { getStudentWithMarks } from '@/lib/actions';
import Image from 'next/image';
import React, { Suspense } from 'react';

export default async function StudentResultsPage({ params }: { params: { id: string } }) {
  const studentId = params.id;
  const studentData = await getStudentWithMarks(studentId);

  if (!studentData) {
    return <p>Student not found.</p>;
  }

  const { name, class: classData, marks } = studentData;

  // Filter for First Trimester only
  const marksToViewOriginal = marks.filter((mark) => mark.trimester === "First Trimester");

  // Define priority subjects
  const prioritySubjects = ['Science', 'Math', 'Social Studies', 'English', 'ICT'];

  // Sort marks: priority subjects first, then others
  const marksToView = [...marksToViewOriginal].sort((a, b) => {
    const aIsPriority = prioritySubjects.includes(a.subject.name);
    const bIsPriority = prioritySubjects.includes(b.subject.name);

    if (aIsPriority && !bIsPriority) return -1; // a comes first
    if (!aIsPriority && bIsPriority) return 1;  // b comes first
    if (aIsPriority && bIsPriority) {
      // Within priority subjects, maintain order from prioritySubjects array
      return prioritySubjects.indexOf(a.subject.name) - prioritySubjects.indexOf(b.subject.name);
    }
    // For non-priority subjects, keep original order or sort alphabetically
    return a.subject.name.localeCompare(b.subject.name);
  });

  const totalMarksSum = marksToView.reduce((sum, mark) => sum + (mark.totalMarks || 0), 0);
  const numberOfSubjects = marksToView.length;
  const averagePercentage = numberOfSubjects > 0 
    ? (totalMarksSum / (numberOfSubjects * 100)) * 100 
    : 0;

  const calculateGrade = (totalMarks: number | null) => {
    if (!totalMarks) return "-";
    if (totalMarks >= 96) return "A+";
    if (totalMarks >= 93) return "A";
    if (totalMarks >= 89) return "A-";
    if (totalMarks >= 86) return "B+";
    if (totalMarks >= 83) return "B";
    if (totalMarks >= 79) return "B-";
    if (totalMarks >= 76) return "C+";
    if (totalMarks >= 73) return "C";
    if (totalMarks >= 69) return "C-";
    if (totalMarks >= 66) return "D+";
    if (totalMarks >= 63) return "D";
    if (totalMarks >= 60) return "D-";
    return "F";
  };

  // All possible headers from the database
  const possibleHeaders = [
    'participation',
    'homework',
    'quiz',
    'exam',
    'project',
    'classActivities',
    'reading',
    'memorizing',
    'oral'
  ];

  const headerNameMapping = {
    participation: "Participation",
    homework: "Homework",
    quiz: "Quiz",
    exam: "Exam",
    project: "Project",
    classActivities: "Class Activities",
    reading: "Reading",
    memorizing: "Memorizing",
    oral: "Oral"
  };

  const getDisplayHeader = (header: string) => headerNameMapping[header] || header;

  // Function to get active headers for a specific mark (exclude headers with 0 or null/undefined values)
  const getActiveHeaders = (mark) => {
    return possibleHeaders.filter(header => 
      mark[header] !== null && mark[header] !== undefined && mark[header] !== 0
    );
  };

  // Group subjects by their active headers naturally, ensuring subjects with identical headers are grouped together
  const groupSubjectsByHeaders = () => {
    const groups: { [key: string]: { marks: typeof marksToView, headers: string[] } } = {};

    marksToView.forEach(mark => {
      const activeHeaders = getActiveHeaders(mark).join(',');
      if (!groups[activeHeaders]) {
        groups[activeHeaders] = { marks: [], headers: getActiveHeaders(mark) };
      }
      groups[activeHeaders].marks.push(mark);
    });

    // Sort groups to maintain priority subjects first, then alphabetically by subject name
    const sortedGroups = Object.values(groups).sort((a, b) => {
      const aHasPriority = a.marks.some(mark => prioritySubjects.includes(mark.subject.name));
      const bHasPriority = b.marks.some(mark => prioritySubjects.includes(mark.subject.name));

      if (aHasPriority && !bHasPriority) return -1;
      if (!aHasPriority && bHasPriority) return 1;
      // If both have priority or neither, sort by first subject name
      return a.marks[0].subject.name.localeCompare(b.marks[0].subject.name);
    });

    return sortedGroups;
  };

  const subjectGroups = groupSubjectsByHeaders();

  return (
    <div className="report-card relative">
      <header className="report-header flex-col pt-24 flex items-center justify-center relative">
        <h1 className="text-5xl font-bold">
          <span className="text-extrabold text-3xl underline">1st</span> Trimester Result Notification For The Academic Year <span className="text-[#e16262]">2024/2025</span>
        </h1>
        <div className='absolute right-0 print:hidden'>
          <PrintButton />
        </div>
      </header>

      <Suspense fallback={<p>Loading table data...</p>}>
        <div>
          <table className="student-table w-full border-2 border-main mb-2">
            <thead className="px-2 relative">
              <tr className="grid grid-cols-6 even:bg-[#e0e0e0] mb-1">
                <td className="col-span-1 bg-main text-white border-main font-semibold px-2">Student Name :</td>
                <td className="col-span-2 font-semibold px-2">{name}</td>
                <td className="col-span-2 font-semibold px-2 text-right">{studentData.arabicName}</td>
                <td dir='rtl' className="col-span-1 bg-main text-white border-main font-semibold px-2 text-right">اسم الطالب :</td>
              </tr>
              <tr className="grid grid-cols-6 even:bg-[#e0e0e0] mb-1">
                <td className="col-span-1 bg-main text-white font-semibold px-2">Nationality :</td>
                <td className="col-span-2 font-semibold px-2">{studentData.nationality}</td>
                <td className="col-span-2 font-semibold px-2 text-right">{studentData.nationality}</td>
                <td dir='rtl' className="col-span-1 bg-main text-white font-semibold px-2 ">الجنسية :</td>
              </tr>
              <tr className="grid grid-cols-6 even:bg-[#e0e0e0] mb-1">
                <td className="col-span-1 bg-main text-white font-semibold px-2">Birth Date :</td>
                <td className="col-span-2 font-semibold px-2">12/12/2013</td>
                <td className="col-span-2 font-semibold px-2 text-right">2013/12/12</td>
                <td dir='rtl' className="col-span-1 bg-main text-white font-semibold px-2 text-right">تاريخ الميلاد :</td>
              </tr>
              <tr className="grid grid-cols-6 even:bg-[#e0e0e0] mb-1">
                <td className="col-span-1 bg-main text-white font-semibold px-2">ID / Iqama No :</td>
                <td className="col-span-2 font-semibold px-2">123456789</td>
                <td className="col-span-2 font-semibold px-2 text-right">123456789</td>
                <td dir='rtl' className="col-span-1 bg-main text-white font-semibold px-2 text-right">رقم الهوية / الاقامة :</td>
              </tr>
              <tr className="grid grid-cols-6 even:bg-[#e0e0e0] ">
                <td className="col-span-1 bg-main text-white font-semibold px-2">Passport No :</td>
                <td className="col-span-2 font-semibold px-2">0001200000</td>
                <td className="col-span-2 font-semibold px-2 text-right">0001200000</td>
                <td dir='rtl' className="col-span-1 bg-main text-white font-semibold px-2 text-right">رقم الجواز :</td>
              </tr>
              <div className='h-full w-1 bg-main absolute top-0 right-[50%]'></div>
            </thead>
          </table>

          <div className='overflow-x-auto'>
            {/* Multiple tables for different subject groups with shared headers */}
            {subjectGroups.map((group, index) => (
              <table key={index} className="marks-table w-full text-center border-collapse border border-gray-300 mb-4">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 w-[15%]">Subject</th>
                    {group.headers.map((header) => (
                      <th key={header} className="border border-gray-300 px-2 py-1 w-1/12">
                        {getDisplayHeader(header)}
                      </th>
                    ))}
                    <th className="border border-gray-300 px-2 py-1 w-1/12">Total</th>
                    <th className="border border-gray-300 px-2 py-1 w-1/12">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {group.marks.map((mark) => (
                    <tr key={mark.id}>
                      <td className="border border-gray-300 px-2 py-1">{mark.subject.name}</td>
                      {possibleHeaders.map((header) => (
                        <td 
                          key={header} 
                          className={`border border-gray-300 px-2 py-1 w-1/12 ${group.headers.includes(header) ? '' : 'hidden'}`}
                        >
                          {mark[header] !== null && mark[header] !== undefined ? mark[header] : "-"}
                        </td>
                      ))}
                      <td className="border border-gray-300 px-2 py-1">{mark.totalMarks || "-"}</td>
                      <td className="border border-gray-300 px-2 py-1">{calculateGrade(mark.totalMarks)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        </div>
      </Suspense>

      <div className="MEDAL w-2/5 flex gap-8 items-center justify-center mx-auto">
        <div className="flex flex-col gap-3 items-center justify-center">
          <p className="text-xl">Average</p>
          <Image src="/1medal.png" alt="Medal" width={100} height={100} className='relative' />
          <p className='absolute font-semibold text-red-900'>{averagePercentage.toFixed(1)}%</p>
        </div>
        <div className="flex gap-3 flex-col items-center justify-center">
          <p className="text-xl">Total</p>
          <Image src="/1medal.png" alt="Medal" width={100} height={100} className='relative' />
          <p className='absolute font-semibold text-red-900'>{totalMarksSum}</p>
        </div>
      </div>
    </div>
  );
}