
import { Navbar } from "@/components/ui/navbar";
import { Outlet } from "react-router-dom";

export function MainLayout() {
  return (
    <div className="crt min-h-screen bg-space-black text-spectral-white">
      <div className="scanlines" />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="prose prose-invert prose-cyan max-w-none">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
