import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSideBar.jsx';
import ProductTable from '../components/ProductTable.jsx';

export default function AdminPanel() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      <ProductTable />
    </div>
  );
}