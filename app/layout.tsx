import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
    title: 'AI Чат с документами',
    description: 'RAG система для работы с документами',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru">
        <body className={inter.className}>
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex space-x-8">
                        <Link
                            href="/"
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                            🏠 Чат
                        </Link>
                        <Link
                            href="/documents"
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                            📄 Документы
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
        <main className="min-h-screen bg-gray-100">
            {children}
        </main>
        </body>
        </html>
    );
}
