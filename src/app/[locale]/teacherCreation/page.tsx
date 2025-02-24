"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import SignatureCanvas from "react-signature-canvas";
import { useLocale, useTranslations } from "next-intl";
import Loader from "../_components/Loader";

const TeacherCreation = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teacherData, setTeacherData] = useState({
    name: "",
    arabicName: "",
    email: "",
    username: "",
    password: "",
    role: "TEACHER", // Default role is TEACHER
    academicYear: "",
    subjects: [] as string[], // Updated to an array
    school: "",
    signature: null,
  });
 
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);

  const t = useTranslations("teacherCreation");
  const locale = useLocale();

  useEffect(() => {
    const fetchSubjects = async () => {
      const response = await fetch("/api/subjects");
      if (response.ok) {
        const subjects = await response.json();
        setSubjects(subjects);
      } else {
        console.error("Failed to fetch subjects");
      }
    };

    const generateAcademicYears = (startYear: number, numYears: number) => {
      let years = [];
      for (let i = 0; i < numYears; i++) {
        const yearStart = startYear + i;
        const yearEnd = startYear + i + 1;
        years.push(`${yearStart}-${yearEnd}`);
      }
      return years;
    };

    const years = generateAcademicYears(2024, 10);
    setAcademicYears(years);
    fetchSubjects();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTeacherData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (subjectName: string) => {
    setTeacherData((prev) => {
      const subjects = prev.subjects.includes(subjectName)
        ? prev.subjects.filter((subject) => subject !== subjectName)
        : [...prev.subjects, subjectName];
      return { ...prev, subjects };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Map the school name to the desired format
    

    // Create a new object with the mapped school name
    const dataToSend = {
      ...teacherData
      
    };

    const response = await fetch("/api/teachersCreation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (response.ok) {
      setLoading(false);
      toast.success("Teacher created successfully!");
      router.push("/admin");
    } else {
      toast.error("Failed to create teacher");
    }
  };

  const signatureRef = useRef<SignatureCanvas | null>(null);
  const handleClearSignature = () => {
    signatureRef.current.clear();
    setTeacherData((prev) => ({ ...prev, signature: "" }));
  };

  const handleSaveSignature = () => {
    const signature = signatureRef.current.toDataURL();
    setTeacherData((prev) => ({ ...prev, signature }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg my-10 relative">
      {loading && <Loader />}
      <h1 className="text-2xl font-semibold text-center mb-6">
        {t("Create New Teacher")}
      </h1>
      <button
        className="absolute top-4 right-4 text-white bg-main flex items-center justify-center w-5 h-5 rounded-full text-sm font-semibold"
        onClick={() => router.back()}
      >
        X
      </button>
      <div className="w-full flex justify-end">
      <button
          className="text-white md:max-w-fit bg-main  rounded px-4 py-2 font-semibold"
          onClick={() => router.push('/bulkTeacher')}
        >
          {t('importFullSheet')}
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-lg font-medium text-gray-700">
            {t("name")} :
          </label>
          <input
            type="text"
            name="name"
            value={teacherData.name}
            onChange={handleChange}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Arabic Name Field */}
        <div>
          <label className="block text-lg font-medium text-gray-700">
            {t("Arabic Name")} :
          </label>
          <input
            type="text"
            name="arabicName"
            value={teacherData.arabicName}
            onChange={handleChange}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-lg font-medium text-gray-700">
            {t("Email")} :
          </label>
          <input
            type="email"
            name="email"
            value={teacherData.email}
            onChange={handleChange}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Username Field */}
      <div className="flex items-center justify-between flex-wrap w-full">
      <div>
          <label className="block text-lg font-medium text-gray-700">Username:</label>
          <input
            type="text"
            name="username"
            value={teacherData.username}
            onChange={handleChange}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Password:</label>
          <input
            type="password"
            name="password"
            value={teacherData.password}
            onChange={handleChange}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Role Field */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Role:</label>
          <select
            name="role"
            value={teacherData.role}
            onChange={handleChange}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TEACHER">TEACHER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPER-ADMIN">SUPER-ADMIN</option>
          </select>
        </div>
      </div>

        <div>
   <label className="block text-lg font-medium text-gray-700">
     {t("Academic Year")}:
   </label>
   <select
     name="academicYear"
     value={teacherData.academicYear}
     onChange={handleChange}
     required
     className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
   >
     <option value="" disabled>
       {t("selectAcademicYear")}
     </option>
     {academicYears.map((year) => (
       <option key={year} value={year}>
         {year}
       </option>
     ))}
   </select>
 </div>

 {/* School Field */}
 <div>
   <label className="block text-lg font-medium text-gray-700">
     {t("school")}
   </label>
   <select
     name="school"
     value={teacherData.school}
     onChange={handleChange}
     required
     className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
   >
     <option value="" disabled>
       {locale === "en" ? "Select School" : "اختر المدرسة"}
     </option>
     <option value="forqan">
       {locale === "en" ? "Alforqan School" : "الفرقان الأمريكي بالحمراء"}
     </option>
     <option value="batool1">
       {locale === "en" ? "Albatool Khaldia 1" : "البتول خالدية 1"}
     </option>
     <option value="batool2">
       {locale === "en" ? "Albatool Khaldia 2" : "البتول خالدية 2"}
     </option>
     <option value="batool3">
       {locale === "en" ? "Albatool Khaldia 3" : "البتول خالدية 3"}
     </option>
   </select>
 </div>

        <div>
          <label className="block text-lg font-medium text-gray-700">{t("Subjects")}:</label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {subjects.map((subject: any) => (
              <label key={subject.id} className="flex items-center">
                <input
                  type="checkbox"
                  value={subject.name}
                  checked={teacherData.subjects.includes(subject.name)}
                  onChange={() => handleSubjectChange(subject.name)}
                  className="mr-2"
                />
                {locale === "en" ? subject.name : subject.arabicName}
              </label>
            ))}
          </div>
        </div>

        {/* Signature */}
        <div>
          <SignatureCanvas
            ref={signatureRef}
            penColor="black"
            canvasProps={{ className: "border border-gray-300 rounded-md w-full h-40" }}
          />
          <div className="mt-2 flex gap-4 items-center justify-end">
            <button type="button" onClick={handleSaveSignature} className="p-3 bg-blue-500 text-white rounded-md">Save Signature</button>
            <button type="button" onClick={handleClearSignature} className="p-3 bg-red-500 text-white rounded-md">Clear Signature</button>
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 w-full py-3 px-6 bg-main text-white font-semibold rounded-md shadow-lg"
        >
          {locale === "en" ? "Create Teacher" : "تسجيل المعلم"}
        </button>
      </form>
    </div>
  );
};

export default TeacherCreation;
