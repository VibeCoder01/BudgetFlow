
import type {Metadata} from 'next';
import './globals.css';
import { ClientToaster } from '@/components/client-toaster'; // Import the new client component

export const metadata: Metadata = {
  title: 'BudgetFlow',
  description: 'Visually pleasing financial assistant by Shaun Dunmall',
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
      <body className="font-body antialiased min-h-screen flex flex-col">
        {children}
        <ClientToaster />
      </body>
    </html>
  );
}
