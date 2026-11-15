/** pdf.js 旧浏览器兼容构建（legacy）没有独立类型声明，直接复用主包类型 */
declare module "pdfjs-dist/legacy/build/pdf.min.mjs" {
  export * from "pdfjs-dist";
}
