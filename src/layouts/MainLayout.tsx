
import { Navbar } from "@/components/ui/navbar";
import { Outlet } from "react-router-dom";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-neutral-100 dark:from-neutral-900 dark:to-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

