import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSideBar.jsx';

export default function AdminPanel() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}