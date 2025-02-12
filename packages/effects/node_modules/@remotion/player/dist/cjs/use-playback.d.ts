import type { BrowserMediaControlsBehavior } from './browser-mediasession.js';
import type { GetCurrentFrame } from './use-frame-imperative.js';
export declare const usePlayback: ({ loop, playbackRate, moveToBeginningWhenEnded, inFrame, outFrame, browserMediaControlsBehavior, getCurrentFrame, }: {
    loop: boolean;
    playbackRate: number;
    moveToBeginningWhenEnded: boolean;
    inFrame: number | null;
    outFrame: number | null;
    browserMediaControlsBehavior: BrowserMediaControlsBehavior;
    getCurrentFrame: GetCurrentFrame;
}) => void;
