const detailMarkers = /(?:✓|✔|✅|\bList đồ\b|\bDanh mục chi tiết\b)/i;

export function packageExcerpt(text: string) {
  const firstLine = text.replace(/\r/g, "").trim().split(/\n+/).find(Boolean) ?? "";
  const intro = firstLine.split(detailMarkers)[0].trim();
  if (intro.length <= 175) return intro;
  const sentence = intro.slice(0, 175).replace(/\s+\S*$/, "");
  return `${sentence}…`;
}
