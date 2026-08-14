import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { logoutAction } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Профиль — Pricetitute",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Price<span className="text-hot">titute</span>
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:border-hot hover:text-hot"
          >
            Выйти
          </button>
        </form>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-line bg-surface p-5">
        <Avatar id={user.avatarId} size={64} />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{user.nickname}</p>
          <p className="truncate text-sm text-muted">@{user.login}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h1 className="mb-5 text-lg font-semibold">Профиль</h1>
        <ProfileForm nickname={user.nickname} avatarId={user.avatarId} />
      </div>
    </main>
  );
}
