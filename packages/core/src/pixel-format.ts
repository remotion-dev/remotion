// Types copied from @remotion/renderer to avoid circular dependencies
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

export const DEFAULT_PIXEL_FORMAT: PixelFormat = 'yuv420p';
