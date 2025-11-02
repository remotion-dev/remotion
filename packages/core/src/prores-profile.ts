export const proResProfileOptions = [
	'4444-xq',
	'4444',
	'hq',
	'standard',
	'light',
	'proxy',
] as const;

export type ProResProfile = (typeof proResProfileOptions)[number];
