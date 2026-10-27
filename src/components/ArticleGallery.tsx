"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  const activeImage = images[activeIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (lightboxOpen && !dialog.open) dialog.showModal();
    if (!lightboxOpen && dialog.open) dialog.close();
  }, [lightboxOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!lightboxOpen || images.length < 2) return;
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % images.length);
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, lightboxOpen]);

  if (!images.length || !activeImage) return null;
  const previous = () => setActiveIndex((index) => (index - 1 + images.length) % images.length);
  const next = () => setActiveIndex((index) => (index + 1) % images.length);

  return <section className="photo-album" aria-label="Thư viện ảnh">
    <div className="photo-album-stage">
      <button className="photo-album-open" type="button" onClick={() => setLightboxOpen(true)} aria-label={`Mở ảnh ${activeIndex + 1} kích thước lớn`}>
        <Image src={imageSource(activeImage.url, 1600)} alt={activeImage.alt} fill sizes="(max-width: 800px) 100vw, 900px" loading="lazy" unoptimized />
      </button>
      {images.length > 1 && <><button type="button" className="photo-album-arrow photo-album-prev" onClick={previous} aria-label="Ảnh trước">‹</button><button type="button" className="photo-album-arrow photo-album-next" onClick={next} aria-label="Ảnh tiếp theo">›</button></>}
      <span className="photo-album-count">{String(activeIndex + 1).padStart(2, "0")} <i>/</i> {String(images.length).padStart(2, "0")}</span>
    </div>
    {activeImage.caption && <p className="photo-album-caption">{activeImage.caption}</p>}
    {images.length > 1 && <div className="photo-album-thumbs" role="group" aria-label="Chọn ảnh trong album">{images.map((image, index) => <button type="button" key={`${index}-${image.url}`} aria-label={`Chọn ảnh ${index + 1}`} aria-pressed={index === activeIndex} onClick={() => setActiveIndex(index)}><Image src={imageSource(image.url, 240)} alt="" fill sizes="112px" unoptimized /></button>)}</div>}
    <dialog className="album-lightbox" ref={dialogRef} onClick={(event) => { if (event.target === dialogRef.current) setLightboxOpen(false); }} onClose={() => setLightboxOpen(false)}>
      <div className="album-lightbox-content"><button className="album-lightbox-close" type="button" onClick={() => setLightboxOpen(false)} aria-label="Đóng album">×</button>{images.length > 1 && <><button type="button" className="photo-album-arrow photo-album-prev" onClick={previous} aria-label="Ảnh trước">‹</button><button type="button" className="photo-album-arrow photo-album-next" onClick={next} aria-label="Ảnh tiếp theo">›</button></>}<div className="album-lightbox-image"><Image src={imageSource(activeImage.url, 2000)} alt={activeImage.alt} fill sizes="94vw" unoptimized /></div><div className="album-lightbox-footer"><span>{String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>{activeImage.caption && <p>{activeImage.caption}</p>}</div></div>
    </dialog>
  </section>;
}
