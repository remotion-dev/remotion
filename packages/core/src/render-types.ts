// Types copied from @remotion/renderer for use in core composition metadata
// This avoids circular dependencies while keeping renderer as the source of truth

export const validVideoImageFormats = ['png', 'jpeg', 'none'] as const;
export type VideoImageFormat = (typeof validVideoImageFormats)[number];

export const validPixelFormats = [
	'yuv420p',
	'yuva420p',
	'yuv422p',
	'yuv444p',
	'yuv420p10le',
	'yuv422p10le',
	'yuv444p10le',
	'yuva444p10le',
] as const;

export type PixelFormat = (typeof validPixelFormats)[number];
