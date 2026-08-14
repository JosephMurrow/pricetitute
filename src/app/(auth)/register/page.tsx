import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Регистрация — Pricetitute",
};

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center text-2xl font-bold tracking-tight"
        >
          Price<span className="text-hot">titute</span>
        </Link>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h1 className="mb-5 text-xl font-semibold">Регистрация</h1>
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
