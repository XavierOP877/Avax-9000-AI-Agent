import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '../styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          {children}
          <Footer />
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}