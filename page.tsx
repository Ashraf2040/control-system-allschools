// app/admin/page.tsx

import { getAllSubjects } from '@/lib/actions';
import AdminUI from './src/app/[locale]/admin/AdminUI';
import { cookies } from 'next/headers';
 // Import the Client Component

const AdminPage = async () => {
   const userSchool = cookies().get('userSchool')?.value || 'default';
   
  // Fetch all teachers on the server side
  // const teachers = await getAllTeachers();
  const subjects = await getAllSubjects(userSchool);
  return (
    <div className="  print:p-0 print:m-0">
      
      {/* Pass teachers data to the Client Component */}
      <AdminUI subjects={subjects} />
    </div>
  );
};

export default AdminPage;
