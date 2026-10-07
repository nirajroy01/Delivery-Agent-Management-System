import type { Metadata } from 'next';
import '../app/globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Delivery Agent Management System',
  description: 'Delivery agent dashboard and management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <div className="app-shell">
          <Navbar />
          <div className="app-body">
            <Sidebar />
            <main className="main-content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
