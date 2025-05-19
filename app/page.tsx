'use client'

import Link from "next/link";
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
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handlePinterestLogin}
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#E60023] text-white gap-2 hover:bg-[#ad081b] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
          >
            Login with Pinterest
          </button>
          <Link
            href="/moodboards"
            className="rounded-full border border-solid border-gray-300 transition-colors flex items-center justify-center bg-white text-gray-800 gap-2 hover:bg-gray-100 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
          >
            View Moodboards
          </Link>
        </div>
        <p className="text-gray-600 max-w-md text-center sm:text-left">
          Create beautiful moodboards by selecting pins from your Pinterest account.
          Organize your ideas and inspirations in one place.
        </p>
      </main>
      <ModernSofa/>
    </div>
  );
}
