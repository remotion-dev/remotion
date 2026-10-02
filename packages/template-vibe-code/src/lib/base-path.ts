// The path the app is served under, without a trailing slash and empty at the
// root. Next.js prefixes its own routes and assets, but public files and the
// API must be addressed with it explicitly. Set in next.config.mjs.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
