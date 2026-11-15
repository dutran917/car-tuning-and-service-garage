import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [
      {
        source: "/do-xe/vf3-g63",
        destination: "/goi-do/vf3-ban-do-g63-cuc-chat",
        permanent: true,
      },
      {
        source: "/goi-do/body-lip-vf7",
        destination: "/goi-do/vf7-don-hang-som-cho-a-khach-daklak-body-lip-no-noise-club",
        permanent: true,
      },
      {
        source: "/goi-do/body-lip-mpv7",
        destination: "/goi-do/mpv7-chiec-mpv7-dau-tien-tai-cam-pha-len-bo-body-lip-mau-moi-nhat",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*\\.(?:ico|png|jpg|jpeg|webp|svg|woff2))",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
export default nextConfig;
