import type { OnVideoFrame } from './props';
export declare const useEmitVideoFrame: ({ ref, onVideoFrame, }: {
    ref: React.RefObject<HTMLVideoElement | null>;
    onVideoFrame: OnVideoFrame | null;
}) => void;
