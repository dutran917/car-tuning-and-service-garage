"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { BrandIcon } from "@/components/BrandIcon";
import type { ArticleImage } from "@/lib/managed-content";

function imageSource(url: string, width: number) {
  if (process.env.NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORMS !== "true" || !url.includes("/storage/v1/object/public/")) return url;
  const transformed = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  return `${transformed}${transformed.includes("?") ? "&" : "?"}width=${width}&quality=82&resize=contain`;
}

export function ArticleGallery({ images }: { images: ArticleImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeImage = images[activeIndex];

  // Touch tracking for swipe gestures
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const didSwipeRef = useRef(false);

  const previous = useCallback(() => {
    setActiveIndex((index) => (index - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((index) => (index + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (lightboxOpen) {
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = "hidden";
    } else {
      if (dialog.open) dialog.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!lightboxOpen || images.length < 2) return;
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, lightboxOpen, next, previous]);

  // Keep active thumbnail centered and visible
  useEffect(() => {
    const thumb = thumbRefs.current[activeIndex];
    if (thumb) {
      thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeIndex]);

  if (!images.length || !activeImage) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
    didSwipeRef.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || images.length < 2) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Recognizes swipe if:
    // 1. Horizontal distance > 35px OR (horizontal distance > 22px in fast flick under 300ms)
    // 2. Horizontal movement is dominant over vertical (absDx > absDy * 1.15)
    if ((absDx > 35 || (absDx > 22 && dt < 300)) && absDx > absDy * 1.15) {
      didSwipeRef.current = true;
      if (dx < 0) {
        next();
      } else {
        previous();
      }
      setTimeout(() => {
        didSwipeRef.current = false;
      }, 350);
    }
  };

  const handleOpenClick = (e: React.MouseEvent) => {
    if (didSwipeRef.current) {
      e.preventDefault();
      e.stopPropagation();
      didSwipeRef.current = false;
      return;
    }
    setLightboxOpen(true);
  };

  return (
    <section className="photo-album" aria-label="Thư viện ảnh">
      <div
        className="photo-album-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          className="photo-album-open"
          type="button"
          onClick={handleOpenClick}
          aria-label={`Mở ảnh ${activeIndex + 1} kích thước lớn`}
        >
          <Image
            key={activeImage.url}
            className="album-stage-img"
            src={imageSource(activeImage.url, 1600)}
            alt={activeImage.alt}
            fill
            sizes="(max-width: 800px) 100vw, 900px"
            priority
            unoptimized
          />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="photo-album-arrow photo-album-prev"
              onClick={previous}
              aria-label="Ảnh trước"
            >
              <BrandIcon name="chevron-left" />
            </button>
            <button
              type="button"
              className="photo-album-arrow photo-album-next"
              onClick={next}
              aria-label="Ảnh tiếp theo"
            >
              <BrandIcon name="chevron-right" />
            </button>
          </>
        )}

        <span className="photo-album-count">
          {String(activeIndex + 1).padStart(2, "0")} <i>/</i> {String(images.length).padStart(2, "0")}
        </span>
      </div>

      {activeImage.caption && <p className="photo-album-caption">{activeImage.caption}</p>}

      {images.length > 1 && (
        <div className="photo-album-thumbs" role="group" aria-label="Chọn ảnh trong album">
          {images.map((image, index) => (
            <button
              ref={(el) => {
                thumbRefs.current[index] = el;
              }}
              type="button"
              key={`${index}-${image.url}`}
              aria-label={`Chọn ảnh ${index + 1}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            >
              <Image src={imageSource(image.url, 240)} alt="" fill sizes="112px" loading="lazy" unoptimized />
            </button>
          ))}
        </div>
      )}

      <dialog
        className="album-lightbox"
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === dialogRef.current) setLightboxOpen(false);
        }}
        onClose={() => setLightboxOpen(false)}
      >
        <div
          ref={contentRef}
          className="album-lightbox-content"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={(event) => {
            if (
              event.target === contentRef.current ||
              (event.target as HTMLElement).classList?.contains("album-lightbox-image")
            ) {
              setLightboxOpen(false);
            }
          }}
        >
          <button
            className="album-lightbox-close"
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Đóng album"
          >
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="photo-album-arrow photo-album-prev"
                onClick={previous}
                aria-label="Ảnh trước"
              >
                <BrandIcon name="chevron-left" />
              </button>
              <button
                type="button"
                className="photo-album-arrow photo-album-next"
                onClick={next}
                aria-label="Ảnh tiếp theo"
              >
                <BrandIcon name="chevron-right" />
              </button>
            </>
          )}
          {lightboxOpen && (
            <div className="album-lightbox-image">
              <Image
                key={activeImage.url}
                className="album-stage-img"
                src={imageSource(activeImage.url, 2000)}
                alt={activeImage.alt}
                fill
                sizes="94vw"
                unoptimized
              />
            </div>
          )}
          <div className="album-lightbox-footer">
            <span>
              {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </span>
            {activeImage.caption && <p>{activeImage.caption}</p>}
          </div>
        </div>
      </dialog>
    </section>
  );
}
