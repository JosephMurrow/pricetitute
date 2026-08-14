export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
        Price<span className="text-hot">titute</span>
      </h1>
      <p className="max-w-md text-balance text-muted">
        Угадай, за какую сумму человек согласился бы это сделать. Ближе всех к
        правде — забирает очко.
      </p>
      <p className="text-sm text-muted">
        Этап 0: каркас проекта. Игровые экраны появятся дальше по роадмапу.
      </p>
    </main>
  );
}
