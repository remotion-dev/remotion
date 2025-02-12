export declare const validCodecs: readonly ["h264", "h265", "vp8", "vp9", "mp3", "aac", "wav", "prores", "h264-mkv", "h264-ts", "gif"];
export type Codec = (typeof validCodecs)[number];
export type CodecOrUndefined = Codec | undefined;
export declare const DEFAULT_CODEC: Codec;
