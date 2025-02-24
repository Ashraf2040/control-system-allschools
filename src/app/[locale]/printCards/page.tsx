"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  name: string;
  classId: string;
  username: string;
  password: string;
  expenses: string;
  // Assuming the class object has a grade and name
  class: {
    name: string;
    grade: number | string;
  };
}

const PrintCards = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("studentsManagement");
  const router = useRouter();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/allStudents");
        if (!response.ok) throw new Error("Failed to fetch students");
        const data: Student[] = await response.json();

        // Fetch classes to get grade information
        const classResponse = await fetch("/api/getAllClasses");
        if (!classResponse.ok) throw new Error("Failed to fetch classes");
        const classes = await classResponse.json();

        // Map students to include class details and sort by grade and class name
        const enrichedStudents = data.map((student) => {
          const studentClass = classes.find((cls: any) => cls.id === student.classId);
          return {
            ...student,
            class: {
              name: studentClass?.name || "Unknown Class",
              grade: studentClass?.grade || 0,
            },
          };
        }).sort((a, b) => {
          // Sort by grade (numeric) first, then class name alphabetically
          if (a.class.grade !== b.class.grade) {
            return Number(a.class.grade) - Number(b.class.grade);
          }
          return a.class.name.localeCompare(b.class.name);
        });

        setStudents(enrichedStudents);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students for print cards:", error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return <div className="p-6 text-center font-bold text-red-500">{t("loading")}</div>;
  }

  return (
    <div className="p-6 ">
      <h1 className="text-2xl underline font-semibold mb-6 text-center text-main">{t("printCards")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {students.map((student) => (
          <div
            key={student.id}
            className="relative  rounded-lg shadow-second p-2 border-4 border-main bg-white shadow-lg font-semibold flex flex-col items-start justify-start text-center"
          >
            <h2 className="text-lg font-semibold  text-main mb-2">{t("studentName")}: <span className="font-bold  self-center">{student.name}</span></h2>
            <div className="flex justify-center gap-6 items-center "><p className="text-gray-700 mb-1">{t("grade")}: {student.class.grade}</p>
            <p className="text-gray-700 mb-1">{t("class")}: {student.class.name}</p></div>
            <p className="text-gray-700 mb-1">{t("userName")}: {student.username}</p>
            <p className="text-gray-700">{t("password")}: {student.password}</p>
            <p className="underline text-gray-700">URL: www.ashrafdev.com</p>
            <div className="absolute top-2 right-2">{student.expenses ==="paid"? "✅":"❌"}</div>
          </div>
        ))}
      </div>
      <button
        className="mt-6 bg-main text-white px-6 py-2 rounded-md hover:bg-third hover:text-main transition font-semibold"
        onClick={() => router.back()}
      >
        {t("back")}
      </button>
    </div>
  );
};

export default PrintCards;