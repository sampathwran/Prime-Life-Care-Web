import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Prime Life Care | වැඩිහිටි සාත්තු සේවය | Elderly & Patient Care Services Sri Lanka",
  description: "Certified, police-verified in-home nursing and elderly care services across Sri Lanka. 12-hour, 24-hour live-in care, post-surgery and dementia support.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  keywords: [
    "Elderly care Sri Lanka",
    "වැඩිහිටි සාත්තු සේවය",
    "Home nursing Sri Lanka",
    "Patient care Colombo",
    "Caregiver services Sri Lanka",
    "முதியோர் பராமரிப்பு இலங்கை"
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900">
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
