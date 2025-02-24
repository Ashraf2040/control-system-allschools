"use client";

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import MarkHeaderConfigForm from '../_components/MarkHeaderConfigForm';
interface Subject {
  id: string;
  name: string;
  arabicName: string;
}
const ClassSubjectsManagement = () => {
  const t = useTranslations("classSubjects"); // Initialize translation
  const [classes, setClasses] = useState([]); // List of classes
  const [subjects, setSubjects] = useState([]); // List of subjects
  const [teachers, setTeachers] = useState([]); // List of teachers
  const [selectedClass, setSelectedClass] = useState(''); // Selected class for assigning subjects
  const [selectedSubjects, setSelectedSubjects] = useState([]); // Subjects selected for the class
  const [selectedTeachers, setSelectedTeachers] = useState([]); // Teachers selected for the class
  const [newClassGrade, setNewClassGrade] = useState(''); // Empty string for free text grade input
  // States for Add Class and Add Subject forms
  const [newClassName, setNewClassName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState({ name: '', arabicName: '' });
  const [showClassForm, setShowClassForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  // Add states for modal
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null); // Track the class ID to delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Control modal visibility

  useEffect(() => {
    // Fetch classes, subjects, and teachers on component load
    const fetchClassesSubjectsAndTeachers = async () => {
      const res = await fetch('/api/classSubjects');
      const data = await res.json();
      setClasses(data.classes);
      setSubjects(data.subjects);
      setTeachers(data.teachers);
    };
    fetchClassesSubjectsAndTeachers();
  }, []);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
  };

  const handleSubjectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedSubjects(selectedOptions);
  };

  const handleTeacherChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedTeachers(selectedOptions);
  };

  const handleAssignSubjects = async () => {
    if (selectedClass && selectedSubjects.length > 0) {
      try {
        const res = await fetch('/api/classSubjects', {
          method: 'POST',
          body: JSON.stringify({
            type: 'assignSubjects',
            classId: selectedClass,
            subjectIds: selectedSubjects,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (data.success) {
          toast.success(t('subjectsAssignedSuccessfully'));
        } else {
          toast.error(t('failedToAssignSubjects'));
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error(t('errorOccurredWhileAssigningSubjects'));
      }
    } else {
      toast.error(t('selectClassAndSubjects'));
    }
  };

  const handleAssignTeachers = async () => {
    if (selectedClass && selectedTeachers.length > 0) {
      try {
        const res = await fetch('/api/classSubjects', {
          method: 'POST',
          body: JSON.stringify({
            type: 'assignTeacher',
            classId: selectedClass,
            teacherIds: selectedTeachers,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (data.success) {
          toast.success(t('teachersAssignedSuccessfully'));
        } else {
          toast.error(t('failedToAssignTeachers'));
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error(t('errorOccurredWhileAssigningTeachers'));
      }
    } else {
      toast.error(t('selectClassAndTeachers'));
    }
  };

  const handleAddClass = async () => {
    try {
      const res = await fetch('/api/classSubjects', {
        method: 'POST',
        body: JSON.stringify({
          type: 'class',
          name: newClassName,
          grade: newClassGrade.trim() || '1', // Use the input value or default to '1' if empty
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (data.success) {
        setClasses((prev) => [...prev, data.newClass]);
        setNewClassName('');
        setNewClassGrade(''); // Reset grade to empty
        setShowClassForm(false); // Close the form on success
      } else {
        toast.error(t('failedToAddClass'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('errorOccurredWhileAddingClass'));
    }
  };

  const handleAddSubject = async () => {
    if (newSubjectName.name.trim() !== '' && newSubjectName.arabicName.trim() !== '') {
      const res = await fetch('/api/classSubjects', {
        method: 'POST',
        body: JSON.stringify({
          type: 'subject',
          name: newSubjectName.name,
          arabicName: newSubjectName.arabicName,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (data.success) {
        setSubjects((prev) => [...prev, data.newSubject]);
        setNewSubjectName({ name: '', arabicName: '' });
        setShowSubjectForm(false);
        toast.success(t('subjectAddedSuccessfully'));
      } else {
        toast.error(t('failedToAddSubject'));
      }
    }
  };

  const handleMarksGenerate = async () => {
    if (selectedClass && selectedSubjects.length > 0) {
      try {
        const res = await fetch('/api/classSubjects', {
          method: 'POST',
          body: JSON.stringify({
            type: 'generateMarks',
            classId: selectedClass,
            subjectIds: selectedSubjects,
            academicYear: '2024-2025',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (data.success) {
          toast.success(t('marksGeneratedSuccessfully'));
        } else {
          toast.error(t('failedToGenerateMarks'));
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error(t('errorOccurredWhileGeneratingMarks'));
      }
    } else {
      toast.error(t('selectClassAndSubjectsForMarks'));
    }
  };

  const handleDeleteClass = (classId: string) => {
    setDeleteClassId(classId); // Set the class ID to delete
    setIsDeleteModalOpen(true); // Open the modal
  };

  const locale = useLocale();

  return (
    <div className="p-6 bg-white shadow-lg rounded-md max-w-5xl mx-auto mt-10">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6 w-full text-center">{t('title')}</h1>

      {/* Table showing classes and their subjects */}
      <div className='max-h-60 overflow-y-scroll'>
        <table className="min-w-full table-auto bg-gray-100 rounded-lg shadow-md mb-6">
          <thead className="">
            <tr className={`bg-second ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
              <th className="px-4 py-2 font-semibold">{t('no')}</th>
              <th className="px-4 py-2 font-semibold">{t('classes')}</th>
              <th className="px-4 py-2 font-semibold">{t('grade')}</th>
              <th className="px-4 py-2 font-semibold">{t('subjects')}</th>
              <th className="px-4 py-2 font-semibold">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {classes?.map((classItem, index) => (
              <tr key={classItem.id} className="border-t odd:bg-third even:bg-second">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{classItem.name}</td>
                <td className="px-4 py-2">{classItem.grade}</td>
                <td className="px-4 py-2">{classItem.subjects?.map((subject) => locale === 'ar' ? subject.arabicName : subject.name).join(', ')}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDeleteClass(classItem.id)}
                    className="underline text-main px-3 py-1 rounded-md font-semibold hover:bg-red-600 transition-colors"
                  >
                    {t('delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6 flex gap-4 justify-center">
        <button
          onClick={() => setShowClassForm(!showClassForm)}
          className="bg-main text-white px-6 py-2 rounded-md font-semibold hover:bg-main-dark transition-colors mr-4"
        >
          {t('addClass')}
        </button>
        <button
          onClick={() => setShowSubjectForm(!showSubjectForm)}
          className="bg-main text-white px-6 py-2 rounded-md font-semibold hover:bg-main-dark transition-colors"
        >
          {t('addSubject')}
        </button>
      </div>

      {/* Add Class Form */}
      {showClassForm && (
        <div className="mt-6 p-6 bg-gray-50 shadow-lg rounded-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('addNewClass')}</h3>
          <input
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder={t('className')}
            className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 focus:outline-none mb-2"
          />
          <input
            type="text"
            value={newClassGrade}
            onChange={(e) => setNewClassGrade(e.target.value)}
            placeholder={t('grade')}
            className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 focus:outline-none mb-2"
          />
          <button
            onClick={handleAddClass}
            className="mt-4 bg-main text-white px-6 py-2 rounded-md font-semibold hover:bg-main-dark transition-colors"
          >
            {t('addClass')}
          </button>
        </div>
      )}

      {/* Add Subject Form */}
      {showSubjectForm && (
        <div className="mt-6 p-6 bg-gray-50 shadow-lg rounded-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('addNewSubject')}</h3>
          <input
            type="text"
            value={newSubjectName.name}
            onChange={(e) => setNewSubjectName({ ...newSubjectName, name: e.target.value })}
            placeholder={t('subjectName')}
            className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 focus:outline-none"
          />
          <input
            type="text"
            value={newSubjectName.arabicName}
            onChange={(e) => setNewSubjectName({ ...newSubjectName, arabicName: e.target.value })}
            placeholder={t('subjectArabicName')}
            className="w-full px-4 mt-1 py-2 rounded-lg bg-white border border-gray-300 focus:outline-none"
          />
          <button
            onClick={handleAddSubject}
            className="mt-4 bg-main text-white px-6 py-2 rounded-md font-semibold hover:bg-main-dark transition-colors"
          >
            {t('addSubject')}
          </button>
        </div>
      )}

      {/* Assign Subjects */}
      <div className="mt-6 bg-second p-2 rounded-md flex flex-col justify-center items-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('assignSubjectsToClass')}</h2>
        <select
          onChange={handleClassChange}
          value={selectedClass}
          className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none mb-4"
        >
          <option value="">{t('selectClass')}</option>
          {classes?.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name}
            </option>
          ))}
        </select>

        <select
          multiple
          onChange={handleSubjectChange}
          value={selectedSubjects}
          className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none mb-6"
        >
          {subjects?.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {locale === 'en' ? subject.name : subject.arabicName}
            </option>
          ))}
        </select>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleAssignSubjects}
            className="bg-main text-white px-6 py-2 rounded-md font-semibold hover:bg-main-dark transition-colors"
          >
            {t('assignSubjects')}
          </button>
          <button
            onClick={handleMarksGenerate}
            className="bg-main text-white px-6 py-2 rounded-md font-semibold hover:bg-main-dark transition-colors"
          >
            {t('generateMarks')}
          </button>
        </div>
      </div>

      {/* Assign Teachers */}
      <div className="mt-6 bg-third p-2 rounded-md flex flex-col justify-center items-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('assignTeachersToClass')}</h2>
        <select
          onChange={handleClassChange}
          value={selectedClass}
          className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none mb-4"
        >
          <option value="">{t('selectClass')}</option>
          {classes?.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name}
            </option>
          ))}
        </select>

        <select
          multiple
          onChange={handleTeacherChange}
          value={selectedTeachers}
          className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none mb-6"
        >
          {teachers?.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {locale === 'ar' ? teacher?.arabicName : teacher?.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleAssignTeachers}
          className="bg-main text-white px-6 py-2 rounded-md font-semibold hover:bg-main-dark transition-colors"
        >
          {t('assignTeachers')}
        </button>
      </div>
      <div>
        <MarkHeaderConfigForm subjects={subjects} />
      </div>

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {t('confirmDeleteClass')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('areYouSureDeleteClass')}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false); // Close modal
                  setDeleteClassId(null); // Reset class ID
                }}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={async () => {
                  if (deleteClassId) {
                    try {
                      const res = await fetch('/api/classSubjects', {
                        method: 'DELETE',
                        body: JSON.stringify({ classId: deleteClassId }),
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      });

                      const data = await res.json();

                      if (data.success) {
                        setClasses(classes.filter((cls) => cls.id !== deleteClassId));
                        toast.success(t('classDeletedSuccessfully'));
                      } else {
                        toast.error(t('failedToDeleteClass'));
                      }
                    } catch (error) {
                      console.error('Error:', error);
                      toast.error(t('errorOccurredWhileDeletingClass'));
                    } finally {
                      setIsDeleteModalOpen(false); // Close modal after action
                      setDeleteClassId(null); // Reset class ID
                    }
                  }
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassSubjectsManagement;