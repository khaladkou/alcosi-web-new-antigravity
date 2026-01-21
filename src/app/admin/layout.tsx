import { Outfit, Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from 'sonner'

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
    display: "swap",
});

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

export const metadata = {
    title: "Alcosi Admin",
    description: "CMS Dashboard",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${outfit.variable} ${inter.variable} antialiased font-sans`}>
                {children}
                <Toaster richColors />
            </body>
        </html>
    );
}
