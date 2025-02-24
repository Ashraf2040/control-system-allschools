'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Class, Student, Teacher } from '@prisma/client';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import CountdownWrapper from '../_components/CountdownWrapper';
import { useLocale, useTranslations } from 'next-intl';
import Loader from '../_components/Loader';

interface MarkHeaderConfig {
  headers: string[];
  maxValues: Record<string, number>;
}

interface StudentMark {
  [key: string]: number | undefined;
}

const TeacherPage: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [academicYear, setAcademicYear] = useState<string>('');
  const [trimester, setTrimester] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [fetchedClasses, setFetchedClasses] = useState<Class[]>([]);
  const [marks, setMarks] = useState<{ [studentId: string]: StudentMark }>({});
  const [teacherDetails, setTeacherDetails] = useState<Teacher | null>(null);
  const [headerConfig, setHeaderConfig] = useState<MarkHeaderConfig | null>(null);

  const academicYears = ['2024-2025', '2025-2026'];
  const trimesters = ['First Trimester', 'Second Trimester', 'Third Trimester'];

  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('teacher');

  // Mapping from display headers to database field names
  const headerToFieldMap: Record<string, string> = {
    "Participation": "participation",
    "Homework": "homework",
    "Project": "project",
    "Class Activities": "classActivities", // Ensure this matches your DB field
    "Exam": "exam",
    "Quiz": "quiz",
  };

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      if (!user) return;
      try {
        const response = await fetch(`/api/teachers?teacherId=${user?.externalId ?? user?.id}`);
        if (!response.ok) throw new Error('Failed to fetch teacher details');
        const teacherData = await response.json();
        setTeacherDetails(teacherData);
        if (teacherData.subjects.length === 1) {
          setSelectedSubject(teacherData.subjects[0].subjectId);
        }
      } catch (error) {
        console.error(error);
        toast.error('Error fetching teacher details.');
      }
    };
    fetchTeacherDetails();
  }, [user]);

  const fetchClasses = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/classes?teacherId=${teacherId}`);
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setFetchedClasses(data);
    } catch (error) {
      console.error(error);
      toast.error('Error fetching classes.');
    }
  };

  const fetchHeaderConfig = async (subjectId: string, classId: string) => {
    try {
      const classResponse = await fetch(`/api/classes?classId=${classId}&teacherId=${user?.externalId ?? user?.id}`);
      if (!classResponse.ok) throw new Error('Failed to fetch class data');
      const classData = await classResponse.json();
    console.log(classData)
      const grade = classData.filter(item => item.classId === selectedClassId)[0].class.grade
 console.log(grade)
      const response = await fetch(`/api/mark-header-config?subjectId=${subjectId}&grade=${grade}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch header config');
      return null;
    }
  };

  useEffect(() => {
    if (user?.externalId) {
      fetchClasses(user.externalId ?? user.id);
    }
  }, [user?.externalId]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId || !selectedSubject || !academicYear || !trimester || !user?.id) return;
      setLoading(true);
      try {
        const response = await fetch(
          `/api/students?classId=${selectedClassId}&subjectId=${selectedSubject}&academicYear=${academicYear}&trimester=${trimester}`
        );
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error(error);
        toast.error('Error fetching students.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClassId, selectedSubject, academicYear, trimester, user?.id]);
console.log(headerConfig?.headers)
  useEffect(() => {
    if (students.length > 0 && headerConfig) {
      const initialMarks: { [studentId: string]: StudentMark } = {};
      students.forEach((student) => {
        const mark = student.marks.find((m) => m.subjectId === selectedSubject) || {};
        initialMarks[student.id] = {};
        headerConfig.headers.forEach((header) => {
          const field = headerToFieldMap[header]; // Map to DB field
          initialMarks[student.id][header] = mark[field] !== undefined ? mark[field] : 0;
        });
      });
      setMarks(initialMarks);
      console.log('Initial marks:', initialMarks); // Debug
    }
  }, [students, selectedSubject, headerConfig]);

  useEffect(() => {
    const loadHeaderConfig = async () => {
      if (selectedSubject && selectedClassId) {
        const config = await fetchHeaderConfig(selectedSubject, selectedClassId);
        setHeaderConfig(config);
      }
    };
    loadHeaderConfig();
  }, [selectedSubject, selectedClassId]);

  const handleMarkChange = (studentId: string, header: string, value: string) => {
    const maxValue = headerConfig?.maxValues[header] || Infinity;
    const newValue = value === '' ? 0 : Number(value);
    const validatedValue = newValue < 0 ? 0 : newValue;

    if (validatedValue > maxValue) {
      toast.error(`Max value for ${header} is ${maxValue}`);
      return;
    }

    setMarks((prevMarks) => ({
      ...prevMarks,
      [studentId]: {
        ...prevMarks[studentId],
        [header]: validatedValue,
      },
    }));
  };

  const fillAllMarks = (header: string) => {
    const maxValue = headerConfig?.maxValues[header] || 0;
    setMarks((prevMarks) => {
      const updatedMarks = { ...prevMarks };
      students.forEach((student) => {
        updatedMarks[student.id] = {
          ...updatedMarks[student.id],
          [header]: maxValue,
        };
      });
      return updatedMarks;
    });
  };

  const resetAllMarks = (header: string) => {
    setMarks((prevMarks) => {
      const updatedMarks = { ...prevMarks };
      students.forEach((student) => {
        updatedMarks[student.id] = {
          ...updatedMarks[student.id],
          [header]: 0,
        };
      });
      return updatedMarks;
    });
  };

  const calculateTotalMarks = (studentId: string): number => {
    if (!headerConfig) return 0;
    const studentMarks = marks[studentId] || {};
    return headerConfig.headers.reduce(
      (total, header) => total + (studentMarks[header] || 0),
      0
    );
  };

  const handleSaveMarks = async () => {
    setLoading(true);
    try {
      const responses = await Promise.all(
        students.map((student) => {
          const studentMarks = marks[student.id];
          const normalizedMarks: { [key: string]: number } = {};
          headerConfig!.headers.forEach((header) => {
            const field = headerToFieldMap[header];
            normalizedMarks[field] = studentMarks[header] || 0;
          });
          return fetch(`/api/students/${student.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              markId: student.marks[0]?.id,
              ...normalizedMarks,
              academicYear,
              trimester,
            }),
          });
        })
      );

      if (responses.some((response) => !response.ok)) {
        throw new Error('Failed to update marks');
      }
      toast.success(`${locale === 'en' ? 'Marks updated successfully!' : 'تم حفظ الدرجات بنجاح'}`);
    } catch (error) {
      console.error(error);
      toast.error('Error updating marks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToProgressReport = () => {
    if (!selectedClassId || !selectedSubject || !academicYear || !trimester) {
      toast.error('Please select all required fields to proceed.');
      return;
    }

    const className = fetchedClasses?.find((c) => c.class.id === selectedClassId)?.class.name || '';
    const teacherName = teacherDetails?.name || '';
    const subjectName = teacherDetails?.subjects[0]?.subject.name || '';

    const queryParams = new URLSearchParams({
      class: className,
      teacherName,
      trimester,
      subject: subjectName,
      teacherId: teacherDetails?.id || '',
    });
    router.push(`/studentsProgress?${queryParams.toString()}`);
  };

  const handleCountdownEnd = () => {
    setIsCountdownFinished(true);
    toast.error('Marks Modification closed. Please contact the admin!');
  };

  if (isCountdownFinished) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-6 rounded shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-500">Marks Modification Closed</h1>
          <p>Please contact the admin for further assistance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 min-h-screen">
      {loading && <Loader />}
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mx-auto shadow-lg mb-4 px-4 flex-wrap rounded-lg">
        <h1 className="text-lg py-2 font-bold bg-main md:w-fit w-full text-center text-white md:py-1 px-4 my-6 rounded-md">
          {t('greeting', { name: locale === 'en' ? teacherDetails?.name : teacherDetails?.arabicName })}
        </h1>
        <p className="md:text-xl font-bold text-main mb-2">
          {t('subject')}: <span className="text-red-500">{locale === 'en' ? teacherDetails?.subjects[0]?.subject.name : teacherDetails?.subjects[0]?.subject.arabicName}</span>
        </p>
        <h2 className="mb-2">
          <CountdownWrapper onCountdownEnd={handleCountdownEnd} />
        </h2>
      </div>

      <div className="flex my-4 justify-center text-main font-semibold gap-4 md:gap-8 lg:gap-12 items-center flex-wrap">
        <div className="w-full md:w-fit">
          <select
            id="academicYear"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">{t('selectAcademicYear')}</option>
            {academicYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-fit">
          <select
            id="trimester"
            value={trimester}
            onChange={(e) => setTrimester(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">{t('selectTrimester')}</option>
            {trimesters.map((trimesterOption) => (
              <option key={trimesterOption} value={trimesterOption}>{trimesterOption}</option>
            ))}
          </select>
        </div>
        {teacherDetails?.subjects.length > 1 && (
          <div className="hidden">
            <label htmlFor="subjectSelect" className="block my-2 text-xl font-medium">{t('selectSubject')}</label>
            <select
              id="subjectSelect"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border border-lamaSky p-2 rounded w-full text-lg max-w-fit"
            >
              <option value="">{t('selectSubject')}</option>
              {teacherDetails?.subjects.map((subject) => (
                <option key={subject.id} value={subject.subjectId}>{subject.subject.name}</option>
              ))}
            </select>
          </div>
        )}
        {selectedSubject && (
          <div className="w-full md:w-fit">
            <select
              id="classSelect"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">{t('selectClass')}</option>
              {fetchedClasses.map((classItem) => (
                <option key={classItem.id} value={classItem.class.id}>{classItem.class.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {students.length > 0 && headerConfig && (
        <div className="overflow-x-scroll">
          <div className="flex items-center justify-between">
            <h2 className="md:text-xl text-main font-bold my-4">{t('studentsInClass')}</h2>
            <button
              onClick={navigateToProgressReport}
              className="bg-main hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              {t('progressReport')}
            </button>
          </div>
          <table className="min-w-full bg-white shadow-lg rounded-lg border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-center text-black">{t('no')}</th>
                <th className="p-3 text-center text-black">{t('name')}</th>
                {headerConfig.headers.map((header) => (
                  <th key={header} className="border p-2">
                    {header} ({headerConfig.maxValues[header]})
                    <div className="mt-1">
                      <button onClick={() => fillAllMarks(header)} className="ml-2 text-sm underline">
                        {t('fill')}
                      </button>
                      <button onClick={() => resetAllMarks(header)} className="ml-2 text-sm underline">
                        {t('reset')}
                      </button>
                    </div>
                  </th>
                ))}
                <th className="p-3 text-center text-black">{t('totalMarks')}</th>
              </tr>
            </thead>
            <tbody>
              {students?.map((student, index) => (
                <tr key={student.id} className="even:bg-gray-200 odd:bg-gray-100">
                  <td className="px-3">
                    <span className="font-bold">{index + 1}</span>
                  </td>
                  <td className="text-[14px] font-bold">{locale === 'en' ? student.name : student.arabicName}</td>
                  {headerConfig.headers.map((header) => (
                    <td key={header} className="p-1">
                      <input
                        type="number"
                        min="0"
                        value={marks[student.id]?.[header] || 0}
                        onChange={(e) => handleMarkChange(student.id, header, e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded"
                      />
                    </td>
                  ))}
                  <td className="p-3 text-center">{calculateTotalMarks(student.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="m-2 mb-2 text-end">
            <button
              onClick={handleSaveMarks}
              className="bg-main hover:bg-lamaYellow text-white font-bold py-2 px-6 rounded shadow-lg"
            >
              {t('saveMarks')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPage;