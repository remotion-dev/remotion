export const remotionSkillNames = [
	'remotion-best-practices',
	'remotion-captions',
	'remotion-create',
	'remotion-docs',
	'remotion-interactivity',
	'remotion-maps',
	'remotion-markup',
	'remotion-multimedia',
	'remotion-render',
	'remotion-saas',
	'remotion-studio',
	'remotion-upgrade',
] as const;

export type RemotionSkillName = (typeof remotionSkillNames)[number];
