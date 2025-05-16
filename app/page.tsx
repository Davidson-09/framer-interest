'use client'

import Image from "next/image";
import ModernSofa from "./components/ModernSofa";

export default function Home() {
  const handlePinterestLogin = () => {
    // Get the current URL to return to after authentication
    const currentUrl = window.location.href;
    window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(currentUrl)}`;
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold">Pinterest Integration</h1>
        <button
          onClick={handlePinterestLogin}
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#E60023] text-white gap-2 hover:bg-[#ad081b] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
        >
          Login with Pinterest
        </button>
      </main>
      <ModernSofa/>
    </div>
  );
}
