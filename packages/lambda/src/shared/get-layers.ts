import type {AwsRegion, RuntimePreference} from '@remotion/lambda-client';
import {LambdaClientInternals} from '@remotion/lambda-client';
import type {AwsLayer} from './hosted-layers';
import {hostedLayers} from './hosted-layers';

export const validateRuntimePreference = (option: unknown) => {
	if (!option) {
		return;
	}

	if (
		!LambdaClientInternals.runtimePreferenceOptions.includes(
			option as RuntimePreference,
		)
	) {
		throw new Error(
			`Invalid runtime preference ${option}. Must be one of ${LambdaClientInternals.runtimePreferenceOptions.join(
				', ',
			)}`,
		);
	}
};

export const getLayers = ({
	option,
	region,
}: {
	option: RuntimePreference;
	region: AwsRegion;
}): AwsLayer[] => {
	const layers = hostedLayers[region];
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
