
import { getStudentWithMarks } from '@/lib/actions';
import Image from 'next/image';
import { Suspense } from 'react';
import PrintButton from '../../_components/PrintButton';

export default async function StudentResultsPage({ params }: { params: { id: string } }) {
  const studentId = params.id;
  const studentData = await getStudentWithMarks(studentId);

  if (!studentData) {
    return <p>Student not found.</p>;
  }

  const { name, class: classData, marks,expenses} = studentData;

  const marksToView = marks.filter((mark) => mark.trimester === "First Trimester");
  console.log(studentData)
  // Check if the student has an unpaid expense
  if (expenses === "unpaid") {
    return (
      <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-6 rounded shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-500">
          There is a Financial Issue .
        </h1>
        <p className='mt-4 font-semibold'>Please contact the admin for further assistance.</p>
      </div>
    </div>
    );
  }

  // Calculate the total marks and average
  const totalMarksSum = marks.reduce((sum, mark) => sum + mark.totalMarks, 0);
  const numberOfSubjects = marks.length;
  const averagePercentage = (totalMarksSum / (numberOfSubjects * 100)) * 100;

  const calculateGrade = (totalMarks: number) => {
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
    return "Below B-";
  };

  return (
    <div className="report-card relative ">
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
              <tr className="grid grid-cols-6  even:bg-[#e0e0e0] mb-1">
                <td className="col-span-1 bg-main text-white border-main font-semibold px-2">Student Name :</td>
                <td className="col-span-2 font-semibold px-2">{name}</td>
                <td className="col-span-2 font-semibold px-2 text-right">{name}</td>
                <td dir='rtl' className="col-span-1 bg-main text-white border-main font-semibold px-2 text-right">اسم الطالب :</td>
              </tr>
              <tr className="grid grid-cols-6 even:bg-[#e0e0e0] mb-1">
                <td className="col-span-1 bg-main text-white font-semibold px-2">Nationality :</td>
                <td className="col-span-2 font-semibold px-2">Saudi</td>
                <td className="col-span-2 font-semibold px-2 text-right">سعودي</td>
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

          <div className='overflow-x-scroll'>
            <table className="marks-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Participation</th>
                  <th>Behavior</th>
                  <th>Quiz</th>
                  <th>Project</th>
                  <th>Exam</th>
                  <th>Total Marks</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {marksToView.map((mark) => {
                  const { participation, behavior, workingQuiz, project, finalExam, totalMarks } = mark;
                  const grade = calculateGrade(totalMarks ?? 0);

                  return (
                    <tr key={mark.id}>
                      <td>{mark.subject.name}</td>
                      <td>{participation}</td>
                      <td>{behavior}</td>
                      <td>{workingQuiz}</td>
                      <td>{project}</td>
                      <td>{finalExam}</td>
                      <td>{totalMarks}</td>
                      <td>{grade}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
              <p>Mr. Abdulla Shaker Alghamdy</p>
              <p>.............................</p>
            </th>
          </tr>
        </thead>
      </table>
    </div>
  );
}
