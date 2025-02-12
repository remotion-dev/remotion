import { _ as _path } from './shared/pathe.UZ-hd4nF.mjs';
export { c as basename, d as dirname, e as extname, f as format, i as isAbsolute, j as join, m as matchesGlob, n as normalize, a as normalizeString, p as parse, b as relative, r as resolve, s as sep, t as toNamespacedPath } from './shared/pathe.UZ-hd4nF.mjs';

const delimiter = /* @__PURE__ */ (() => globalThis.process?.platform === "win32" ? ";" : ":")();
const _platforms = { posix: undefined, win32: undefined };
const mix = (del = delimiter) => {
  return new Proxy(_path, {
    get(_, prop) {
      if (prop === "delimiter") return del;
      if (prop === "posix") return posix;
      if (prop === "win32") return win32;
      return _platforms[prop] || _path[prop];
    }
  });
};
const posix = /* @__PURE__ */ mix(":");
const win32 = /* @__PURE__ */ mix(";");

export { posix as default, delimiter, posix, win32 };
