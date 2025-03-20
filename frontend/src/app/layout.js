"use client"; 
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>My Next.js App</title>
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}