/**
 * Пул аватаров: 8 зверей в цветовых вариантах, местами с аксессуаром.
 * Рисуются в SVG (см. src/components/Avatar.tsx), картинок на диске нет.
 */

export type Species =
  "cat" | "dog" | "hedgehog" | "lizard" | "fox" | "frog" | "owl" | "raccoon";

export type Accessory = "none" | "cap" | "glasses" | "bowtie";

export interface AvatarSpec {
  species: Species;
  /** Основной цвет зверя. */
  body: string;
  /** Затемнённый оттенок: уши, шипы, хохолки. */
  shade: string;
  /** Светлый оттенок: морда, брюшко, диски глаз. */
  belly: string;
  /** Фон кружка. */
  bg: string;
  accessory: Accessory;
  /** Цвет аксессуара. */
  accent: string;
}

export const AVATARS: readonly AvatarSpec[] = [
  // Коты
  {
    species: "cat",
    body: "#F2A03D",
    shade: "#D9822B",
    belly: "#FBE3C2",
    bg: "#FFEEDC",
    accessory: "none",
    accent: "#FF3D8B",
  },
  {
    species: "cat",
    body: "#9AA6BF",
    shade: "#7C88A3",
    belly: "#E4EAF5",
    bg: "#EAF0FA",
    accessory: "glasses",
    accent: "#F2E14C",
  },
  {
    species: "cat",
    body: "#4B4B5C",
    shade: "#3A3A47",
    belly: "#C9C9DB",
    bg: "#F0ECF5",
    accessory: "bowtie",
    accent: "#FF3D8B",
  },
  {
    species: "cat",
    body: "#EDE7DC",
    shade: "#CFC7B8",
    belly: "#FFFFFF",
    bg: "#F7F2EA",
    accessory: "cap",
    accent: "#5CC98A",
  },

  // Собаки
  {
    species: "dog",
    body: "#C98A4B",
    shade: "#A66E36",
    belly: "#F0DCC0",
    bg: "#F7EBDD",
    accessory: "none",
    accent: "#4FB8C9",
  },
  {
    species: "dog",
    body: "#8C93A3",
    shade: "#6E7484",
    belly: "#E8ECF5",
    bg: "#E9EFF7",
    accessory: "cap",
    accent: "#FF6B4A",
  },
  {
    species: "dog",
    body: "#E3C79B",
    shade: "#C4A87C",
    belly: "#FBF1DE",
    bg: "#FAF2E4",
    accessory: "bowtie",
    accent: "#4FB8C9",
  },
  {
    species: "dog",
    body: "#5A5164",
    shade: "#453E4D",
    belly: "#D5CFE0",
    bg: "#EFEBF3",
    accessory: "glasses",
    accent: "#F2E14C",
  },

  // Ежи
  {
    species: "hedgehog",
    body: "#7A6552",
    shade: "#5C4C3D",
    belly: "#E8C9A0",
    bg: "#F4EDE4",
    accessory: "none",
    accent: "#5CC98A",
  },
  {
    species: "hedgehog",
    body: "#8C7BA6",
    shade: "#6C5C85",
    belly: "#EFD9C4",
    bg: "#F0EBF7",
    accessory: "cap",
    accent: "#5CC98A",
  },
  {
    species: "hedgehog",
    body: "#6B7A5C",
    shade: "#4F5B43",
    belly: "#E5D3B0",
    bg: "#EDF2E8",
    accessory: "bowtie",
    accent: "#FF3D8B",
  },
  {
    species: "hedgehog",
    body: "#A6795C",
    shade: "#85604A",
    belly: "#F2DCC2",
    bg: "#F8EFE4",
    accessory: "glasses",
    accent: "#4FB8C9",
  },

  // Ящерки
  {
    species: "lizard",
    body: "#5CC98A",
    shade: "#3FA36A",
    belly: "#C8F2D9",
    bg: "#E6F7EC",
    accessory: "none",
    accent: "#F2E14C",
  },
  {
    species: "lizard",
    body: "#4FB8C9",
    shade: "#3695A6",
    belly: "#C2EDF2",
    bg: "#E4F4F7",
    accessory: "cap",
    accent: "#F2E14C",
  },
  {
    species: "lizard",
    body: "#8ED45C",
    shade: "#6DAF42",
    belly: "#DCF2C2",
    bg: "#EDF7E2",
    accessory: "glasses",
    accent: "#FF3D8B",
  },
  {
    species: "lizard",
    body: "#A97BD4",
    shade: "#8558B0",
    belly: "#E6D4F5",
    bg: "#F2EAFA",
    accessory: "bowtie",
    accent: "#5CE68A",
  },

  // Лисы
  {
    species: "fox",
    body: "#F0803C",
    shade: "#C9631F",
    belly: "#FBEAD9",
    bg: "#FDEEE2",
    accessory: "none",
    accent: "#4FB8C9",
  },
  {
    species: "fox",
    body: "#F5A45C",
    shade: "#D4813C",
    belly: "#FFF1E0",
    bg: "#FDF1E6",
    accessory: "bowtie",
    accent: "#4FB8C9",
  },
  {
    species: "fox",
    body: "#B0A6A0",
    shade: "#8E837D",
    belly: "#F2EDE8",
    bg: "#F4F1EF",
    accessory: "cap",
    accent: "#FF3D8B",
  },
  {
    species: "fox",
    body: "#A65437",
    shade: "#833F27",
    belly: "#F0D9C9",
    bg: "#F7E9E0",
    accessory: "glasses",
    accent: "#F2E14C",
  },

  // Лягушки
  {
    species: "frog",
    body: "#6FC94F",
    shade: "#52A337",
    belly: "#D5F2C4",
    bg: "#EBF7E4",
    accessory: "none",
    accent: "#FF3D8B",
  },
  {
    species: "frog",
    body: "#4F8C3F",
    shade: "#3B6B2F",
    belly: "#C6E0B4",
    bg: "#E9F2E4",
    accessory: "cap",
    accent: "#F2E14C",
  },
  {
    species: "frog",
    body: "#4FA8C9",
    shade: "#3A85A3",
    belly: "#C4E7F2",
    bg: "#E4F1F7",
    accessory: "bowtie",
    accent: "#FF3D8B",
  },

  // Совы
  {
    species: "owl",
    body: "#A88CC9",
    shade: "#8468A6",
    belly: "#EDE0F5",
    bg: "#F2ECFA",
    accessory: "none",
    accent: "#F2E14C",
  },
  {
    species: "owl",
    body: "#8C9BC9",
    shade: "#6B7AA6",
    belly: "#DEE5F5",
    bg: "#EAEEF9",
    accessory: "glasses",
    accent: "#F2E14C",
  },
  {
    species: "owl",
    body: "#C9A88C",
    shade: "#A68468",
    belly: "#F5E8DE",
    bg: "#F9F0E6",
    accessory: "cap",
    accent: "#5CC98A",
  },
  {
    species: "owl",
    body: "#6B6480",
    shade: "#524C63",
    belly: "#DCD7E8",
    bg: "#F0EEF5",
    accessory: "bowtie",
    accent: "#FF6B4A",
  },

  // Еноты
  {
    species: "raccoon",
    body: "#9AA3B2",
    shade: "#757D8A",
    belly: "#E8ECF2",
    bg: "#EDF0F4",
    accessory: "none",
    accent: "#5CC98A",
  },
  {
    species: "raccoon",
    body: "#A3907F",
    shade: "#7F6F61",
    belly: "#EDE2D8",
    bg: "#F5EFE9",
    accessory: "cap",
    accent: "#4FB8C9",
  },
  {
    species: "raccoon",
    body: "#8494A8",
    shade: "#64738A",
    belly: "#DFE7F0",
    bg: "#EBF0F6",
    accessory: "glasses",
    accent: "#FF3D8B",
  },
];

