"use client";

import { useEffect, useRef, useState } from "react";

type CropImageUploadProps = {
  label: string;
  aspect: number;
  multiple?: boolean;
  disabled?: boolean;
  onCropped: (files: File[]) => void;
};

type CropItem = { file: File; image: HTMLImageElement; url: string };

const MAX_OUTPUT_WIDTH = 2400;

function loadImage(file: File) {
  return new Promise<{ image: HTMLImageElement; url: string }>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => resolve({ image, url: objectUrl });
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error(`Không đọc được ảnh ${file.name}.`)); };
    image.src = objectUrl;
  });
}

export function ImageCropUpload({ label, aspect, multiple = false, disabled = false, onCropped }: CropImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ id: number; x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const objectUrlsRef = useRef(new Set<string>());
  const [queue, setQueue] = useState<CropItem[]>([]);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const current = queue[index];
  const stageWidth = aspect;
  const stageHeight = 1;
  const baseScale = current ? Math.max(stageWidth / current.image.naturalWidth, stageHeight / current.image.naturalHeight) : 1;
  const imageWidth = current ? current.image.naturalWidth * baseScale * zoom : stageWidth;
  const imageHeight = current ? current.image.naturalHeight * baseScale * zoom : stageHeight;
  const left = (stageWidth - imageWidth) / 2 + offset.x;
  const top = (stageHeight - imageHeight) / 2 + offset.y;

  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setError("");
  }, [index, current?.file]);

  useEffect(() => {
    if (!current) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      queue.forEach((item) => URL.revokeObjectURL(item.url));
      objectUrlsRef.current.clear();
      setQueue([]);
      setIndex(0);
      setError("");
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [queue]);

  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
  }, []);

  function releaseUrl(url: string) {
    URL.revokeObjectURL(url);
    objectUrlsRef.current.delete(url);
  }

  async function choose(files: FileList | null) {
    if (!files?.length) return;
    setQueue([]);
    setIndex(0);
    setError("");
    try {
      const selected = Array.from(files);
      const images = await Promise.all(selected.map(async (file) => {
        if (!file.type.startsWith("image/")) throw new Error("Vui lòng chọn tệp ảnh.");
        const loaded = await loadImage(file);
        objectUrlsRef.current.add(loaded.url);
        return { file, ...loaded };
      }));
      setQueue(images);
      setIndex(0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không mở được ảnh.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clampOffset(x: number, y: number, nextZoom = zoom) {
    if (!current) return { x, y };
    const width = current.image.naturalWidth * baseScale * nextZoom;
    const height = current.image.naturalHeight * baseScale * nextZoom;
    return {
      x: Math.min(Math.max(x, (stageWidth - width) / 2), (width - stageWidth) / 2),
      y: Math.min(Math.max(y, (stageHeight - height) / 2), (height - stageHeight) / 2),
    };
  }

  function changeZoom(value: number) {
    const next = Math.min(4, Math.max(1, value));
    setZoom(next);
    setOffset((old) => clampOffset(old.x, old.y, next));
  }

  async function cropCurrent() {
    if (!current) return null;
    const scale = baseScale * zoom;
    const sourceX = Math.max(0, -left / scale);
    const sourceY = Math.max(0, -top / scale);
    const sourceWidth = Math.min(current.image.naturalWidth - sourceX, stageWidth / scale);
    const sourceHeight = Math.min(current.image.naturalHeight - sourceY, stageHeight / scale);
    const width = Math.max(1, Math.min(MAX_OUTPUT_WIDTH, Math.round(sourceWidth)));
    const height = Math.max(1, Math.round(width / aspect));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Trình duyệt không thể xử lý ảnh này.");
    context.drawImage(current.image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
    if (!blob) throw new Error("Không thể xuất ảnh đã cắt.");
    const baseName = current.file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}-cropped.webp`, { type: "image/webp", lastModified: Date.now() });
  }

  async function applyCrop() {
    try {
      setError("");
      const cropped = await cropCurrent();
      if (!cropped) return;
      if (multiple && index + 1 < queue.length) {
        releaseUrl(current.url);
        setQueue((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, file: cropped } : item));
        setIndex(index + 1);
        return;
      }
      const completed = queue.map((_, itemIndex) => itemIndex === index ? cropped : queue[itemIndex].file);
      queue.forEach((item) => releaseUrl(item.url));
      setQueue([]);
      onCropped(completed);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cắt ảnh.");
    }
  }

  function cancel() {
    queue.forEach((item) => releaseUrl(item.url));
    setQueue([]);
    setIndex(0);
    setError("");
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!current || !stageRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!pointer || pointer.id !== event.pointerId || !rect) return;
    const logicalPerPixel = stageWidth / rect.width;
    setOffset(clampOffset(pointer.offsetX + (event.clientX - pointer.x) * logicalPerPixel, pointer.offsetY + (event.clientY - pointer.y) * logicalPerPixel));
  }

  return <>
    <label className="admin-upload admin-multi-upload image-crop-trigger">{label}<input ref={inputRef} type="file" multiple={multiple} accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={(event) => void choose(event.target.files)}/></label>
    {error && !current && <span className="admin-upload-hint image-crop-error" role="alert">{error}</span>}
    {current && <div className="image-crop-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) cancel(); }}><section className="image-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="image-crop-title">
      <header className="image-crop-header"><div><span className="eyebrow">CHỈNH VÙNG ẢNH</span><h2 id="image-crop-title">Kéo ảnh để chọn phần muốn dùng</h2></div><button type="button" className="image-crop-close" onClick={cancel} aria-label="Đóng">×</button></header>
      <div ref={stageRef} className="image-crop-stage" style={{ aspectRatio: `${aspect} / 1` }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => { pointerRef.current = null; }} onPointerCancel={() => { pointerRef.current = null; }}>
        <img src={current.url} alt="Ảnh đang cắt" draggable={false} style={{ width: `${imageWidth / stageWidth * 100}%`, height: `${imageHeight * 100}%`, left: `${left / stageWidth * 100}%`, top: `${top * 100}%` }}/>
        <div className="image-crop-frame" aria-hidden="true"/>
      </div>
      <div className="image-crop-controls"><label>Thu phóng <input aria-label="Thu phóng ảnh" type="range" min="1" max="4" step="0.01" value={zoom} onChange={(event) => changeZoom(Number(event.target.value))}/></label><span>{index + 1}/{queue.length} ảnh · WebP tối ưu</span></div>
      {error && <p className="image-crop-error" role="alert">{error}</p>}
      <footer><button type="button" className="admin-logout" onClick={cancel}>Hủy</button><button type="button" className="button" onClick={() => void applyCrop()}>{multiple && index + 1 < queue.length ? "Tiếp ảnh →" : "Dùng ảnh đã cắt"}</button></footer>
    </section></div>}
  </>;
}
