import deterministicRandomness from './rules/deterministic-randomness';
import evenDimensions from './rules/even-dimensions';
import noBackgroundImage from './rules/no-background-image';
import durationInFrames from './rules/no-duration-frames-infinity';
import noFrom0 from './rules/no-from-0';
import noStringAssets from './rules/no-string-assets';
import staticFileNoRelative from './rules/staticfile-no-relative';
import staticFileNoRemote from './rules/staticfile-no-remote';
import useGifComponent from './rules/use-gif-component';
import v4Import from './rules/v4-import';
import volumeCallback from './rules/volume-callback';
import warnNativeMediaTag from './rules/warn-native-media-tag';

const rules = {
	'warn-native-media-tag': warnNativeMediaTag,
	'deterministic-randomness': deterministicRandomness,
	'no-string-assets': noStringAssets,
	'even-dimensions': evenDimensions,
	'duration-in-frames': durationInFrames,
	'from-0': noFrom0,
	'volume-callback': volumeCallback,
	'use-gif-component': useGifComponent,
	'staticfile-no-relative': staticFileNoRelative,
	'staticfile-no-remote': staticFileNoRemote,
	'no-background-image': noBackgroundImage,
	'v4-config-import': v4Import,
};

const recommendedRuleConfig = {
	'@remotion/warn-native-media-tag': 'error',
	'@remotion/deterministic-randomness': 'error',
	'@remotion/no-string-assets': 'error',
	'@remotion/even-dimensions': 'error',
	'@remotion/duration-in-frames': 'error',
	'@remotion/from-0': 'error',
	'@remotion/volume-callback': 'error',
	'@remotion/use-gif-component': 'error',
	'@remotion/staticfile-no-relative': 'error',
	'@remotion/staticfile-no-remote': 'error',
	'@remotion/no-background-image': 'error',
	'@remotion/v4-config-import': 'error',
} as const;

const configs = {
	recommended: {
		rules: recommendedRuleConfig,
		plugins: ['@remotion'],
	},
} as const;

const flatPlugin = {
	rules: recommendedRuleConfig,
	plugins: {
		'@remotion': {
			rules: rules,
		},
	},
};

export = {
	configs,
	rules,
	flatPlugin,
};
