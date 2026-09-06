"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

// Distância mínima (px) de arraste horizontal pra contar como swipe e não como um toque/scroll
// vertical acidental.
const SWIPE_THRESHOLD_PX = 50;

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

  // Trava o scroll da página atrás do lightbox — sem isso, no celular dá pra arrastar a página
  // por baixo da foto em tela cheia, o que também atrapalha o toque nas setas.
  useEffect(() => {
    if (openIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [openIndex]);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Ignora arrastes mais verticais que horizontais (provável scroll, não swipe de foto).
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) < Math.abs(deltaY)) return;
    if (deltaX < 0) showNext();
    else showPrev();
  }

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
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-10 touch-none"
          onClick={close}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label={photos[openIndex].alt}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="absolute top-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white text-3xl leading-none hover:bg-black/60 active:bg-black/70 select-none"
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
            className="absolute left-1 sm:left-6 flex h-14 w-14 items-center justify-center rounded-full bg-black/40 text-white text-4xl leading-none hover:bg-black/60 active:bg-black/70 select-none"
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
            className="absolute right-1 sm:right-6 flex h-14 w-14 items-center justify-center rounded-full bg-black/40 text-white text-4xl leading-none hover:bg-black/60 active:bg-black/70 select-none"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
