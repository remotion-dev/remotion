export const runtimePreferenceOptions = [
	'default',
	'apple-emojis',
	'cjk',
] as const;

export type RuntimePreference = (typeof runtimePreferenceOptions)[number];
