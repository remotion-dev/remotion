// Keep in sync with cli
export const listOfInstallableRemotionPackages = [
	'@remotion/animated-emoji',
	'@remotion/animation-utils',
	'@remotion/cloudrun',
	'@remotion/enable-scss',
	'@remotion/gif',
	'@remotion/google-fonts',
	'@remotion/lambda',
	'@remotion/layout-utils',
	'@remotion/lottie',
	'@remotion/media-parser',
	'@remotion/media-utils',
	'@remotion/motion-blur',
	'@remotion/noise',
	'@remotion/paths',
	'@remotion/rive',
	'@remotion/shapes',
	'@remotion/skia',
	'@remotion/studio',
	'@remotion/tailwind',
	'@remotion/three',
	'@remotion/transitions',
	'@remotion/zod-types',
] as const;

export type InstallablePackage =
	(typeof listOfInstallableRemotionPackages)[number];
