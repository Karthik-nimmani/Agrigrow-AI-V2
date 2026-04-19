import type {Metadata} from 'next';
import './globals.css';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

export const metadata: Metadata = {
  title: 'AgriGrow AI - Smart Farm Management',
  description: 'Precision farming tools powered by AI for rural ease of use.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/20 bg-background min-h-screen flex flex-col">
        <DashboardNav />
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
