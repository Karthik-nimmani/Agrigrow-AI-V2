import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </main>
  );
}
