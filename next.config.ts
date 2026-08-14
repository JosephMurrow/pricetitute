import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Явно фиксируем корень: иначе Turbopack уходит вверх по дереву в поисках
  // lock-файла и цепляет посторонний package-lock.json из домашней папки.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
