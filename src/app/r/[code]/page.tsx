import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BRAND } from "@/components/Brand";
import { GameRoom } from "@/components/game/GameRoom";
import { HardcoreGate } from "@/components/rooms/HardcoreGate";
import { getCurrentUser } from "@/lib/auth/session";
import { isHardcore } from "@/lib/questions/modes";
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

  const game = (
    <GameRoom
      nickname={user.nickname}
      avatarId={user.avatarId}
      roomCode={room.code}
    />
  );

  // В комнату с чернотой человек попадает только через предупреждение.
  if (isHardcore(room.mode)) {
    return <HardcoreGate code={room.code}>{game}</HardcoreGate>;
  }

  return game;
}
