"use client";

import { useActionState, useState } from "react";
import { FormError, SubmitButton } from "@/components/ui/form";
import { EMPTY_FORM_STATE } from "@/lib/auth/form-state";
import { createRoomAction } from "@/lib/rooms/actions";

const BETTING_CHOICES = [
  { value: 60_000, label: "1 минута" },
  { value: 120_000, label: "2 минуты" },
  { value: 300_000, label: "5 минут" },
];

export function CreateRoomForm() {
  const [state, formAction] = useActionState(
    createRoomAction,
    EMPTY_FORM_STATE,
  );
  const [endMode, setEndMode] = useState<"endless" | "rounds" | "points">(
    "endless",
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FormError>{state.error}</FormError>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Время на ставки</legend>
        <div className="flex flex-wrap gap-2">
          {BETTING_CHOICES.map((choice, index) => (
            <label key={choice.value} className="cursor-pointer">
              <input
                type="radio"
                name="bettingMs"
                value={choice.value}
                defaultChecked={index === BETTING_CHOICES.length - 1}
                className="peer sr-only"
              />
              <span className="block rounded-lg border border-line bg-paper px-4 py-2 text-sm transition peer-checked:border-crimson peer-checked:bg-crimson peer-checked:text-paper">
                {choice.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Когда заканчиваем</legend>
        <div className="flex flex-col gap-2">
          <Choice
            name="endMode"
            value="endless"
            checked={endMode === "endless"}
            onSelect={() => setEndMode("endless")}
          >
            Играем, пока не надоест
          </Choice>
          <Choice
            name="endMode"
            value="rounds"
            checked={endMode === "rounds"}
            onSelect={() => setEndMode("rounds")}
          >
            До определённого числа раундов
          </Choice>
          <Choice
            name="endMode"
            value="points"
            checked={endMode === "points"}
            onSelect={() => setEndMode("points")}
          >
            Пока кто-нибудь не наберёт очки
          </Choice>
        </div>

        {endMode !== "endless" && (
          <label className="mt-3 flex items-center gap-3">
            <span className="text-sm text-muted">
              {endMode === "rounds" ? "Раундов" : "Очков"}
            </span>
            <input
              name="endValue"
              type="number"
              min={1}
              max={99}
              defaultValue={endMode === "rounds" ? 10 : 5}
              className="tabular w-20 rounded-lg border border-line bg-blush px-3 py-2 text-center outline-none transition focus:border-crimson"
            />
          </label>
        )}
      </fieldset>

      <label className="flex items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          name="includeAdult"
          defaultChecked
          className="mt-0.5 size-4 shrink-0 accent-crimson"
        />
        <span className="text-muted">
          Включить вопросы 18+. Без галочки в комнате будут только безобидные.
        </span>
      </label>

      <SubmitButton>Создать комнату</SubmitButton>
    </form>
  );
}

function Choice({
  name,
  value,
  checked,
  onSelect,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        className="size-4 accent-crimson"
      />
      <span>{children}</span>
    </label>
  );
}
