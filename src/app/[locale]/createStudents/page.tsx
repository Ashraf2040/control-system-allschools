'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface ClassOption {
  id: string;
  name: string;
}

const AddStudentForm: React.FC = () => {
  const [name, setName] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [dob, setDob] = useState('');
  const [classId, setClassId] = useState('');
  const [nationality, setNationality] = useState('');
  const [iqamaNo, setIqamaNo] = useState('');
  const [passportNo, setPassportNo] = useState('');
  const [expenses, setExpenses] = useState('paid');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState(''); // New state for school
  const [academicYear, setAcademicYear] = useState(''); // New state for academic year
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  // const academicYears = [
  //   `${currentYear - 1}-${currentYear}`,
  //   `${currentYear}-${currentYear + 1}`
  // ];
  const academicYears = ["2024-2025", "2025-2026"]; // Updated academic years
  

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classesStudents');
        if (!response.ok) throw new Error('Failed to fetch classes');
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error(error);
        toast.error('Error fetching classes.');
      }
    };

    fetchClasses();
  }, []);

  // Update username and password dynamically based on `name` and `iqamaNo`
  useEffect(() => {
    if (name && iqamaNo) {
      const formattedName = name.split(' ')[0].toLowerCase(); // Use the first name and lowercase it
      setUsername(`${formattedName}_${iqamaNo}`);
      setPassword(iqamaNo); // Password is the iqama number
    }
  }, [name, iqamaNo]);
console.log(classes)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !dob || !classId || !iqamaNo || !school || !academicYear) {
      toast.error('Name, date of birth, class, Iqama Number, School, and Academic Year are required.');
      return;
    }

    try {
      const response = await fetch('/api/studentCreation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          arabicName,
          dob,
          classId,
          nationality,
          iqamaNo,
          passportNo,
          expenses,
          username,
          password,
          school, // Sending school as part of the request
          academicYear, // Sending academic year as part of the request
        }),
      });

      if (!response.ok) throw new Error('Failed to add student');

      toast.success('Student added successfully!');
      router.push('/admin'); // Redirect to the student list page
    } catch (error) {
      console.error(error);
      toast.error('Error adding student. Please try again.');
    }
  };

  const t = useTranslations('createNewStudent');

  return (
    <div className="w-full md:w-[70%] mx-auto mt-24 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">{t('addNewStudent')}</h2>
      <form onSubmit={handleSubmit} className="flex gap-8 flex-wrap w-full">
        {/* Existing Fields */}
        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            {t('name')}
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
            required
          />
        </div>

        <div className="mb-4 flex items-center justify-between gap-4">
          <label htmlFor="arabicName" className="block text-sm font-medium min-w-fit">
            {t('arabicName')}
          </label>
          <input
            type="text"
            id="arabicName"
            value={arabicName}
            onChange={(e) => setArabicName(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
          />
        </div>

        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="dob" className="block text-sm font-medium mb-1 min-w-fit">
            {t('dateOfBirth')}
          </label>
          <input
            type="date"
            id="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
            required
          />
        </div>

        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="nationality" className="block text-sm font-medium mb-1">
            {t('nationality')}
          </label>
          <input
            type="text"
            id="nationality"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
          />
        </div>

        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="iqamaNo" className="block text-sm font-medium mb-1 min-w-fit">
            {t('iqamaNo')}
          </label>
          <input
            type="text"
            id="iqamaNo"
            value={iqamaNo}
            onChange={(e) => setIqamaNo(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
            required
          />
        </div>

        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="passportNo" className="block text-sm font-medium mb-1 min-w-fit">
            {t('passportNo')}
          </label>
          <input
            type="text"
            id="passportNo"
            value={passportNo}
            onChange={(e) => setPassportNo(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
          />
        </div>

        {/* School Select Box */}
        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="school" className="block text-sm font-medium mb-1">
            {t('school')}
          </label>
          <select
            id="school"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
            required
          >
            <option value="" disabled>{t('selectSchool')}</option>
            <option value="forqan">Alforqan School</option>
            <option value="batool">Albatool Khaldia 1</option>
            <option value="batool2">Albatool Khaldia 2</option>
            <option value="faihaa">Albatool Faihaa</option>
          </select>
        </div>

        {/* Academic Year Select Box */}
        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="academicYear" className="block text-sm font-medium mb-1">
            {t('academicYear')}
          </label>
          <select
            id="academicYear"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
            required
          >
            <option value="" disabled>{t('academicYear')}</option>
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Class Select Box */}
        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="classId" className="block text-sm font-medium mb-1">
            {t('class')}
          </label>
          <select
            id="classId"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
            required
          >
            <option value="" disabled>{t('selectClass')}</option>
            {classes.map((classOption) => (
              <option key={classOption.id} value={classOption.id}>
                {classOption.name}
              </option>
            ))}
          </select>
        </div>

        {/* Expenses Dropdown */}
        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="expenses" className="block text-sm font-medium mb-1">
            {t('expenses')}
          </label>
          <select
            id="expenses"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
          >
            <option value="paid">{t('paid')}</option>
            <option value="unpaid">{t('unpaid')}</option>
          </select>
        </div>

        {/* Username */}
        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            {t('username')}
          </label>
          <input
            type="text"
            id="username"
            value={username}
            readOnly
            className="w-full border p-2 bg-gray-200 rounded focus:ring focus:ring-main focus:outline-none"
          />
        </div>

        {/* Password */}
        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            {t('password')}
          </label>
          <input
            type="text"
            id="password"
            value={password}
            readOnly
            className="w-full border p-2 bg-gray-200 rounded focus:ring focus:ring-main focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-main text-white p-2 rounded font-semibold hover:bg-main-dark transition"
        >
          {t('addStudent')}
        </button>
      </form>
    </div>
  );
};

export default AddStudentForm;
