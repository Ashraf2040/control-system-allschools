"use client";
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import emailjs from '@emailjs/browser';

import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'react-hot-toast';
import { useLocale, useTranslations } from 'next-intl';
import AllTeachersModal from '../_components/AllTeachersModal';
import { fetchWithSchool } from '@/lib/fetchWithSchool';
const TeacherProgressPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isTeachersModalOpen, setIsTeachersModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    classes: [] as string[], // Array of selected class IDs
    subjects: [] as string[], // Array of selected subject IDs
    academicYear: '',
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]); // To hold the list of classes
  const [subjects, setSubjects] = useState<any[]>([]); // To hold the list of subjects
  const [targetDate, setTargetDate] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  interface User {
    id: string;
    emailAddresses: { emailAddress: string }[];
  }
  useEffect(() => {
    const fetchTargetDate = async () => {
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to fetch target date');
        const data = await response.json();
        setTargetDate(data.targetDate ? new Date(data.targetDate).toISOString().split('T')[0] : '');
      } catch (error) {
        console.error(error);
        toast.error('Error fetching target date.');
      }
    };

    fetchTargetDate();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDate }),
      });

      if (!response.ok) throw new Error('Failed to update target date');
      toast.success('Target date updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error updating target date.');
    }
  };
  useEffect(() => {
    // Fetching teacher progress
    const fetchTeacherProgress = async () => {
      try {
        const response = await fetch('/api/allTeachersProgress?trimester=First Trimester');
        if (!response.ok) throw new Error('Failed to fetch teacher progress');
        const data: Teacher[] = await response.json();
        setTeachers(data);
        console.log(data)
      } catch (error) {
        toast.error('Error fetching teacher data.');
      }
    };

    fetchTeacherProgress();
    const allTeachers=async()=>{
      try {
        const response = await fetchWithSchool('/api/allTeachers');
        if (!response.ok) throw new Error('Failed to fetch teacher progress');
        const data: Teacher[] = await response.json();
        setAllTeachers(data);
        console.log(data)
      } catch (error) {
        toast.error('Error fetching teacher data.');
      }
    }
     allTeachers();
   
    // Fetch all classes
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/getAllClasses');
        if (!response.ok) throw new Error('Failed to fetch classes');
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        toast.error('Error fetching classes.');
      }
    };

    // Fetch all subjects
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects');
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        toast.error('Error fetching subjects.');
      }
    };

    fetchClasses();
    fetchSubjects();
  }, []);
   console.log(selectedTeacher)
  const handleSettingsClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      // Safe mapping for classes and subjects
      classes: teacher.classes ? teacher.classes.map((cls) => cls.id) : [], // Assuming classes have `id`
      subjects: teacher.subjects ? teacher.subjects.map((sub) => sub.id) : [], // Assuming subjects have `id`
      academicYear: teacher.academicYear,
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTeacher) return;  // Ensure the selected teacher is not null or undefined
    setLoading(true);
  
    try {
      const response = await fetch(`/api/updateTeacher`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTeacher.teacherId,  // Pass the teacher ID to the API
          ...formData,
        }),
      });
  
      if (!response.ok) throw new Error('Failed to update teacher data');
      toast.success('Teacher updated successfully');
      setIsFormOpen(false);
  
      // Update the local state with the updated data
      setTeachers(teachers.map((teacher) =>
        teacher.id === selectedTeacher.id ? { ...teacher, ...formData } : teacher
      ));
    } catch (error) {
      toast.error('Error updating teacher');
    } finally {
      setLoading(false);
    }
  };
  console.log(teachers)

  const handleDelete = async () => {
    if (!selectedTeacher) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/deleteTeacher`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedTeacher.teacherId }),
      });

      if (!response.ok) throw new Error('Failed to delete teacher');
      toast.success('Teacher deleted successfully');
      setTeachers(teachers.filter((teacher) => teacher.id !== selectedTeacher.id));
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Error deleting teacher');
    } finally {
      setLoading(false);
    }
  };

  const t = useTranslations('teacherProgress');
  const locale = useLocale();


 
 
  
    useEffect(() => {
      // Fetch users from the API route
      fetch('/api/users')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }
          return response.json();
        })
        .then((data) => {
          setUsers(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching users:', error);
          setError(error.message);
          setLoading(false);
        });
    }, []);
  
  console.log(users)
  console.log(allTeachers)
  const sendTeacherDetails = async () => {
    try {
      emailjs.init('8K8-7J7IYhmsBAf6w'); // Initialize EmailJS with your Public Key
  
      // Loop through all teachers and send emails
      for (const teacher of allTeachers) {
        // Ensure the teacher has an email address
        if (!teacher.email) {
          console.error(`No email found for teacher: ${teacher.name}`);
          continue; // Skip this teacher
        }
  
        const emailParams = {
          name: teacher.name,
          school: teacher.school,
          subject: teacher.subjects?.map((sub) => sub.subject.name).join(', '),
          classes: teacher.classes?.map((cls) => cls.class.name).join(', '),
          username: teacher.username,
          password: teacher.password,
          to_email: teacher.email, // Use the teacher's email address
        };
  
        // Send email using EmailJS
        await emailjs.send(
          'service_56p70zt', // Replace with your Service ID
          'template_llpm0a5', // Replace with your Template ID
          emailParams
        );
      }
  
      toast.success('Emails sent successfully!');
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error('Failed to send emails.');
    }
  };
  return (
    <div className="p-6 ">
      <div className="p-6 md:flex md:flex-col md:items-center">
        <Toaster position="top-right" />

        <form onSubmit={handleSubmit} className="space-y-4 md:flex md:w-3/5 items-center md:justify-between shadow-md p-4 rounded-lg">
          <h1 className="text-xl text-center text-main font-bold w-full md:w-fit">{t('setTargetDate')}</h1>
          <div>
            <input
              type="date"
              id="targetDate"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-main text-white px-6 py-2 rounded-md hover:bg-third hover:text-main transition mb-6 font-semibold"
          >
            {t('saveTargetDate')}
          </button>
        </form>
      </div>
     <div className='flex justify-between
      items-center'>
     <h1 className="text-2xl font-semibold  text-center text-main">{t('teacherProgress')}</h1>
      <div className='flex items-center justify-center gap-2'>
        
        <button
        onClick={() => setIsTeachersModalOpen(true)}
        className="bg-main text-white px-6 py-2 rounded-md hover:bg-third hover:text-main transition mb-6 font-semibold"
      >
        Show Teachers Details
      </button>
      <button
            onClick={sendTeacherDetails}
            className="bg-main text-white px-6 py-2 rounded-md hover:bg-third hover:text-main transition mb-6 font-semibold"
          >
            Send Teachers Details
          </button></div>
     </div>
      {isTeachersModalOpen && (
        <AllTeachersModal
          teachers={allTeachers}
          onClose={() => setIsTeachersModalOpen(false)}
        />
      )}
      <div className='overflow-x-auto'>
        <table className="min-w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-4">{t('teacher')}</th>
              <th className="border p-4">{t('subjects')}</th>
              <th className="border p-4">{t('classes')}</th>
              <th className="border p-4">{t('completed')}</th>
              <th className="border p-4">{t('notCompleted')}</th>
              <th className="border p-4">{t('academicYear')}</th>
              <th className="border p-4">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {teachers?.filter((teacher) => teacher.name !== "solo").map((teacher) => (
              <tr key={teacher.id} className="even:bg-gray-50 hover:bg-gray-100 transition duration-300">
                <td className="border p-4">{locale === 'en' ? teacher?.name : teacher?.arabicName}</td>
                <td className="border p-4">{teacher?.subjects?.map((sub) => sub).join(', ')}</td>
                <td className="border p-4">{teacher?.classesAssigned.map((cls) => cls).join(', ')}</td>
                <td className="border p-4">
                  {teacher?.completedClasses.length === teacher?.classesAssigned.length && teacher?.classesAssigned.length!== 0 ? (
                    <span className="text-green-500 font-semibold">{t('allClassesCompleted')}</span>
                  ) : (
                    teacher?.completedClasses.map((cls) => cls).join(', ')
                  )}
                </td>
                <td className="border p-4">{teacher?.incompleteClasses.map((cls) => cls).join(', ')}</td>
                <td className="border p-4">{teacher.academicYear}</td>
                <td className="border p-4 text-center">
                  <button
                    onClick={() => handleSettingsClick(teacher)}
                    className="text-main hover:underline transition duration-200"
                  >
                    ⚙️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-3/5 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">{t('editTeacherData')}</h2>
            <div className="space-y-4">
              <input
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('name')}
                className="w-full border p-3 rounded-md text-lg"
              />

              <h1>{t('classes')}</h1>
              <select
                name="classes"
                value={formData.classes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    classes: Array.from(e.target.selectedOptions, (option) => option.value),
                  })
                }
                multiple
                className="w-full border p-3 rounded-md text-lg"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>

              <h1>{t('subjects')}</h1>
              <select
                name="subjects"
                value={formData.subjects}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subjects: Array.from(e.target.selectedOptions, (option) => option.value),
                  })
                }
                multiple
                className="w-full border p-3 rounded-md text-lg"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>

              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full border p-3 rounded-md text-lg"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setIsFormOpen(false)}
                className="bg-gray-200 px-6 py-2 rounded-md hover:bg-gray-300 transition"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                className="bg-main text-white px-6 py-2 rounded-md hover:bg-[#5C2747] transition"
                disabled={loading}
              >
                {t('save')}
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition"
                disabled={loading}
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProgressPage;
