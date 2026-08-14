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
    bg: "#2B2233",
    accessory: "none",
    accent: "#FF3D8B",
  },
  {
    species: "cat",
    body: "#9AA6BF",
    shade: "#7C88A3",
    belly: "#E4EAF5",
    bg: "#1F2433",
    accessory: "glasses",
    accent: "#F2E14C",
  },
  {
    species: "cat",
    body: "#4B4B5C",
    shade: "#3A3A47",
    belly: "#C9C9DB",
    bg: "#2E2434",
    accessory: "bowtie",
    accent: "#FF3D8B",
  },
  {
    species: "cat",
    body: "#EDE7DC",
    shade: "#CFC7B8",
    belly: "#FFFFFF",
    bg: "#26262F",
    accessory: "cap",
    accent: "#5CC98A",
  },

  // Собаки
  {
    species: "dog",
    body: "#C98A4B",
    shade: "#A66E36",
    belly: "#F0DCC0",
    bg: "#2A2131",
    accessory: "none",
    accent: "#4FB8C9",
  },
  {
    species: "dog",
    body: "#8C93A3",
    shade: "#6E7484",
    belly: "#E8ECF5",
    bg: "#202737",
    accessory: "cap",
    accent: "#FF6B4A",
  },
  {
    species: "dog",
    body: "#E3C79B",
    shade: "#C4A87C",
    belly: "#FBF1DE",
    bg: "#2F2620",
    accessory: "bowtie",
    accent: "#4FB8C9",
  },
  {
    species: "dog",
    body: "#5A5164",
    shade: "#453E4D",
    belly: "#D5CFE0",
    bg: "#241F2E",
    accessory: "glasses",
    accent: "#F2E14C",
  },

  // Ежи
  {
    species: "hedgehog",
    body: "#7A6552",
    shade: "#5C4C3D",
    belly: "#E8C9A0",
    bg: "#241F1A",
    accessory: "none",
    accent: "#5CC98A",
  },
  {
    species: "hedgehog",
    body: "#8C7BA6",
    shade: "#6C5C85",
    belly: "#EFD9C4",
    bg: "#221E33",
    accessory: "cap",
    accent: "#5CC98A",
  },
  {
    species: "hedgehog",
    body: "#6B7A5C",
    shade: "#4F5B43",
    belly: "#E5D3B0",
    bg: "#1F2620",
    accessory: "bowtie",
    accent: "#FF3D8B",
  },
  {
    species: "hedgehog",
    body: "#A6795C",
    shade: "#85604A",
    belly: "#F2DCC2",
    bg: "#2B2119",
    accessory: "glasses",
    accent: "#4FB8C9",
  },

  // Ящерки
  {
    species: "lizard",
    body: "#5CC98A",
    shade: "#3FA36A",
    belly: "#C8F2D9",
    bg: "#17291F",
    accessory: "none",
    accent: "#F2E14C",
  },
  {
    species: "lizard",
    body: "#4FB8C9",
    shade: "#3695A6",
    belly: "#C2EDF2",
    bg: "#16262B",
    accessory: "cap",
    accent: "#F2E14C",
  },
  {
    species: "lizard",
    body: "#8ED45C",
    shade: "#6DAF42",
    belly: "#DCF2C2",
    bg: "#1F2917",
    accessory: "glasses",
    accent: "#FF3D8B",
  },
  {
    species: "lizard",
    body: "#A97BD4",
    shade: "#8558B0",
    belly: "#E6D4F5",
    bg: "#241B33",
    accessory: "bowtie",
    accent: "#5CE68A",
  },

  // Лисы
  {
    species: "fox",
    body: "#F0803C",
    shade: "#C9631F",
    belly: "#FBEAD9",
    bg: "#2B1E18",
    accessory: "none",
    accent: "#4FB8C9",
  },
  {
    species: "fox",
    body: "#F5A45C",
    shade: "#D4813C",
    belly: "#FFF1E0",
    bg: "#2E241C",
    accessory: "bowtie",
    accent: "#4FB8C9",
  },
  {
    species: "fox",
    body: "#B0A6A0",
    shade: "#8E837D",
    belly: "#F2EDE8",
    bg: "#262326",
    accessory: "cap",
    accent: "#FF3D8B",
  },
  {
    species: "fox",
    body: "#A65437",
    shade: "#833F27",
    belly: "#F0D9C9",
    bg: "#241914",
    accessory: "glasses",
    accent: "#F2E14C",
  },

  // Лягушки
  {
    species: "frog",
    body: "#6FC94F",
    shade: "#52A337",
    belly: "#D5F2C4",
    bg: "#1B2917",
    accessory: "none",
    accent: "#FF3D8B",
  },
  {
    species: "frog",
    body: "#4F8C3F",
    shade: "#3B6B2F",
    belly: "#C6E0B4",
    bg: "#1A2417",
    accessory: "cap",
    accent: "#F2E14C",
  },
  {
    species: "frog",
    body: "#4FA8C9",
    shade: "#3A85A3",
    belly: "#C4E7F2",
    bg: "#16242B",
    accessory: "bowtie",
    accent: "#FF3D8B",
  },

  // Совы
  {
    species: "owl",
    body: "#A88CC9",
    shade: "#8468A6",
    belly: "#EDE0F5",
    bg: "#221C33",
    accessory: "none",
    accent: "#F2E14C",
  },
  {
    species: "owl",
    body: "#8C9BC9",
    shade: "#6B7AA6",
    belly: "#DEE5F5",
    bg: "#1B2033",
    accessory: "glasses",
    accent: "#F2E14C",
  },
  {
    species: "owl",
    body: "#C9A88C",
    shade: "#A68468",
    belly: "#F5E8DE",
    bg: "#2B2219",
    accessory: "cap",
    accent: "#5CC98A",
  },
  {
    species: "owl",
    body: "#6B6480",
    shade: "#524C63",
    belly: "#DCD7E8",
    bg: "#201D2B",
    accessory: "bowtie",
    accent: "#FF6B4A",
  },

  // Еноты
  {
    species: "raccoon",
    body: "#9AA3B2",
    shade: "#757D8A",
    belly: "#E8ECF2",
    bg: "#1F2229",
    accessory: "none",
    accent: "#5CC98A",
  },
  {
    species: "raccoon",
    body: "#A3907F",
    shade: "#7F6F61",
    belly: "#EDE2D8",
    bg: "#26211C",
    accessory: "cap",
    accent: "#4FB8C9",
  },
  {
    species: "raccoon",
    body: "#8494A8",
    shade: "#64738A",
    belly: "#DFE7F0",
    bg: "#1B222B",
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
