export async function uploadMedia(file: File) {
  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (storageUrl || publicKey) {
    if (!storageUrl || !publicKey) throw new Error("Cần cấu hình đồng thời NEXT_PUBLIC_SUPABASE_URL và publishable/anon key.");
    const signResponse = await fetch("/api/admin/upload/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: file.type, size: file.size }),
    });
    const signed = await signResponse.json();
    if (!signResponse.ok) throw new Error(signed.error || `Không thể chuẩn bị tải ${file.name}.`);
    const uploadResponse = await fetch(signed.uploadUrl, {
      method: "PUT",
      headers: { apikey: publicKey, Authorization: `Bearer ${publicKey}`, "Content-Type": file.type, "cache-control": "max-age=31536000", "x-upsert": "false" },
      body: file,
    });
    if (!uploadResponse.ok) throw new Error(`Storage từ chối tải ${file.name}. Kiểm tra bucket, giới hạn dung lượng và CORS.`);
    return { url: signed.publicUrl as string, mediaType: file.type.startsWith("video/") ? "video" as const : "image" as const };
  }

  if (process.env.NODE_ENV === "production" && file.size > 4 * 1024 * 1024) throw new Error("Cần cấu hình Supabase Storage để tải tệp lớn trong production.");

  const form = new FormData();
  form.set("file", file);
  const response = await fetch("/api/admin/upload", { method: "POST", body: form });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `Không tải được ${file.name}.`);
  return { url: result.url as string, mediaType: result.mediaType as "image" | "video" };
}
