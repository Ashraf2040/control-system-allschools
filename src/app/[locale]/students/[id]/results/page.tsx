"use client";

import PrintButton from '@/app/[locale]/_components/PrintButton';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function StudentResultsPage({ params }: { params: { id: string } }) {
  const studentId = params.id;
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState("First Trimester"); // Changed to selectedOption for clarity

  // Fetch student data on mount
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`/api/student/${studentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch student data');
        }
        const data = await response.json();
        setStudentData(data);
      } catch (error) {
        console.error('Error fetching student data:', error);
        toast.error('Failed to load student data');
        setStudentData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!studentData) {
    return <p>Student not found.</p>;
  }

  const { name, class: classData, marks } = studentData;
console.log(studentData)
  // Calculate marks based on selected option
  let marksToViewOriginal;
  const schoolPrincipal ={
    forqan :"Abdulla Shaker Alghamdy",
    batool:"Boatool Principal",
    batool2:"Boatool2 Principal",
    faihaa:"Faihaa Principal",
  }

  if (selectedOption === "Yearly Result") {
    // Calculate average marks across all trimesters for Yearly Result
    const subjectAverages = marks.reduce((acc, mark) => {
      const subjectId = mark.subjectId;
      if (!acc[subjectId]) {
        acc[subjectId] = {
          subject: mark.subject,
          trimesters: [],
          totals: {
            participation: 0,
            homework: 0,
            quiz: 0,
            exam: 0,
            project: 0,
            classActivities: 0,
            reading: 0,
            memorizing: 0,
            oral: 0,
            totalMarks: 0,
          },
          count: 0,
        };
      }

      acc[subjectId].trimesters.push(mark);
      acc[subjectId].count += 1;

      // Accumulate totals for averaging
      ['participation', 'homework', 'quiz', 'exam', 'project', 'classActivities', 'reading', 'memorizing', 'oral'].forEach((header) => {
        acc[subjectId].totals[header] += mark[header] || 0;
      });
      acc[subjectId].totals.totalMarks += mark.totalMarks || 0;

      return acc;
    }, {});

    // Create averaged mark objects with ceiled values
    marksToViewOriginal = Object.values(subjectAverages).map((subjectData: any) => {
      const avgMark = { ...subjectData.trimesters[0] }; // Copy structure from first trimester mark
      const count = subjectData.count;

      // Calculate ceiled averages
      ['participation', 'homework', 'quiz', 'exam', 'project', 'classActivities', 'reading', 'memorizing', 'oral'].forEach((header) => {
        avgMark[header] = Math.ceil(subjectData.totals[header] / count);
      });
      avgMark.totalMarks = Math.ceil(subjectData.totals.totalMarks / count);

      return avgMark;
    });
  } else {
    // Filter normally for First, Second, and Third Trimester
    marksToViewOriginal = marks.filter((mark) => mark.trimester === selectedOption);
  }

  // Define priority subjects
  const prioritySubjects = ['Science', 'Math', 'Social Studies', 'English', 'ICT'];

  // Sort marks: priority subjects first, then others
  const marksToView = [...marksToViewOriginal].sort((a, b) => {
    const aIsPriority = prioritySubjects.includes(a.subject.name);
    const bIsPriority = prioritySubjects.includes(b.subject.name);

    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    if (aIsPriority && bIsPriority) {
      return prioritySubjects.indexOf(a.subject.name) - prioritySubjects.indexOf(b.subject.name);
    }
    return a.subject.name.localeCompare(b.subject.name);
  });

  const totalMarksSum = marksToView.reduce((sum, mark) => sum + (mark.totalMarks || 0), 0);
  const numberOfSubjects = marksToView.length;
  const averagePercentage =
    numberOfSubjects > 0 ? (totalMarksSum / (numberOfSubjects * 100)) * 100 : 0;

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

  const possibleHeaders = [
    'participation',
    'homework',
    'quiz',
    'exam',
    'project',
    'classActivities',
    'reading',
    'memorizing',
    'oral',
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
    oral: "Oral",
  };

  const getDisplayHeader = (header: string) => headerNameMapping[header] || header;

  const getActiveHeaders = (mark) =>
    possibleHeaders.filter(
      (header) => mark[header] !== null && mark[header] !== undefined && mark[header] !== 0
    );

  const groupSubjectsByHeaders = () => {
    const groups: { [key: string]: { marks: typeof marksToView; headers: string[] } } = {};

    marksToView.forEach((mark) => {
      const activeHeaders = getActiveHeaders(mark).join(',');
      if (!groups[activeHeaders]) {
        groups[activeHeaders] = { marks: [], headers: getActiveHeaders(mark) };
      }
      groups[activeHeaders].marks.push(mark);
    });

    const sortedGroups = Object.values(groups).sort((a, b) => {
      const aHasPriority = a.marks.some((mark) => prioritySubjects.includes(mark.subject.name));
      const bHasPriority = b.marks.some((mark) => prioritySubjects.includes(mark.subject.name));

      if (aHasPriority && !bHasPriority) return -1;
      if (!aHasPriority && bHasPriority) return 1;
      return a.marks[0].subject.name.localeCompare(b.marks[0].subject.name);
    });

    return sortedGroups;
  };

  const subjectGroups = groupSubjectsByHeaders();
const locale = useLocale();
  return (
    <div className="report-card relative p-6">
      <header className="report-header flex-col   flex items-center justify-center relative">
        <div className="mb-4 w-full relative flex justify-start items-center">
          <label htmlFor="trimester" className="mr-2 text-lg font-semibold">
            Select Trimester:
          </label>
          <select
            id="trimester"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="First Trimester">First Trimester</option>
            <option value="Second Trimester">Second Trimester</option>
            <option value="Third Trimester">Third Trimester</option>
            <option value="Yearly Result">Yearly Result</option>
          </select>
         
        </div>
        {/* <p className='absolute top-0 right-0 '/>{`${locale==="en"?`welcome : ${name}`:`مرحبا ${studentData.arabicName}`}`}<p/> */}
        <h1 className="text-5xl font-bold">
          <span className="text-extrabold text-3xl underline">
            {selectedOption === "Yearly Result" ? "Yearly" : selectedOption.split(' ')[0]}
          </span>{' '}
          {selectedOption === "Yearly Result" ? "Result" : "Trimester"} Notification For The Academic Year{' '}
          <span className="text-[#e16262]">2024/2025</span>
        </h1>
        <div className="absolute right-0 print:hidden">
          <PrintButton />
        </div>
      </header>

      <div>
        <table className="student-table w-full border-2 border-main mb-2">
          <thead className="px-2 relative">
            <tr className="grid grid-cols-6 even:bg-[#e0e0e0] mb-1">
              <td className="col-span-1 bg-main text-white border-main font-semibold px-2">
                Student Name :
              </td>
              <td className="col-span-2 font-semibold px-2">{name}</td>
              <td className="col-span-2 font-semibold px-2 text-right">{studentData.arabicName}</td>
              <td
                dir="rtl"
                className="col-span-1 bg-main text-white border-main font-semibold px-2 text-right"
              >
                اسم الطالب :
              </td>
            </tr>
            
            <tr className="grid grid-cols-6 even:bg-[#e0e0e0] mb-1">
              <td className="col-span-1 bg-main text-white font-semibold px-2">Birth Date :</td>
              <td className="col-span-2 font-semibold px-2">
                {studentData.dateOfBirth
                  ? new Date(studentData.dateOfBirth).toLocaleDateString()
                  : '12/12/2013'}
              </td>
              <td className="col-span-2 font-semibold px-2 text-right">
                {studentData.dateOfBirth
                  ? new Date(studentData.dateOfBirth).toLocaleDateString('ar-SA')
                  : '2013/12/12'}
              </td>
              <td
                dir="rtl"
                className="col-span-1 bg-main text-white font-semibold px-2 text-right"
              >
                تاريخ الميلاد :
              </td>
            </tr>
            <tr className="grid grid-cols-6 even:bg-[#e0e0e0] mb-1">
              <td className="col-span-1 bg-main text-white font-semibold px-2">
                ID / Iqama No :
              </td>
              <td className="col-span-2 font-semibold px-2">{studentData.iqamaNo || '123456789'}</td>
              <td className="col-span-2 font-semibold px-2 text-right">
                {studentData.iqamaNo || '123456789'}
              </td>
              <td
                dir="rtl"
                className="col-span-1 bg-main text-white font-semibold px-2 text-right"
              >
                رقم الهوية / الاقامة :
              </td>
            </tr>
            {/* <tr className="grid grid-cols-6 even:bg-[#e0e0e0]">
              <td className="col-span-1 bg-main text-white font-semibold px-2">Passport No :</td>
              <td className="col-span-2 font-semibold px-2">
                {studentData.passportNo || '0001200000'}
              </td>
              <td className="col-span-2 font-semibold px-2 text-right">
                {studentData.passportNo || '0001200000'}
              </td>
              <td
                dir="rtl"
                className="col-span-1 bg-main text-white font-semibold px-2 text-right"
              >
                رقم الجواز :
              </td>
            </tr> */}
            <div className="h-full w-1 bg-main absolute top-0 right-[50%]"></div>
          </thead>
        </table>

        <div className="overflow-x-auto">
          {subjectGroups.map((group, index) => (
            <table
              key={index}
              className="marks-table w-full text-center border-collapse border border-gray-300 mb-4"
            >
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
                        className={`border border-gray-300 px-2 py-1 w-1/12 ${
                          group.headers.includes(header) ? '' : 'hidden'
                        }`}
                      >
                        {mark[header] !== null && mark[header] !== undefined ? mark[header] : '-'}
                      </td>
                    ))}
                    <td className="border border-gray-300 px-2 py-1">
                      {mark.totalMarks !== null && mark.totalMarks !== undefined
                        ? mark.totalMarks
                        : '-'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {calculateGrade(mark.totalMarks)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      </div>

      <div className="MEDAL w-2/5 flex gap-8 items-center justify-center mx-auto">
        <div className="flex flex-col gap-3 items-center justify-center">
          <p className="text-xl">Average</p>
          <Image src="/1medal.png" alt="Medal" width={100} height={100} className="relative" />
          <p className="absolute font-semibold text-red-900">{averagePercentage.toFixed(1)}%</p>
        </div>
        <div className="flex gap-3 flex-col items-center justify-center">
          <p className="text-xl">Total</p>
          <Image src="/1medal.png" alt="Medal" width={100} height={100} className="relative" />
          <p className="absolute font-semibold text-red-900">{totalMarksSum}</p>
        </div>
      </div>
      <table className="w-full min-h-fit border-main border-2">
        <thead>
          <tr className="grid grid-cols-4">
            <th className="col-span-1 border-2 border-main py-4">Grade Scale</th>
            <th className="col-span-2 border-2 py-4 border-main">
              <p>This document is not the final result but a notification of the Trimester grades.</p>
              <p>* Any alteration or addition to this document is prohibited. *</p>
            </th>
            <th className="col-span-1 border-2 py-4 border-main">
              <p>School Principal</p>
              <p>{studentData.school ==="forqan"?"Mr/":"Ms/"} {schoolPrincipal[studentData?.school] }</p>
              <p>.............................</p>
            </th>
          </tr>
        </thead>
      </table>
    </div>
  );
}