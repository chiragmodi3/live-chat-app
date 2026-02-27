import { ClerkProvider } from "@clerk/nextjs";
import Provider from "../components/Provider";
import SyncUser from "../components/SyncUser";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <SyncUser />
          {children}
        </Provider>
      </body>
    </html>
  );
}
