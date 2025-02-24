"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';

import html2pdf from 'html2pdf.js';
import { useLocale, useTranslations } from 'next-intl';
import { createRoot } from 'react-dom/client';
import { NextIntlClientProvider } from 'next-intl';
import { sortReports } from '@/utils/sortReports';
import PrintForAll from '../_components/PrintForAll';
 // Import the sorting utility

const StudentsReportPage = () => {
  const [studentsReports, setStudentsReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filter, setFilter] = useState({ name: '', classId: '' });
  const [showModal, setShowModal] = useState(false); // For modal visibility
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const router = useRouter();
  const printContainerRef = useRef(null);
  const locale = useLocale();
  const t = useTranslations('Progress');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportsResponse = await fetch('/api/getAllStudentReports');
        if (!reportsResponse.ok) throw new Error('Failed to fetch reports');
        const reportsData = await reportsResponse.json();
        setStudentsReports(reportsData);
        setFilteredReports(reportsData);

        const classesResponse = await fetch('/api/getAllClasses');
        if (!classesResponse.ok) throw new Error('Failed to fetch classes');
        const classesData = await classesResponse.json();
        setClasses(classesData);
      } catch (error) {
        toast.error(error.message || 'An error occurred while fetching data.');
      }
    };

    fetchData();
  }, []);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilter((prevFilter) => {
      const updatedFilter = { ...prevFilter, [name]: value };
      const filtered = studentsReports.filter((report) => {
        const matchesName =
          !updatedFilter.name ||
          (report.name &&
            report.name.toLowerCase().includes(updatedFilter.name.toLowerCase()));
        const matchesClass =
          !updatedFilter.classId || report.class.id === updatedFilter.classId;

        return matchesName && matchesClass;
      });

      setFilteredReports(filtered);

      return updatedFilter;
    });
  };

  // Sort reports using the same logic as in SingleReportPage
  const sortedReports = sortReports(filteredReports);
console.log(sortedReports)
  // Handle print all
  const handlePrintAll = async () => {
    if (sortedReports.length === 0) {
      toast.error('No reports to print!');
      return;
    }

    setIsLoading(true); // Start loading

    // Render the reports into the print container
    const printContainer = printContainerRef.current;
    printContainer.innerHTML = ''; // Clear previous content

    // Render each report into the print container
    sortedReports.forEach((report, index) => {
      const reportDiv = document.createElement('div');
      reportDiv.classList.add('page-break');
      printContainer.appendChild(reportDiv);

      // Use createRoot to render the PrintForAll component into the div
      const root = createRoot(reportDiv);
      root.render(
        <NextIntlClientProvider locale={locale} messages={{ report: t }}>
          <PrintForAll report={report} />
        </NextIntlClientProvider>
      );
    });

    // Wait for the DOM to update
    await new Promise((resolve) => setTimeout(resolve, 500)); // Adjust delay if needed

    setIsLoading(false); // End loading

    // Show the modal after rendering is complete
    setShowModal(true);
  };

  // Handle download all
  const handleDownloadAll = async () => {
    if (sortedReports.length === 0) {
      toast.error('No reports to download!');
      return;
    }

    setIsLoading(true); // Start loading

    try {
      for (const report of sortedReports) {
        // Create a container for the report
        const reportContainer = document.createElement('div');
        reportContainer.classList.add('px-2', 'py-2', 'mx-auto', 'w-full');
        reportContainer.setAttribute('dir', 'ltr');

        // Use createRoot to render the PrintForAll component into the container
        const root = createRoot(reportContainer);
        root.render(
          <NextIntlClientProvider locale={locale} messages={{ report: t }}>
            <PrintForAll report={report} />
          </NextIntlClientProvider>
        );

        // Wait for the DOM to update
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust delay if needed

        const options = {
          margin: 0,
          PageSizes: 'A4',
          filename: `${report.iqamaNo}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { dpi: 192, scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
        };

        // Generate the PDF
        await html2pdf().from(reportContainer).set(options).save();

        // Clear the container after generating the PDF
        root.unmount();
        reportContainer.remove();
      }

      toast.success('All reports downloaded successfully!');
    } catch (error) {
      toast.error('Error downloading reports: ' + error.message);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // Handle view report
  const handleViewReport = (studentId) => {
    if (studentId) router.push(`/studentsReport/${studentId}`);
  };

  // Handle modal action
  const handleModalAction = (action) => {
    setShowModal(false);
    if (action === 'download') {
      handleDownloadAll();
    } else if (action === 'print') {
      const printContents = printContainerRef.current.innerHTML;
      const originalContents = document.body.innerHTML;

      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <div className="p-6 mt-10">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-semibold mb-6 text-center text-main">{t('students report')}</h1>

      {/* Filter Section */}
      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <input
          type="text"
          name="name"
          value={filter.name}
          onChange={handleFilterChange}
          placeholder={t('search by name')}
          className="border p-2 rounded w-[60%] md:w-1/3"
        />
        <select
          name="classId"
          value={filter.classId}
          onChange={handleFilterChange}
          className="border p-2 rounded w-1/3"
        >
          <option value="">{t('all classes')}</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
        <button
          onClick={handlePrintAll}
          className="bg-main text-white px-4 py-2 rounded transition duration-200"
          disabled={isLoading}
        >
          {isLoading ? 'Rendering...' : t('print all')}
        </button>
      </div>

      {/* Hidden Print Container */}
      <div ref={printContainerRef} className="hidden print:block">
        {/* Reports will be rendered here dynamically */}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4">Do you want to download all reports?</h2>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => handleModalAction('download')}
                className="bg-main hover:bg-third hover:text-main text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'OK'}
              </button>
              <button
                onClick={() => handleModalAction('print')}
                className=" bg-main hover:bg-third text-white hover:text-main px-4 py-2 rounded disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'No, Continue Printing'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-main hover:bg-third text-white hover:text-main px-4 py-2 rounded disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Reports Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200 text-sm">
            <tr>
              <th className="border p-4">{t('no')}</th>
              <th className="border p-4">{t('name')}</th>
              <th className="border p-4">{t('class')}</th>
              <th className="border p-4">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedReports?.map((report, index) => (
              <tr
                key={report.id}
                className="even:bg-gray-50 hover:bg-gray-100 transition duration-300"
              >
                <td className="border p-4">{index + 1}</td>
                <td className="border p-4">
                  {locale === 'en' ? report?.name : report?.arabicName || 'No Student Assigned'}
                </td>
                <td className="border p-4">
                  {classes?.find((cls) => cls.id === report.class.id)?.name || 'Unknown Class'}
                </td>
                <td className="border p-4 flex gap-2 justify-center">
                  <button
                    onClick={() => handleViewReport(report.id)}
                    className="text-main hover:underline transition duration-200"
                  >
                    {t('view report')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsReportPage;