import { io, type Socket } from "socket.io-client";
import { signSessionToken } from "../src/lib/auth/token";
import { prisma } from "../src/lib/prisma";
import {
  CLIENT_EVENT,
  SERVER_EVENT,
  type Ack,
  type ChatMessagePayload,
  type RoomStatePayload,
} from "../src/shared/protocol";

const URL = "http://localhost:3000";

let failures = 0;
function check(label: string, condition: boolean, extra = "") {
  const mark = condition ? "✓" : "✗";
  if (!condition) failures += 1;
  console.log(`  ${mark} ${label}${extra ? ` — ${extra}` : ""}`);
}

class Client {
  readonly states: RoomStatePayload[] = [];
  readonly chat: ChatMessagePayload[] = [];
  private socket!: Socket;

  constructor(readonly name: string) {}

  async connect(token: string): Promise<void> {
    this.socket = io(URL, {
      transports: ["websocket"],
      extraHeaders: { Cookie: `pt_session=${token}` },
      forceNew: true,
    });

    this.socket.on(SERVER_EVENT.state, (state: RoomStatePayload) => {
      this.states.push(state);
    });
    this.socket.on(SERVER_EVENT.chatMessage, (message: ChatMessagePayload) => {
      this.chat.push(message);
    });

    await new Promise<void>((resolve, reject) => {
      this.socket.once("connect", () => resolve());
      this.socket.once("connect_error", (error: Error) => reject(error));
      setTimeout(() => reject(new Error("таймаут подключения")), 5000);
    });
  }

  get last(): RoomStatePayload | undefined {
    return this.states.at(-1);
  }

  emit(event: string, payload?: unknown): Promise<Ack> {
    return new Promise((resolve) => {
      const args: unknown[] = payload === undefined ? [] : [payload];
      this.socket.emit(event, ...args, (ack: Ack) => resolve(ack));
      setTimeout(() => resolve({ ok: false, error: "нет ответа" }), 3000);
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  /** Дождаться состояния, удовлетворяющего условию. */
  async waitState(
    predicate: (state: RoomStatePayload) => boolean,
    label: string,
  ): Promise<RoomStatePayload> {
    const deadline = Date.now() + 5000;
    while (Date.now() < deadline) {
      const found = this.states.findLast(predicate);
      if (found) return found;
      await sleep(50);
    }
    throw new Error(`${this.name}: не дождался состояния «${label}»`);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureUser(login: string, nickname: string, avatarId: number) {
  return prisma.user.upsert({
    where: { login },
    create: { login, passwordHash: "x", nickname, avatarId },
    update: { nickname, avatarId },
    select: { id: true, nickname: true },
  });
}

async function main() {
  const anya = await ensureUser("socket_anya", "Аня", 0);
  const borya = await ensureUser("socket_borya", "Боря", 5);

  const tokenA = await signSessionToken(anya.id, 3600);
  const tokenB = await signSessionToken(borya.id, 3600);

  console.log("\n[1] Подключение и ожидание второго игрока");
  const a = new Client("Аня");
  await a.connect(tokenA);
  const solo = await a.waitState((s) => s.phase === "waiting", "ожидание");
  check("одна вкладка — комната на паузе", solo.phase === "waiting");
  check(
    "названа причина паузы",
    solo.pauseReason === "not_enough_players",
    String(solo.pauseReason),
  );

  const b = new Client("Боря");
  await b.connect(tokenB);
  const started = await a.waitState(
    (s) => s.phase === "ready",
    "раунд начался",
  );
  check("второй игрок запустил раунд", started.phase === "ready");
  check("ведущий — тот, кто зашёл первым", started.hostId === anya.id);
  check(
    "дедлайн пришёл абсолютным временем",
    typeof started.deadline === "number",
  );
  check(
    "сервер прислал своё время для отсчёта",
    Math.abs(started.serverTime - Date.now()) < 5000,
  );

  console.log("\n[2] Вопрос в фазе READY виден только ведущему");
  const hostView = await a.waitState((s) => s.phase === "ready", "ready у Ани");
  const guestView = await b.waitState(
    (s) => s.phase === "ready",
    "ready у Бори",
  );
  check("ведущий видит вопрос", typeof hostView.question === "string");
  check("остальные вопроса не видят", guestView.question === null);
  console.log(`      вопрос: ${hostView.question}`);

  console.log("\n[3] Чужие действия и права");
  const wrongRead = await b.emit(CLIENT_EVENT.read);
  check("не ведущему нажать «Прочитал» нельзя", !wrongRead.ok, wrongRead.error);

  const read = await a.emit(CLIENT_EVENT.read);
  check("ведущий подтвердил, что прочитал", read.ok);
  const opened = await b.waitState(
    (s) => s.phase === "host_answer",
    "вопрос открыт",
  );
  check(
    "после «Прочитал» вопрос открыт всем",
    typeof opened.question === "string",
  );

  console.log("\n[4] Ответ ведущего скрыт до вскрышки");
  const badBet = await a.emit(CLIENT_EVENT.answer, { bet: 10_000_000_000 });
  check("сумма сверх потолка отклонена", !badBet.ok, badBet.error);

  const answer = await a.emit(CLIENT_EVENT.answer, { bet: 100_000 });
  check("ведущий назвал сумму", answer.ok);

  const betting = await b.waitState(
    (s) => s.phase === "betting",
    "ставки открыты",
  );
  check("ответ ведущего не утёк в состояние", betting.reveal === null);
  check(
    "в сыром состоянии нет суммы ведущего",
    !JSON.stringify(betting).includes("100000"),
  );

  console.log("\n[5] Ставки");
  const hostBet = await a.emit(CLIENT_EVENT.bet, { bet: 50_000 });
  check("ведущий ставить не может", !hostBet.ok, hostBet.error);

  const bet = await b.emit(CLIENT_EVENT.bet, { bet: 300_000 });
  check("игрок поставил", bet.ok);

  const repeat = await b.emit(CLIENT_EVENT.bet, { bet: 1000 });
  check("ставку не поменять", !repeat.ok, repeat.error);

  console.log("\n[6] Вскрышка");
  const reveal = await b.waitState((s) => s.phase === "reveal", "вскрышка");
  check("фаза сменилась досрочно, все поставили", reveal.phase === "reveal");
  check("ответ ведущего раскрыт", reveal.reveal?.hostAnswer === 100_000);
  check("победитель определён", reveal.reveal?.bets[0]?.won === true);
  check(
    "очко засчитано",
    reveal.players.find((p) => p.id === borya.id)?.score === 1,
  );
  check(
    "ведущий без очков",
    reveal.players.find((p) => p.id === anya.id)?.score === 0,
  );

  console.log("\n[7] Чат и лимиты");
  const chat = await a.emit(CLIENT_EVENT.chat, { text: "всем привет" });
  check("сообщение принято", chat.ok);
  await sleep(200);
  check("собеседник его получил", b.chat.at(-1)?.text === "всем привет");

  const empty = await a.emit(CLIENT_EVENT.chat, { text: "   " });
  check("пустое сообщение отклонено", !empty.ok, empty.error);

  const long = await a.emit(CLIENT_EVENT.chat, { text: "я".repeat(301) });
  check("слишком длинное отклонено", !long.ok, long.error);

  let throttled = 0;
  for (let i = 0; i < 8; i++) {
    const result = await a.emit(CLIENT_EVENT.chat, { text: `спам ${i}` });
    if (!result.ok) throttled += 1;
  }
  check("частый спам придушен", throttled > 0, `отклонено ${throttled} из 8`);

  console.log("\n[8] Реконнект");
  b.disconnect();
  await sleep(300);
  const b2 = new Client("Боря снова");
  await b2.connect(tokenB);
  const restored = await b2.waitState((s) => s.players.length >= 1, "снимок");
  check("после реконнекта пришёл полный снимок", restored.players.length >= 1);
  check(
    "очки на месте",
    restored.players.find((p) => p.id === borya.id)?.score === 1,
  );
  console.log(
    `      фаза после реконнекта: ${restored.phase}, игроков: ${restored.players.length}`,
  );

  console.log("\n[9] Неаутентифицированный клиент");
  const stranger = io(URL, { transports: ["websocket"], forceNew: true });
  const rejected = await new Promise<boolean>((resolve) => {
    stranger.once("connect", () => resolve(false));
    stranger.once("connect_error", () => resolve(true));
    setTimeout(() => resolve(false), 3000);
  });
  stranger.close();
  check("без сессии не пускают", rejected);

  a.disconnect();
  b2.disconnect();
  await sleep(200);

  await prisma.round.deleteMany({ where: { roomKey: "global" } });
  await prisma.score.deleteMany({ where: { roomKey: "global" } });
  await prisma.user.deleteMany({
    where: { login: { in: ["socket_anya", "socket_borya"] } },
  });

  console.log(
    failures === 0
      ? "\nВсе проверки прошли\n"
      : `\nПровалено проверок: ${failures}\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
