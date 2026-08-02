import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { LockGate } from "@/components/LockGate";
import { Sidebar } from "@/components/Sidebar";
import { Toasts } from "@/components/Toasts";

export const metadata: Metadata = {
  title: "Office Dashboard",
  description: "Daily tasks and commission mistake prevention.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Applies the saved theme before first paint so there's no flash.
const themeScript = `(function(){try{var t=localStorage.getItem('ops.theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <LockGate>
          <AppProvider>
            <div className="app">
              <Sidebar />
              <main className="main">{children}</main>
            </div>
            <Toasts />
          </AppProvider>
        </LockGate>
      </body>
    </html>
  );
}
