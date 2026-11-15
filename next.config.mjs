/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * 公版全文 JSON 单本可达 3MB+，默认缓存策略会让每次打开都重新下载。
   * 这里给静态书籍数据与 PDF worker 设置长缓存，多人同时打开时走浏览器/ CDN 缓存，不再卡顿。
   */
  async headers() {
    return [
      {
        source: "/books/text/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
      {
        source: "/books/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
      {
        source: "/pdf.worker.min.mjs",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
    ];
  },
};
export default nextConfig;
