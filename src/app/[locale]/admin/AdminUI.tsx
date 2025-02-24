'use client';

import { useState, useEffect } from 'react';
import { Class, Student, Subject } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocale, useTranslations } from 'next-intl';
import { setSchool } from '@/redux/schoolSlice';
import { RootState } from '@/redux/store';
import { fetchWithSchool } from '@/lib/fetchWithSchool';
import Loader from '../_components/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { useUser } from '@clerk/nextjs';

interface AdminUIProps {
  subjects: Subject[];
}

interface Teacher {
  id: string;
  email: string;
  name: string;
  arabicName: string;
}

interface MarkHeaderConfig {
  headers: string[];
  maxValues: Record<string, number>;
}

interface LocalStudent {
  [key: string]: any;
  name: string;
  id: string;
  classId: string;
  homework?: number;
  participation?: number;
  quiz?: number;
  project?: number;
  exam?: number;
  reading?: number;
  memorizing?: number;
  oral?: number;
  classActivities?: number;
}

const AdminUI: React.FC<AdminUIProps> = ({ subjects }) => {
  const user = useUser();
  console.log("User:", user);

  const [loading, setLoading] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedTeacherEmail, setSelectedTeacherEmail] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string | null>(null);
  const [marks, setMarks] = useState<{ [studentId: string]: Partial<LocalStudent> }>({});
  const [showTeacherProgress, setShowTeacherProgress] = useState(false);
  const [teacherProgress, setTeacherProgress] = useState<any[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string | null>(null);
  const [selectedTrimester, setSelectedTrimester] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [headerConfig, setHeaderConfig] = useState<MarkHeaderConfig | null>(null);
  const router = useRouter();

  const fetchTeachersBySubject = async (subjectId: string) => {
    setLoading(true);
    const res = await fetch(`/api/teachers?subjectId=${subjectId}`);
    if (!res.ok) throw new Error('Failed to fetch teachers');
    const data = await res.json();
    setLoading(false);
    return data;
  };

  const fetchClasses = async (teacherId: string) => {
    setLoading(true);
    const res = await fetchWithSchool(`/api/classesByAdmin?teacherId=${teacherId}&subjectId=${selectedSubjectId}`);
    if (!res.ok) throw new Error('Failed to fetch classes');
    const data = await res.json();
    setLoading(false);
    return data;
  };

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId || !selectedTeacherId || !selectedSubjectId || !selectedAcademicYear || !selectedTrimester) return;
      setLoading(true);
      try {
        const response = await fetchWithSchool(
          `/api/students?classId=${selectedClassId}&teacherId=${selectedTeacherId}&subjectId=${selectedSubjectId}&academicYear=${selectedAcademicYear}&trimester=${selectedTrimester}`
        );
        if (!response.ok) throw new Error('Failed to fetch students');

        const data = await response.json();
        console.log("Raw API response:", data);

        const mappedStudents = data.map((student: any) => {
          const mark = student.marks.find((m: any) => m.subjectId === selectedSubjectId) || student.marks[0] || {};
          console.log(`Student ${student.id} mark from API:`, mark);

          return {
            ...student,
            homework: mark.homework || 0,
            participation: mark.participation || 0,
            quiz: mark.quiz || mark.workingQuiz || 0,
            project: mark.project || 0,
            exam: mark.exam || mark.finalExam || 0,
            classActivities: mark.classActivities || 0,
            reading: mark.reading || 0,
            memorizing: mark.memorizing || 0,
            oral: mark.oral || mark.oralTest || 0,
          };
        });

        console.log("Mapped students:", mappedStudents);
        setStudents(mappedStudents);
      } catch (error) {
        console.error("Fetch students error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClassId, selectedTeacherId, selectedSubjectId, selectedAcademicYear, selectedTrimester]);

  useEffect(() => {
    if (students.length > 0) {
      const initialMarks: { [studentId: string]: Partial<LocalStudent> } = {};
      students.forEach((student) => {
        initialMarks[student.id] = {
          homework: student.homework || 0,
          participation: student.participation || 0,
          quiz: student.quiz || 0,
          project: student.project || 0,
          exam: student.exam || 0,
          classActivities: student.classActivities || 0,
          reading: student.reading || 0,
          memorizing: student.memorizing || 0,
          oral: student.oral || 0,
        };
      });
      console.log("Initial marks state:", initialMarks);
      setMarks(initialMarks);
    }
  }, [students, selectedSubjectId]);

  const handleSubjectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subjectId = e.target.value;
    setSelectedSubjectId(subjectId);
    setTeachers([]);
    setSelectedTeacherId(null);
    setClasses([]);
    setSelectedClassId(null);
    setSelectedClassName(null);
    setStudents([]);
    setSelectedTeacherEmail(null);
    setHeaderConfig(null); // Reset header config
    const teachersData = await fetchTeachersBySubject(subjectId);
    setTeachers(teachersData);
  };

  const handleTeacherChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teacherId = e.target.value;
    setSelectedTeacherId(teacherId);

    const selectedTeacher = teachers.find((teacher) => teacher.id === teacherId);
    if (selectedTeacher && locale === 'en') {
      setSelectedTeacherEmail(selectedTeacher.name);
    } else if (selectedTeacher && locale === 'ar') {
      setSelectedTeacherEmail(selectedTeacher.arabicName);
    }

    const classesData = await fetchClasses(teacherId);
    setClasses(classesData);
    setSelectedClassId(null);
    setSelectedClassName(null);
    setStudents([]);
  };

  const handleClassChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    setSelectedClassId(classId);

    const selectedClass = classes.find((classItem) => classItem.id === classId);
    if (selectedClass) {
      setSelectedClassName(selectedClass.class.name);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const tableHeaders = () => {
    if (!selectedSubjectId) return [];
    const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId);
    if (!selectedSubject) return [];

    const subjectName = selectedSubject.name.toLowerCase();
    if (subjectName === 'arabic' || subjectName === 'social arabic') {
      return ['participation', 'homework', 'project', 'classActivities', 'quiz', 'exam'];
    } else if (subjectName === 'islamic') {
      return ['participation', 'homework', 'reading', 'memorizing', 'oral', 'quiz', 'exam'];
    } else {
      return ['participation', 'homework', 'quiz', 'project', 'exam'];
    }
  };

  const handleInputChange = (studentId: string, field: keyof LocalStudent, value: string) => {
    const numericValue = value === '' ? 0 : Number(value);
    const validatedValue = numericValue < 0 ? 0 : numericValue;
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: validatedValue,
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
  const handleSaveMarks = async () => {
    setLoading(true);
    try {
      const responses = await Promise.all(
        students.map((student) => {
          const studentMarks = marks[student.id];
          console.log(`Saving marks for student ${student.id}:`, studentMarks); // Debug payload
          return fetchWithSchool(`/api/students/${student.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              markId: student.marks[0]?.id,
              ...studentMarks,
            }),
          });
        })
      );

      if (responses.some((response) => !response.ok)) {
        throw new Error('Failed to update marks');
      }

      toast.success('Marks updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error updating marks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const t = useTranslations('admin');
  const locale = useLocale();
  const dispatch = useDispatch();
  const selectedSchool = useSelector((state: RootState) => state.school.selectedSchool);

  const handleSchoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSchool(event.target.value));
  };

  useEffect(() => {
    const updateSchoolHeader = async (school: string) => {
      try {
        const response = await fetch('/api/update-school', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ school }),
        });
        if (!response.ok) throw new Error('Failed to update school header');
        console.log('School header updated successfully');
      } catch (error) {
        console.error('Error updating school header:', error);
      }
    };
    if (selectedSchool) updateSchoolHeader(selectedSchool);
  }, [selectedSchool]);

  const fetchHeaderConfig = async (subjectId: string, classId: string) => {
    const classResponse = await fetch(`/api/classes?classId=${classId}`);
    const classData = await classResponse.json();
    const grade = classData.grade;

    const response = await fetch(`/api/mark-header-config?subjectId=${subjectId}&grade=${grade || 1}`);
    if (response.ok) {
      const config = await response.json();
      console.log("Raw header config from API:", config);

      // Normalize headers to camelCase to match database schema
      const headerMap: { [key: string]: string } = {
        'class activities': 'classActivities',
        'homework': 'homework',
        'participation': 'participation',
        'quiz': 'quiz',
        'exam': 'exam',
        'project': 'project',
        'reading': 'reading',
        'memorizing': 'memorizing',
        'oral': 'oral',
        'behavior': 'homework', // Map 'behavior' to 'homework' if applicable
        'workingquiz': 'quiz',
        'finalexam': 'exam',
        'oraltest': 'oral',
      };

      const normalizedHeaders = config.headers.map((header: string) => 
        headerMap[header.toLowerCase()] || header.toLowerCase()
      );
      const normalizedMaxValues: Record<string, number> = {};
      Object.keys(config.maxValues).forEach((key) => {
        const normalizedKey = headerMap[key.toLowerCase()] || key.toLowerCase();
        normalizedMaxValues[normalizedKey] = config.maxValues[key];
      });

      console.log("Normalized header config:", { headers: normalizedHeaders, maxValues: normalizedMaxValues });
      return { headers: normalizedHeaders, maxValues: normalizedMaxValues };
    }
    console.warn('Failed to fetch header config, falling back to tableHeaders');
    const fallbackHeaders = tableHeaders();
    const fallbackMaxValues = { 
      participation: 15, 
      homework: 15, 
      quiz: 15, 
      exam: 35, 
      project: 20,
      classActivities: 10 // Add fallback for classActivities
    };
    console.log("Fallback header config:", { headers: fallbackHeaders, maxValues: fallbackMaxValues });
    return { headers: fallbackHeaders, maxValues: fallbackMaxValues };
  };

  useEffect(() => {
    const loadHeaderConfig = async () => {
      if (selectedSubjectId && selectedClassId) {
        const config = await fetchHeaderConfig(selectedSubjectId, selectedClassId);
        setHeaderConfig(config);
      }
    };
    loadHeaderConfig();
  }, [selectedSubjectId, selectedClassId]);

  console.log("Rendering - Students:", students);
  console.log("Rendering - Marks:", marks);
  console.log("Rendering - Header Config:", headerConfig);

  return (
    <div className="w-full mx-auto p-6 rounded-lg">
      {loading && <Loader />}
      <div className="flex justify-between items-center mb-3 flex-wrap print:hidden gap-2">
        <h1 className="text-main w-full md:max-w-fit md:text-xl text-center rounded px-4 py-2 font-bold mb-2">
          {t('Trimester Data Entray')} <span className="text-[#e16262]">(2024-2025)</span>
        </h1>
        <div className="hidden">
          <label htmlFor="school">Select School:</label>
          <select id="school" value={selectedSchool} onChange={handleSchoolChange}>
            <option value="forqan">ALFORQAN</option>
            <option value="batool1">ALBATOOL_KHALDIA_1</option>
            <option value="batool2">ALBATOOL_KHALDIA_2</option>
            <option value="batool3">ALBATOOL_FAIHA</option>
          </select>
        </div>

        <div className="relative w-full md:w-fit px-4 md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full md:max-w-fit bg-main text-white text-center rounded px-4 py-2 font-semibold focus:outline-none flex justify-between items-center"
          >
            {t('Admin Manipulation')}
            <svg
              className={`w-4 h-4 ${locale === 'en' ? 'ml-2' : 'mr-2'} transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {isOpen && (
            <ul className="absolute z-10 w-full bg-main text-white rounded shadow-lg mt-2">
              <li onClick={() => handleNavigation('/teacherCreation')} className="px-4 py-2 hover:bg-gray-700 cursor-pointer border-b border-white">
                {t('Create Teacher')}
              </li>
              <li onClick={() => handleNavigation('/teacherProgress')} className="px-4 py-2 hover:bg-gray-700 cursor-pointer border-b border-white">
                {t('Teacher Management')}
              </li>
              <li onClick={() => handleNavigation('/studentsManage')} className="px-4 py-2 hover:bg-gray-700 cursor-pointer border-b border-white">
                {t('Student Management')}
              </li>
              <li onClick={() => handleNavigation('/class-subjects')} className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
                {t('Class Subjects Management')}
              </li>
            </ul>
          )}
        </div>

        {showTeacherProgress && teacherProgress.length > 0 && (
          <div className="mt-6 w-full relative">
            <h2 className="text-xl font-semibold mb-2">Teacher Progress</h2>
            <table className="min-w-full border-collapse border border-gray-200 text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Teacher</th>
                  <th className="border p-2">Completed</th>
                  <th className="border p-2">Incomplete</th>
                </tr>
              </thead>
              <tbody>
                {teacherProgress.map((progress, index) => (
                  <tr key={index} className="even:bg-gray-100 font-semibold">
                    <td className="border p-2">{progress.teacherName}</td>
                    <td className="border p-2 text-center">
                      {progress.completed.length > 0 ? progress.completed.join(', ') : 'No classes completed'}
                    </td>
                    <td className="border p-2 text-center">
                      {progress.incomplete.length > 0 ? progress.incomplete.join(', ') : 'All classes completed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="absolute flex items-center justify-center right-0 top-0 text-white font-bold bg-main px-2 rounded text-lg"
              onClick={() => setShowTeacherProgress(false)}
            >
              x
            </button>
          </div>
        )}
      </div>

      <div className="my-6 text-main font-semibold px-1 md:px-8 py-2 print:hidden flex w-fit gap-2 md:gap-12 lg:gap-16 flex-wrap">
        <div className="flex w-full md:w-fit bg-main rounded gap-2 items-center justify-center">
          <select
            className="border w-full rounded p-3 focus:outline-none focus:ring-2 focus:ring-[#5C2747]"
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>{t('selectAcademicYear')}</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
          </select>
        </div>

        {selectedAcademicYear && (
          <div className="print:hidden flex w-full md:w-fit">
            <select
              className="border rounded p-3 w-full md:w-fit focus:outline-none focus:ring-2 focus:ring-[#5C2747]"
              onChange={(e) => setSelectedTrimester(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>{t('selectTrimester')}</option>
              <option value="First Trimester">{t('First Trimester')}</option>
              <option value="Second Trimester">{t('Second Trimester')}</option>
              <option value="Third Trimester">{t('Third Trimester')}</option>
            </select>
          </div>
        )}

        {selectedAcademicYear && selectedTrimester && (
          <div className="print:hidden w-full md:w-fit bg-red-200">
            <select
              className="border rounded p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#5C2747]"
              onChange={handleSubjectChange}
              defaultValue=""
            >
              <option value="" disabled>{t('selectSubject')}</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {locale === 'en' ? subject.name : subject.arabicName}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedSubjectId && teachers.length > 0 && (
          <div className="print:hidden flex w-full md:w-fit">
            <select
              className="border rounded p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#5C2747]"
              onChange={handleTeacherChange}
              defaultValue=""
            >
              <option value="" disabled>{t('selectTeacher')}</option>
              {teachers.map((teacher: Teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {locale === 'en' ? teacher.name : teacher.arabicName}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedTeacherId && classes.length > 0 && (
          <div className="print:hidden w-full md:w-fit">
            <select
              className="border rounded p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#5C2747]"
              onChange={handleClassChange}
              defaultValue=""
            >
              <option value="" disabled>{t('selectClass')}</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.class.id}>
                  {classItem.class.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {students.length > 0 && headerConfig && (
        <>
          <table className="min-w-full border-collapse border border-gray-200 text-sm">
            <thead className="bg-main text-white">
              <tr>
                <th className="border p-2">{t('no')}</th>
                <th className="border p-2">{t('name')}</th>
                {headerConfig.headers.map((header) => (
                  <th key={header} className="border p-2">
                    {header.charAt(0).toUpperCase() + header.slice(1).toLowerCase()} ({headerConfig.maxValues[header]})
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
                <th className="border p-2">{t('total')}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">
                    <Link href={`/students/${student.id}/results`}>
                      {locale === 'en' ? student.name : student.arabicName}
                    </Link>
                  </td>
                  {headerConfig.headers.map((header) => (
                    <td key={header} className="border p-2">
                      <input
                        type="number"
                        value={marks[student.id]?.[header] || 0}
                        onChange={(e) => handleInputChange(student.id, header as keyof LocalStudent, e.target.value)}
                        min="0"
                        max={headerConfig.maxValues[header]}
                        className="w-full text-center"
                      />
                    </td>
                  ))}
                  <td className="border p-2">
                    {headerConfig.headers.reduce(
                      (total, header) => total + (marks[student.id]?.[header] || 0),
                      0
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <div
              className={`bg-gray-100 p-2 my-2 font-semibold hidden md:flex md:justify-between md:items-center md:px-8 ${
                locale === 'en' ? 'md:pr-36 lg:pr-64' : 'md:pl-36 lg:pl-64'
              }`}
            >
              <div className="flex w-full justify-between items-center gap-4">
                <p className="text-lg">
                  {locale === 'en' ? 'Teacher: ' : 'اسم المعلم :'} {selectedTeacherEmail}
                </p>
                <p className="text-lg">
                  {locale === 'en' ? 'Class : ' : 'الفصل :'} {classes?.find((c) => c.class.id === selectedClassId)?.class.name}
                </p>
                <p className="text-lg">{locale === 'en' ? 'Signature : ' : 'التوقيع :'} </p>
              </div>
            </div>
            <div className="mt-2 flex gap-4 justify-end print:hidden">
              <button className="py-2 px-4 bg-main text-white rounded mr-2" onClick={handleSaveMarks}>
                {locale === 'en' ? 'Save Marks' : 'حفظ الدرجات'}
              </button>
              <button className="py-2 px-4 bg-main text-white rounded" onClick={handlePrintCertificate}>
                {locale === 'en' ? 'Print ' : 'طباعة'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUI;