import type { Metadata } from "next";
import "./globals.css";
import { config } from "@/lib/config";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { ThemeProvider } from "@/lib/contexts/theme-context";
import { QueryProvider } from "@/lib/providers/query-provider";
import { ToastProvider } from "@/lib/components/ui/toast";
import { NotificationProvider } from "@/lib/components/notifications/notification-provider";
import { NotificationContainerLazy } from "@/lib/components/notifications/notification-container-lazy";
import { ChunkErrorHandler } from "@/lib/components/error/chunk-error-handler";
import { ServiceWorkerInitializer } from "@/lib/components/service-worker-initializer";

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
          <QueryProvider>
            <AuthProvider>
              <NotificationProvider>
                <ToastProvider>{children}</ToastProvider>
                <NotificationContainerLazy />
                <ChunkErrorHandler />
                <ServiceWorkerInitializer />
              </NotificationProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
