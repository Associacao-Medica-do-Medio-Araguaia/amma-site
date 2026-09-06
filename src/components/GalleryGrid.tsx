"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

interface Photo {
  id: number;
  src: string;
  alt: string;
  span: string;
}

export default function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const showPrev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const showNext = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openIndex, close, showPrev, showNext]);

  return (
    <>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 auto-rows-[160px]">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className={`${photo.span} relative rounded-xl overflow-hidden border border-border bg-surface-muted cursor-zoom-in select-none`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-10"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={photos[openIndex].alt}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-white text-3xl leading-none hover:opacity-70 select-none"
          >
            ×
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            aria-label="Foto anterior"
            className="absolute left-2 sm:left-6 text-white text-4xl leading-none hover:opacity-70 select-none"
          >
            ‹
          </button>

          <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[openIndex].src}
              alt={photos[openIndex].alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            aria-label="Próxima foto"
            className="absolute right-2 sm:right-6 text-white text-4xl leading-none hover:opacity-70 select-none"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
