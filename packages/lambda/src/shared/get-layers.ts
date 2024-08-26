import type {AwsRegion} from '../regions';
import type {AwsLayer} from './hosted-layers';
import {hostedLayers, v5HostedLayers} from './hosted-layers';

export type RuntimePreference =
	| 'default'
	| 'prefer-apple-emojis'
	| 'prefer-cjk';

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
			return option === 'prefer-apple-emojis';
		}

		if (layer.layerArn.includes('emoji-google')) {
			return option !== 'prefer-apple-emojis';
		}

		if (layer.layerArn.includes('cjk')) {
			return option !== 'prefer-apple-emojis';
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
