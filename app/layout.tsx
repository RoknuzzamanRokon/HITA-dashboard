import type { Metadata } from "next";
import "./globals.css";
import { config } from "@/lib/config";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { ThemeProvider } from "@/lib/contexts/theme-context";
import { ToastProvider } from "@/lib/components/ui/toast";
import { NotificationProvider } from "@/lib/components/notifications/notification-provider";
import { NotificationContainer } from "@/lib/components/notifications/notification-container";

export const metadata: Metadata = {
  title: config.app.name,
  description: "Comprehensive admin panel for hotel management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <ToastProvider>{children}</ToastProvider>
              <NotificationContainer />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
