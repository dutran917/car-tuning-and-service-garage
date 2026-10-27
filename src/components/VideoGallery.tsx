"use client";

import { useEffect, useRef } from "react";
import type { ManagedVideo } from "@/lib/managed-content";

function AutoplayVideo({ video }: { video: ManagedVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void element.play().catch(() => undefined);
      else element.pause();
    }, { rootMargin: "120px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <figure><video ref={videoRef} src={video.url} muted loop playsInline controls preload="metadata" aria-label={video.title || "Video Quốc Dương Auto"}/>{video.title.trim() && <figcaption>{video.title}</figcaption>}</figure>;
}

export function VideoGallery({ videos }: { videos: ManagedVideo[] }) {
  if (!videos.length) return null;
  return <div className="content-videos" aria-label="Video nội dung">{videos.map((video, index) => <AutoplayVideo video={video} key={`${index}-${video.url}`}/>)}</div>;
}