export const AVATAR_COUNT = AVATARS.length;

/** Опорные точки для аксессуаров: у зверей глаза и макушка на разной высоте. */
export const SPECIES_ANCHORS: Record<
  Species,
  { eyeY: number; eyeDx: number; topY: number }
> = {
  cat: { eyeY: 34, eyeDx: 7, topY: 17 },
  dog: { eyeY: 32, eyeDx: 7, topY: 16 },
  hedgehog: { eyeY: 41, eyeDx: 6, topY: 13 },
  lizard: { eyeY: 33, eyeDx: 10, topY: 15 },
  fox: { eyeY: 33, eyeDx: 8, topY: 16 },
  frog: { eyeY: 23, eyeDx: 13, topY: 16 },
  owl: { eyeY: 33, eyeDx: 9, topY: 16 },
  raccoon: { eyeY: 32, eyeDx: 8, topY: 16 },
};

/** Аватар по индексу; индекс за пределами пула заворачивается по кругу. */
export function getAvatar(id: number): AvatarSpec {
  const size = AVATARS.length;
  const index = ((Math.trunc(id) % size) + size) % size;
  const spec = AVATARS[index];
  if (!spec) {
    throw new Error(`Аватар с индексом ${id} не найден`);
  }
  return spec;
}

export function randomAvatarId(): number {
  return Math.floor(Math.random() * AVATARS.length);
}
