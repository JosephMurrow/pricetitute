import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BRAND } from "@/components/Brand";
import { GameRoom } from "@/components/game/GameRoom";
import { getCurrentUser } from "@/lib/auth/session";
import { findPrivateRoom } from "@/lib/rooms/private";

export const metadata: Metadata = {
  title: `Своя комната — ${BRAND}`,
};

export default async function PrivateRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const user = await getCurrentUser();

  // Незалогиненного отправляем на вход и возвращаем сюда же.
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/r/${code}`)}`);
  }

  const room = await findPrivateRoom(code);
  if (!room) {
    notFound();
  }

  return (
    <GameRoom
      nickname={user.nickname}
      avatarId={user.avatarId}
      roomCode={room.code}
    />
  );
}
