// Types copied from @remotion/renderer to avoid circular dependencies
export const validVideoImageFormats = ['png', 'jpeg', 'none'] as const;
export const validStillImageFormats = ['png', 'jpeg', 'pdf', 'webp'] as const;

export type VideoImageFormat = (typeof validVideoImageFormats)[number];
export type StillImageFormat = (typeof validStillImageFormats)[number];

export const DEFAULT_VIDEO_IMAGE_FORMAT: VideoImageFormat = 'jpeg';
export const DEFAULT_STILL_IMAGE_FORMAT: StillImageFormat = 'png';
