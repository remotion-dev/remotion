"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warnAboutNonSeekableMedia = void 0;
const alreadyWarned = {};
const warnAboutNonSeekableMedia = (ref, type) => {
    // Media is not loaded yet, but this does not yet mean something is wrong with the media
    if (ref === null) {
        return;
    }
    if (ref.seekable.length === 0) {
        return;
    }
    if (ref.seekable.length > 1) {
        return;
    }
    if (alreadyWarned[ref.src]) {
        return;
    }
    const range = { start: ref.seekable.start(0), end: ref.seekable.end(0) };
    if (range.start === 0 && range.end === 0) {
        const msg = [
            `The media ${ref.src} cannot be seeked. This could be one of few reasons:`,
            '1) The media resource was replaced while the video is playing but it was not loaded yet.',
            '2) The media does not support seeking.',
            '3) The media was loaded with security headers prventing it from being included.',
            'Please see https://remotion.dev/docs/non-seekable-media for assistance.',
        ].join('\n');
        if (type === 'console-error') {
            // eslint-disable-next-line no-console
            console.error(msg);
        }
        else if (type === 'console-warning') {
            // eslint-disable-next-line no-console
            console.warn(`The media ${ref.src} does not support seeking. The video will render fine, but may not play correctly in the Remotion Studio and in the <Player>. See https://remotion.dev/docs/non-seekable-media for an explanation.`);
        }
        else {
            throw new Error(msg);
        }
        alreadyWarned[ref.src] = true;
    }
};
exports.warnAboutNonSeekableMedia = warnAboutNonSeekableMedia;
