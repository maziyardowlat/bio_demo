"use client";

import { useState } from "react";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#002145] text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">UBC</span>
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">
                Biology Department
              </h1>
              <p className="text-xs text-blue-200">Admin Portal</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-blue-200 hover:text-white transition-colors"
          >
            &larr; Back to Chat
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="py-8">
        {authenticated ? (
          <AdminDashboard />
        ) : (
          <LoginForm onSuccess={() => setAuthenticated(true)} />
        )}
      </main>
    </div>
  );
}
