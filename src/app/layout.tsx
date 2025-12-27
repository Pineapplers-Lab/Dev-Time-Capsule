// app/layout.tsx
import './globals.css';

export const metadata = { title: 'Dev Capsule' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
