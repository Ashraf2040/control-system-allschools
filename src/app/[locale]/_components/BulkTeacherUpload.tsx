"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import Loader from "../_components/Loader";

const BulkTeacherCreation = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const t = useTranslations("teacherCreation");

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Validate CSV file content
  const validateCSV = async () => {
    if (!file) {
      toast.error("Please upload a CSV file.");
      return;
    }

    setLoading(true);
    setValidationErrors([]);
    setTeachers([]);

    const reader = new FileReader();
    reader.onload = async () => {
      const fileContent = reader.result as string;
      const errors: string[] = [];
      const parsedTeachers = [];

      const rows = fileContent.split("\n").slice(1); // Skip header row

      for (const row of rows) {
        const columns = row.split(",");

        if (columns.length < 9) { // Minimum required fields: name, email, username, password, role, academicYear, subjects, school
          errors.push("Invalid row format: " + row);
          continue;
        }

        const [name, arabicName, email, username, password, role, academicYear, subjects, school, signature] = columns;

        // Validate required fields
        if (!name || !email || !username || !password || !academicYear || !school) {
          errors.push(`Missing required fields in row: ${row}`);
        } else {
          parsedTeachers.push({
            name,
            arabicName,
            email,
            username,
            password,
            role: role || "TEACHER",
            academicYear,
            subjects: subjects ? subjects.split(",").map((s: string) => s.trim()) : [],
            school,
            signature: signature || null,
          });
        }
      }

      setValidationErrors(errors);
      setTeachers(parsedTeachers);
      setLoading(false);
    };

    reader.onerror = () => {
      toast.error("Error reading the file");
      setLoading(false);
    };

    reader.readAsText(file);
  };

  // Handle CSV upload after validation
  const handleSubmit = async () => {
    if (teachers.length === 0) {
      toast.error("No valid data to upload.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file!); // Use the original file for server-side processing

    try {
      const response = await fetch("/api/bulkTeachersCreation", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        router.push("/admin");
      } else {
        const errorMsg = result.failedTeachers
          ? `Failed to create teachers: ${result.failedTeachers.map((t: any) => `${t.email} - ${t.error}`).join(", ")}`
          : result.error || "Unknown error";
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error("An error occurred during upload.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg my-10 relative">
      {loading && <Loader />}
      <h1 className="text-2xl font-semibold text-center mb-6">
        {t("Bulk Create Teachers")}
      </h1>
      <button
        className="absolute top-4 right-4 text-white bg-main flex items-center justify-center w-5 h-5 rounded-full text-sm font-semibold"
        onClick={() => router.back()}
      >
        X
      </button>

      {/* File Upload Section */}
      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-700">
          {t("Upload CSV File")}:
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-2 text-sm text-gray-500">
          CSV should contain columns: name, arabicName, email, username, password, role, academicYear, subjects (comma-separated), school, signature (optional).
        </p>
      </div>

      {/* Validation and Import Buttons */}
      <div className="mb-6 text-center flex justify-center gap-5">
        <button
          onClick={validateCSV}
          disabled={loading}
          className={`px-6 py-3 bg-blue-500 text-white rounded-md ${loading ? "cursor-wait opacity-50" : ""}`}
        >
          {loading ? "Validating..." : "Validate CSV"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || teachers.length === 0}
          className={`px-6 py-3 bg-main text-white rounded-md ${loading || teachers.length === 0 ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {loading ? "Importing..." : "Import CSV"}
        </button>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          <h3 className="font-semibold mb-2">Validation Errors:</h3>
          <ul className="list-disc pl-6">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview Table */}
      {teachers.length > 0 && !loading && (
  <div>
    <h3 className="text-xl font-semibold mb-4">{t("Validated Teachers")}</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-200 text-sm">
          <tr>
            <th className="border px-4 py-2 whitespace-nowrap">{t("name")}</th>
            <th className="border px-4 py-2 whitespace-nowrap">{t("Arabic Name")}</th>
            <th className="border px-4 py-2 whitespace-nowrap">{t("Email")}</th>
            <th className="border px-4 py-2 whitespace-nowrap">Username</th>
            <th className="border px-4 py-2 whitespace-nowrap">Password</th>
            <th className="border px-4 py-2 whitespace-nowrap">Role</th>
            <th className="border px-4 py-2 whitespace-nowrap">{t("Academic Year")}</th>
            <th className="border px-4 py-2 whitespace-nowrap">{t("Subjects")}</th>
            <th className="border px-4 py-2 whitespace-nowrap">{t("school")}</th>
            <th className="border px-4 py-2 whitespace-nowrap">Signature</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher, index) => (
            <tr key={index} className="even:bg-gray-50 hover:bg-gray-100 transition duration-300">
              <td className="border px-4 py-2 whitespace-nowrap">{teacher.name}</td>
              <td className="border px-4 py-2 whitespace-nowrap">{teacher.arabicName}</td>
              <td className="border px-4 py-2 whitespace-nowrap">{teacher.email}</td>
              <td className="border px-4 py-2 whitespace-nowrap">{teacher.username}</td>
              <td className="border px-4 py-2 whitespace-nowrap">{teacher.password}</td>
              <td className="border px-4 py-2 whitespace-nowrap">{teacher.role}</td>
              <td className="border px-4 py-2 whitespace-nowrap">{teacher.academicYear}</td>
              <td className="border px-4 py-2 whitespace-nowrap">{teacher.subjects.join(", ")}</td>
              <td className="border px-4 py-2 whitespace-nowrap">{teacher.school}</td>
              <td className="border px-4 py-2 whitespace-nowrap">{teacher.signature || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
    </div>
  );
};

export default BulkTeacherCreation;