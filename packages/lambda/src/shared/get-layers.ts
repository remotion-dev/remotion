import type {AwsRegion} from '../regions';
import type {AwsLayer} from './hosted-layers';
import {hostedLayers, v5HostedLayers} from './hosted-layers';

const runtimePreferenceOptions = ['default', 'apple-emojis', 'cjk'] as const;

export type RuntimePreference = (typeof runtimePreferenceOptions)[number];

export const validateRuntimePreference = (option: unknown) => {
	if (!option) {
		return;
	}

	if (!runtimePreferenceOptions.includes(option as RuntimePreference)) {
		throw new Error(
			`Invalid runtime preference ${option}. Must be one of ${runtimePreferenceOptions.join(
				', ',
			)}`,
		);
	}
};

export const getLayers = ({
	option,
	region,
	enableV5Runtime,
}: {
	option: RuntimePreference;
	region: AwsRegion;
	enableV5Runtime: boolean;
}): AwsLayer[] => {
	const layers = enableV5Runtime
		? v5HostedLayers[region]
		: hostedLayers[region];

	return layers.filter((layer) => {
		if (layer.layerArn.includes('emoji-apple')) {
			return option === 'apple-emojis';
		}

		if (layer.layerArn.includes('emoji-google')) {
			return option !== 'apple-emojis';
		}

		if (layer.layerArn.includes('cjk')) {
			return option !== 'apple-emojis';
		}

		if (layer.layerArn.includes('chromium')) {
			return true;
		}

		if (layer.layerArn.includes('fonts')) {
			return true;
		}

		throw new Error('Unhandled layer type ');
	});
};
