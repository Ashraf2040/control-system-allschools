'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import * as XLSX from 'xlsx';

const DataBackupPage = () => {
  const [trimester, setTrimester] = useState('');
  const [grade, setGrade] = useState('');
  const [grades, setGrades] = useState([]);
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]); // State to store fetched students
  const [loading, setLoading] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false); // State to control table visibility
  const t = useTranslations('dataBackup');

  // Fetch grades from the API
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await fetch('/api/grades');
        const data = await response.json();
        setGrades(data); // Set the fetched grades
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };

    fetchGrades();
  }, []);

  // Fetch classes based on the selected grade
  useEffect(() => {
    if (grade) {
      const fetchClasses = async () => {
        try {
          const response = await fetch(`/api/classedtobackup?grade=${grade}`);
          if (!response.ok) throw new Error('Failed to fetch classes');
          const data = await response.json();
          setClasses(data);
        } catch (error) {
          console.error('Error fetching classes:', error);
        }
      };
      fetchClasses();
    } else {
      setClasses([]); // Reset classes if no grade is selected
    }
  }, [grade]);

  // Fetch students and their marks
  const fetchStudents = async () => {
    if (!trimester || !grade) return; // Prevent fetch if required fields are missing

    setLoading(true);
    setIsTableVisible(false); // Hide the table while fetching new data
    setStudents([]); // Clear previous data

    try {
      const response = await fetch(`/api/backup?trimester=${trimester}&grade=${grade}&classId=${classId}`);
      if (!response.ok) throw new Error('Failed to fetch student data');
      const data = await response.json();
      setStudents(data); // Store fetched students
      setIsTableVisible(true); // Show the table
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage for a student
  const calculatePercentage = (marks: any[]) => {
    const totalMarks = marks.reduce((sum, mark) => sum + (mark.totalMarks || 0), 0);
    const totalPossibleMarks = marks.length * 100; // Assuming each subject has a max of 100 marks
    const percentage = (totalMarks / totalPossibleMarks) * 100;
    return percentage.toFixed(2); // Round to 2 decimal places
  };

  // Get unique subjects from all students for the selected trimester
  const getUniqueSubjects = () => {
    const subjects = new Set<string>();
    students.forEach((student) => {
      student.marks
        .filter((mark: any) => mark.trimester === trimester) // Filter marks by selected trimester
        .forEach((mark: any) => {
          subjects.add(mark.subject.name);
        });
    });
    return Array.from(subjects);
  };

  // Handle download
  const handleDownload = async () => {
    const uniqueSubjects = getUniqueSubjects();

    const worksheetData = students.map((student: any, index: number) => {
      const filteredMarks = student.marks.filter((mark: any) => mark.trimester === trimester);
      const studentData: any = {
        No: index + 1,
        Name: student.name,
        Grade: grade,
        Class: classes.find((cls) => cls.id === student.classId)?.name,
      };

      uniqueSubjects.forEach((subject) => {
        const mark = filteredMarks.find((m: any) => m.subject.name === subject);
        studentData[subject] = mark?.totalMarks || 0;
      });

      studentData['Percentage'] = calculatePercentage(filteredMarks);

      return studentData;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'students_marks.xlsx');
  };

  // Sort students by percentage in descending order
  const sortedStudents = students.sort((a, b) => {
    const percentageA = parseFloat(calculatePercentage(a.marks.filter((mark: any) => mark.trimester === trimester)));
    const percentageB = parseFloat(calculatePercentage(b.marks.filter((mark: any) => mark.trimester === trimester)));
    return percentageB - percentageA; // Sort from highest to lowest
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-center text-main">{t('dataBackup')}</h1>
      <div className="space-y-4 ">
        <div className='w-full flex items-center justify-between flex-wrap max-w-6xl'>
          {/* Trimester Select */}
        <div>
         
          <select
            value={trimester}
            onChange={(e) => setTrimester(e.target.value)}
            className="w-full border p-3 rounded-md text-lg"
          >
            <option value="">{t('selectTrimester')}</option>
            <option value="First Trimester">Trimester 1</option>
            <option value="Second Trimester">Trimester 2</option>
            <option value="Third Trimester">Trimester 3</option>
          </select>
        </div>

        {/* Grade Select */}
        <div>
          
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full border p-3 rounded-md text-lg"
          >
            <option value="">{t('selectGrade')}</option>
            {grades.map((grade, index) => (
              <option key={index} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        {/* Class Select */}
        <div>
         
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full border p-3 rounded-md text-lg"
            disabled={!grade} // Disable if no grade is selected
          >
            <option value="">{t('selectClass')}</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        
          <button
            onClick={fetchStudents}
            disabled={loading || !trimester || !grade}
            className="bg-main text-white px-6 py-2 rounded-md"
          >
            {loading ? t('loading') : t('view')}
          </button>
     
        </div>

        {/* Table */}
        {isTableVisible && students.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-4">No</th>
                  <th className="border p-4">Name</th>
                  <th className="border p-4">Grade</th>
                  <th className="border p-4">Class</th>
                  {getUniqueSubjects().map((subject) => (
                    <th key={subject} className="border p-4">
                      {subject}
                    </th>
                  ))}
                  <th className="border p-4">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student, index) => {
                  const filteredMarks = student.marks.filter((mark: any) => mark.trimester === trimester);
                  return (
                    <tr key={student.id} className="even:bg-gray-50 hover:bg-gray-100 transition duration-300">
                      <td className="border p-4">{index + 1}</td>
                      <td className="border p-4">{student.name}</td>
                      <td className="border p-4">{grade}</td>
                      <td className="border p-4">{classes.find((cls) => cls.id === student.classId)?.name}</td>
                      {getUniqueSubjects().map((subject) => {
                        const mark = filteredMarks.find((m: any) => m.subject.name === subject);
                        return (
                          <td key={subject} className="border p-4">
                            {mark?.totalMarks || 0}
                          </td>
                        );
                      })}
                      <td className="border p-4">{calculatePercentage(filteredMarks)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Download Button */}
            <div className="mt-4">
              <button
                onClick={handleDownload}
                className="bg-main text-white px-6 py-2 rounded-md self-center"
              >
                {t('download')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataBackupPage;