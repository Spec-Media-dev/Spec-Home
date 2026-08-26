"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type GalleryImage = { id: string; url: string };

/**
 * Design #1's bento layout: the cover leads, remaining images tile beside it.
 * With a hard cap of four images the grid never needs to reflow for overflow.
 */
export function PropertyGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const t = useTranslations("properties");
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) return null;

  const active = images[activeIndex];
  const rest = images.filter((_, index) => index !== activeIndex);

  return (
    <section aria-label={t("gallery")} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted md:aspect-[3/2]">
          <Image
            src={active.url}
            alt={t("imageAlt", { title, index: activeIndex + 1 })}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover"
          />
        </div>

        {rest.length > 0 ? (
          <div
            className={cn(
              "grid gap-3",
              rest.length === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-1",
            )}
          >
            {rest.map((image) => {
              const index = images.findIndex((item) => item.id === image.id);
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={t("imageAlt", { title, index: index + 1 })}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:aspect-auto md:min-h-24"
                >
                  <Image
                    src={image.url}
                    alt=""
                    aria-hidden
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
