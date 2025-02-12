"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticFile = exports.includesHexOfUnsafeChar = void 0;
const problematicCharacters = {
    '%3A': ':',
    '%2F': '/',
    '%3F': '?',
    '%23': '#',
    '%5B': '[',
    '%5D': ']',
    '%40': '@',
    '%21': '!',
    '%24': '$',
    '%26': '&',
    '%27': "'",
    '%28': '(',
    '%29': ')',
    '%2A': '*',
    '%2B': '+',
    '%2C': ',',
    '%3B': ';',
};
const didWarn = {};
const warnOnce = (message) => {
    if (didWarn[message]) {
        return;
    }
    // eslint-disable-next-line no-console
    console.warn(message);
    didWarn[message] = true;
};
const includesHexOfUnsafeChar = (path) => {
    for (const key of Object.keys(problematicCharacters)) {
        if (path.includes(key)) {
            return { containsHex: true, hexCode: key };
        }
    }
    return { containsHex: false };
};
exports.includesHexOfUnsafeChar = includesHexOfUnsafeChar;
const trimLeadingSlash = (path) => {
    if (path.startsWith('/')) {
        return trimLeadingSlash(path.substring(1));
    }
    return path;
};
const inner = (path) => {
    if (typeof window !== 'undefined' && window.remotion_staticBase) {
        if (path.startsWith(window.remotion_staticBase)) {
            throw new Error(`The value "${path}" is already prefixed with the static base ${window.remotion_staticBase}. You don't need to call staticFile() on it.`);
        }
        return `${window.remotion_staticBase}/${trimLeadingSlash(path)}`;
    }
    return `/${trimLeadingSlash(path)}`;
};
const encodeBySplitting = (path) => {
    const splitBySlash = path.split('/');
    const encodedArray = splitBySlash.map((element) => {
        return encodeURIComponent(element);
    });
    const merged = encodedArray.join('/');
    return merged;
};
/*
 * @description Reference a file from the public/ folder. If the file does not appear in the autocomplete, type the path manually.
 * @see [Documentation](https://www.remotion.dev/docs/staticfile)
 */
const staticFile = (path) => {
    if (path === null) {
        throw new TypeError('null was passed to staticFile()');
    }
    if (typeof path === 'undefined') {
        throw new TypeError('undefined was passed to staticFile()');
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
        throw new TypeError(`staticFile() does not support remote URLs - got "${path}". Instead, pass the URL without wrapping it in staticFile(). See: https://remotion.dev/docs/staticfile-remote-urls`);
    }
    if (path.startsWith('..') || path.startsWith('./')) {
        throw new TypeError(`staticFile() does not support relative paths - got "${path}". Instead, pass the name of a file that is inside the public/ folder. See: https://remotion.dev/docs/staticfile-relative-paths`);
    }
    if (path.startsWith('/Users') ||
        path.startsWith('/home') ||
        path.startsWith('/tmp') ||
        path.startsWith('/etc') ||
        path.startsWith('/opt') ||
        path.startsWith('/var') ||
        path.startsWith('C:') ||
        path.startsWith('D:') ||
        path.startsWith('E:')) {
        throw new TypeError(`staticFile() does not support absolute paths - got "${path}". Instead, pass the name of a file that is inside the public/ folder. See: https://remotion.dev/docs/staticfile-relative-paths`);
    }
    if (path.startsWith('public/')) {
        throw new TypeError(`Do not include the public/ prefix when using staticFile() - got "${path}". See: https://remotion.dev/docs/staticfile-relative-paths`);
    }
    const includesHex = (0, exports.includesHexOfUnsafeChar)(path);
    if (includesHex.containsHex) {
        warnOnce(`WARNING: You seem to pass an already encoded path (path contains ${includesHex.hexCode}). Since Remotion 4.0, the encoding is done by staticFile() itself. You may want to remove a encodeURIComponent() wrapping.`);
    }
    const preprocessed = encodeBySplitting(path);
    const preparsed = inner(preprocessed);
    if (!preparsed.startsWith('/')) {
        return `/${preparsed}`;
    }
    return preparsed;
};
exports.staticFile = staticFile;
