import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
