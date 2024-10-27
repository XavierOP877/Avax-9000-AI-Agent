import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Footer } from '@/components/layout/Footer';
import '../styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col antialiased">
        <main className="flex-grow container mx-auto px-4 py-8 md:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {children}
          </div>
        </main>
        <Footer />
        <Toaster 
          position="top-right" 
          toastOptions={{
            className: 'shadow-lg',
            style: {
              borderRadius: '8px',
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}