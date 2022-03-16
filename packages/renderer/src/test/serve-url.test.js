"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const normalize_serve_url_1 = require("../normalize-serve-url");
test('normalizeServeUrl', () => {
    expect((0, normalize_serve_url_1.normalizeServeUrl)('https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing?somequery')).toBe('https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/index.html');
    expect((0, normalize_serve_url_1.normalizeServeUrl)('https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/index.html')).toBe('https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/index.html');
    expect((0, normalize_serve_url_1.normalizeServeUrl)('https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing')).toBe('https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/index.html');
    expect((0, normalize_serve_url_1.normalizeServeUrl)('https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/?hi=there')).toBe('https://remotionlambda-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/index.html');
});
//# sourceMappingURL=serve-url.test.js.map