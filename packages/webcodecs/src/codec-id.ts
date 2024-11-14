const availableVideoCodecs = ['vp8', 'vp9'] as const;
export const getAvailableVideoCodecs = () => availableVideoCodecs;
export type ConvertMediaVideoCodec = (typeof availableVideoCodecs)[number];

const availableAudioCodecs = ['opus', 'aac'] as const;
export const getAvailableAudioCodecs = () => availableAudioCodecs;
export type ConvertMediaAudioCodec = (typeof availableAudioCodecs)[number];
