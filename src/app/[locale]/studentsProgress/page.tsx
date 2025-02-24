"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from 'react-toastify';
import { useLocale, useTranslations } from "next-intl";
import { FiSettings } from "react-icons/fi"; // Import settings icon
import Loader from "../_components/Loader";

interface Student {
  id: string;
  name: string;
  arabicName: string;
  class: { name: string };
  reportStatus: string; // 'Done' or 'Not Yet'
  presentStatus?: string;
  recommendations?: string[];
  comment?: string;
  quizMark?: string;
  projectMark?: string;
}

const StudentsProgress: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const className = searchParams.get("class");
  const teacherName = searchParams.get("teacherName");
  const trimester = searchParams.get("trimester");
  const subject = searchParams.get("subject");
  const teacherId = searchParams.get("teacherId");

  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState<number | null>(null);
  const [reportFormData, setReportFormData] = useState({
    presentStatus: "",
    recommendations: [],
    comment: "",
    quizMark: "",
    projectMark: "",
  });

  const locale = useLocale();
  const t = useTranslations("Progress");

  useEffect(() => {
    const fetchStudents = async () => {
      if (!className || !subject || !trimester) {
        console.log("Missing required parameters: className, subject, or trimester");
        return;
      }

      try {
        const url = `/api/studentsProgress?className=${className}&subject=${subject}&trimester=${trimester}&teacherId=${teacherId}`;
        console.log(`Fetching students with URL: ${url}`);

        const response = await fetch(url);

        if (!response.ok) throw new Error("Failed to fetch students.");
        const data = await response.json();

        console.log("Fetched students:", data);
        setStudents(data);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching students.");
      }
    };

    fetchStudents();
  }, [className, subject, trimester, teacherName]);
 console.log(students)
  const handleAddReport = (index: number) => {
    setCurrentStudentIndex(index);
    setReportFormData({
      presentStatus: "",
      recommendations: [],
      comment: "",
      quizMark: "",
      projectMark: "",
    });
  };

  const handleEditReport = (index: number) => {
    const student = students[index];
    setCurrentStudentIndex(index);
    setReportFormData({
      presentStatus: student.presentStatus || "",
      recommendations: student.recommendations || [],
      comment: student.comment || "",
      quizMark: student.quizMark || "",
      projectMark: student.projectMark || "",
    });
  };

  const handleSaveReport = async () => {
    if (currentStudentIndex === null) return;
  
    const currentStudent = students[currentStudentIndex];
    setLoading(true);
    try {
      const isEdit = currentStudent?.reportStatus === "Done"; // Check if it's edit mode
      const apiRoute = isEdit ? "/api/editStudentReport" : "/api/saveStudentReport"; // Different API route for editing
      const method = isEdit ? "PUT" : "POST"; // Use PUT for editing
  
      const response = await fetch(apiRoute, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentStudent.id,
          report: reportFormData,
          className,
          subject,
          trimester,
          teacherName,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to save report.");
  
      if (!isEdit) {
        setStudents((prev) =>
          prev.map((student, index) =>
            index === currentStudentIndex
              ? { ...student, reportStatus: "Done" }
              : student
          )
        );
      }
  console.log(students)
      // Move to the next student and show their name
      if (currentStudentIndex + 1 < students.length) {
        const nextStudent = students[currentStudentIndex + 1];
        setCurrentStudentIndex(currentStudentIndex + 1);
        setReportFormData({
          presentStatus: "",
          recommendations: [],
          comment: "",
          quizMark: "",
          projectMark: "",
        });
        toast.info(`Saved !! Moving to ${nextStudent.name}...`);
      } else {
        // All students completed
        setCurrentStudentIndex(null);
        toast.success("All student reports have been added!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving the report.");
    }finally{
      setLoading(false)
    }
  };
  

  return (
    <div className="mx-auto  p-6 min-h-screen">
      {loading && <Loader />}
      <h1 className="text-2xl font-bold mb-4 text-center">
        {t("studentsProgressReport")} - {className}
      </h1>
      <table className="min-w-full bg-white shadow-lg rounded-lg border">
        <thead className="bg-gray-200">
          <tr>
            <th className={`p-3 ${locale === "en" ? "text-left" : "text-right"}`}>
              {t("no")}
            </th>
            <th className={`p-3 ${locale === "en" ? "text-left" : "text-right"}`}>
              {t("name")}
            </th>
            <th className={`p-3 ${locale === "en" ? "text-left" : "text-right"}`}>
              {t("class")}
            </th>
            <th className={`p-3 ${locale === "en" ? "text-left" : "text-right"} hidden md:block`}>
              {t("trimester")}
            </th>
            <th className={`p-3 ${locale === "en" ? "text-left" : "text-right"}`}>
              {t("report")}
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id} className="even:bg-gray-200 odd:bg-gray-100">
              <td className={`p-3 ${locale === "en" ? "text-left" : "text-right"}`}>
                {index + 1}
              </td>
              <td className={`p-3 ${locale === "en" ? "text-left" : "text-right"}`}>
                {locale === "en" ? student.name : student.arabicName}
              </td>
              <td className={`p-3 ${locale === "en" ? "text-left" : "text-right"}`}>
                {student.class?.name}
              </td>
              <td className={`p-3 ${locale === "en" ? "text-left" : "text-right"} hidden md:block`}>
                {t(`${trimester}`)}
              </td>
              <td className={`p-3 ${locale === "en" ? "text-left" : "text-right"}`}>
                {student.reportStatus === "Done" ? (
                  <div className="flex items-center gap-2">
                    <h1 className="text-green-700 font-bold">{t("done")}</h1>
                    <button
                      onClick={() => handleEditReport(index)}
                      className="text-main hover:text-gray-600 font-semibold"
                    >
                      <FiSettings className="inline-block mr-1" />
                      {/* {t("edit")} */}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddReport(index)}
                    className="bg-main hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                  >
                    {t("addReport")}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {currentStudentIndex !== null && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
           <div
      className={`bg-white p-6 rounded shadow-lg w-[90%] md:w-2/5 transform transition-all duration-100 ${
        currentStudentIndex !== null ? "opacity-100 scale-100" : "opacity-0 scale-0"
      }`}
    >
            <h2 className="text-xl font-bold mb-4 text-center">
              {/* {locale === "en" ? "Add/Edit Report for" : "إضافة/تعديل تقرير لـ"}{" "} */}
              {locale === "en"
                ? students[currentStudentIndex].name
                : students[currentStudentIndex].arabicName}
            </h2>
            <form>
              <div>
                <label className="block font-bold mb-2">{t("presentStatus")}:</label>
                <select
                  value={reportFormData.presentStatus}
                  onChange={(e) =>
                    setReportFormData((prev) => ({
                      ...prev,
                      presentStatus: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="">{t("select")}</option>
                  <option value="Excellent">{t("excellent")}</option>
                  <option value="Good">{t("good")}</option>
                  <option value="Average">{t("average")}</option>
                  <option value="Below Average">{t("belowAverage")}</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="block font-bold mb-2">{t("recommendations")}:</label>
                <div className="flex flex-wrap items-center justify-between">
                  {[`${t("continuedGoodWork")}`, `${t("betterWrittenWork")}`, `${t("moreSeriousApproach")}`, `${t("increasedPreparationAndStudy")}`, `${t("increasedClassParticipation")}`, `${t("additionalHelpNeeded")}`].map((rec) => (
                    <div key={rec} className="mb-2">
                      <label>
                        <input
                          type="checkbox"
                          value={rec}
                          checked={reportFormData.recommendations.includes(rec)}
                          onChange={(e) => {
                            const newRecommendations = e.target.checked
                              ? [...reportFormData.recommendations, rec]
                              : reportFormData.recommendations.filter((item) => item !== rec);
                            setReportFormData((prev) => ({
                              ...prev,
                              recommendations: newRecommendations,
                            }));
                          }}
                        />
                        <span className="ml-2">{rec}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="block font-bold mb-2">{t("comment")}:</label>
                <textarea
                  value={reportFormData.comment}
                  onChange={(e) =>
                    setReportFormData((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded"
                  rows={4}
                />
              </div>

             <div className="flex justify-between items-center gap-2">
             <div className="mt-4">
                <label className="block font-bold mb-2">{t("quizMark")}:</label>
                <input
                  type="number"
                  value={reportFormData.quizMark}
                  onChange={(e) =>
                    setReportFormData((prev) => ({
                      ...prev,
                      quizMark: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="mt-4">
                <label className="block font-bold mb-2">{t("projectMark")}:</label>
                <input
                  type="number"
                  value={reportFormData.projectMark}
                  onChange={(e) =>
                    setReportFormData((prev) => ({
                      ...prev,
                      projectMark: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
             </div>

              <button
                type="button"
                onClick={handleSaveReport}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
              >
                {students[currentStudentIndex].reportStatus === "Done" ? t("updateReport") : t("saveReport")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsProgress;
