import { useState } from 'react';
import * as XLSX from 'xlsx';

interface Teacher {
  id: string;
  school: string;
  name: string;
  classes: { class: { name: string } }[];
  username: string;
  password: string;
}

interface AllTeachersModalProps {
  teachers: Teacher[];
  onClose: () => void;
}

const AllTeachersModal = ({ teachers, onClose }: AllTeachersModalProps) => {
  const handleSaveExcel = () => {
    // Prepare the data for the Excel file
    const data = teachers.map((teacher, index) => ({
      No: index + 1,
      School: teacher.school,
      'Teacher Name': teacher.name,
      Classes: teacher.classes.map((cls) => cls.class.name).join(', '),
      'User Name': teacher.username,
      Password: teacher.password,
    }));

    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers');

    // Generate the Excel file and trigger download
    XLSX.writeFile(workbook, 'All_Teachers_Details.xlsx');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
      <div className="bg-white p-6 rounded-lg w-3/4 shadow-xl h-[90%] overflow-y-scroll">
        <div className='flex items-center justify-between mb-4'>
        <h2 className="text-xl font-semibold ">All Teachers Details</h2>
        <div className=" flex items-center justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gray-200 px-6 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Close
          </button>
          <button
            onClick={handleSaveExcel}
            className="bg-main text-white px-6 py-2 rounded-md hover:bg-[#5C2747] transition"
          >
            Save Teachers Deatils
          </button>
        </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">No</th>
                <th className="border p-2">School</th>
                <th className="border p-2">Teacher Name</th>
                <th className="border p-2">Subject</th>
                <th className="border p-2">Classes</th>
                <th className="border p-2">User Name</th>
                <th className="border p-2">Password</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr key={teacher.id} className="even:bg-gray-50 hover:bg-gray-100 transition duration-300">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{teacher?.school}</td>
                  <td className="border p-2">{teacher?.name}</td>
                  <td className="border p-2">{teacher?.subjects[0]?.subject.name}</td>
                  <td className="border p-2">{teacher?.classes.map((cls) => cls.class.name).join(', ')}</td>
                  <td className="border p-2">{teacher?.username}</td>
                  <td className="border p-2">{teacher?.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
};

export default AllTeachersModal;