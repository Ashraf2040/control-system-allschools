"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "react-toastify";

export default function CSVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const validateCSV = async () => {
    if (!file) {
      toast.error("Please upload a CSV file.");
      return;
    }

    setLoading(true);
    setValidationErrors([]);
    setStudents([]);

    const reader = new FileReader();
    reader.onload = async () => {
      const fileContent = reader.result as string;
      const errors: string[] = [];
      const parsedStudents = [];

      const rows = fileContent.split("\n").slice(1); // Skip the header row

      for (const row of rows) {
        const columns = row.split(",");

        if (columns.length !== 11) {
          errors.push("Invalid row format: " + row);
          continue;
        }

        const [name, arabicName, dob, school, className, nationality, iqamaNo, passportNo, expenses, username, password] = columns;

        if (!name || !dob || !className || !iqamaNo || !passportNo) {
          errors.push(`Missing required fields in row: ${row}`);
        } else {
          parsedStudents.push({
            name,
            arabicName,
            dob,
            school,
            className, // Use className (e.g., "1A", "5C") as shown in your Class table
            nationality,
            iqamaNo,
            passportNo,
            expenses,
            username,
            password,
          });
        }
      }

      setValidationErrors(errors);
      setStudents(parsedStudents);
      setLoading(false);
    };

    reader.onerror = () => {
      alert("Error reading the file");
      setLoading(false);
    };

    reader.readAsText(file);
  };

  const uploadCSV = async () => {
    if (students.length === 0) {
      toast.error("No valid data to upload.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/students/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileContent: JSON.stringify(students), academicYear: selectedAcademicYear }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload students");
      }

      toast.success("CSV uploaded successfully");
    } catch (error: any) {
      alert("Error uploading CSV: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const t = useTranslations("bulkUpload");
  return (
    <div className="p-6 my-24">
      <h1 className="text-2xl font-semibold mb-6 text-center text-main">{t('bulkStudentsUpload')}</h1>
      <div className="mb-6">
        <label className="block text-lg font-medium text-main mb-4">{t('uploadCSVFile')}</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full md:max-w-fit text-main border p-3 rounded-md"
        />
        <a
          href="/Students_File.csv"
          download="Students_File.csv"
          className="text-blue-500 underline ml-2"
        >
          {t('downloadSampleFile')}
        </a>
      </div>
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
      <div className="mb-6 text-center font-semibold flex justify-center gap-5">
        <button
          onClick={validateCSV}
          disabled={loading}
          className={`px-6 py-3 bg-main text-white rounded-md ${loading ? "cursor-wait opacity-50" : ""}`}
        >
          {loading ? t('validating') : t('validateCSV')}
        </button>
        <button
          onClick={uploadCSV}
          disabled={loading || students.length === 0}
          className={`px-6 py-3 bg-red-900 text-white rounded-md ${loading ? "cursor-wait opacity-50" : ""}`}
        >
          {loading ? t('uploading') : t('importCSV')}
        </button>
      </div>
      {validationErrors.length > 0 && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          <h3 className="font-semibold mb-2">{t('validationErrors')}:</h3>
          <ul className="list-disc pl-6">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {students.length > 0 && !loading && (
        <div>
          <h3 className="text-xl font-semibold mb-4">{t('validatedStudents')}</h3>
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-200 text-sm">
              <tr>
                <th className="border px-4 py-2">{t('name')}</th>
                <th className="border px-4 py-2">{t('arabicName')}</th>
                <th className="border px-4 py-2">{t('dob')}</th>
                <th className="border px-4 py-2">{t('school')}</th>
                <th className="border px-4 py-2">{t('class')}</th>
                <th className="border px-4 py-2">{t('nationality')}</th>
                <th className="border px-4 py-2">{t('iqamaNo')}</th>
                <th className="border px-4 py-2">{t('passportNo')}</th>
                <th className="border px-4 py-2">{t('expenses')}</th>
                <th className="border px-4 py-2">{t('username')}</th>
                <th className="border px-4 py-2">{t('password')}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index} className="even:bg-gray-50 hover:bg-gray-100 transition duration-300">
                  <td className="border px-4 py-2">{student.name}</td>
                  <td className="border px-4 py-2">{student.arabicName}</td>
                  <td className="border px-4 py-2">{student.dob}</td>
                  <td className="border px-4 py-2">{student.school}</td>
                  <td className="border px-4 py-2">{student.className}</td>
                  <td className="border px-4 py-2">{student.nationality}</td>
                  <td className="border px-4 py-2">{student.iqamaNo}</td>
                  <td className="border px-4 py-2">{student.passportNo}</td>
                  <td className="border px-4 py-2">{student.expenses}</td>
                  <td className="border px-4 py-2">{student.username}</td>
                  <td className="border px-4 py-2">{student.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}