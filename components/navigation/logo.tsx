"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { Settings } from "@/lib/meta";
import { useEffect, useState } from "react";

export function Logo() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const logoSrc = currentTheme === 'dark' ? Settings.siteiconDark : Settings.siteicon;

  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Image
        src={logoSrc}
        alt={`${Settings.title} main logo`}
        width={34}
        height={34}
        loading="lazy"
        decoding="async"
      />
      <h1 className="text-md font-semibold">{Settings.title}</h1>
    </Link>
  );
}
