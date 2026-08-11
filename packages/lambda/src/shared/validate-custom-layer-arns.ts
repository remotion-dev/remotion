import type {AwsRegion, RuntimePreference} from '@remotion/lambda-client';

const layerVersionArnRegex =
	/^arn:([a-z0-9][a-z0-9-]*):lambda:([a-z0-9-]+):(\d{12}):layer:([A-Za-z0-9-_]+):(\d+)$/;

export const validateCustomLayerArns = ({
	customLayerArns,
	enableLambdaInsights,
	region,
	runtimePreference,
}: {
	customLayerArns: string[] | null;
	enableLambdaInsights: boolean;
	region: AwsRegion;
	runtimePreference: RuntimePreference;
}) => {
	if (customLayerArns === null) {
		return;
	}

	if (!Array.isArray(customLayerArns) || customLayerArns.length === 0) {
		throw new TypeError('customLayerArns must contain at least one Layer ARN.');
	}

	if (runtimePreference !== 'default') {
		throw new Error(
			'customLayerArns cannot be combined with a non-default runtimePreference.',
		);
	}

	if (customLayerArns.length + (enableLambdaInsights ? 1 : 0) > 5) {
		throw new Error(
			'Lambda functions support at most 5 Layers, including the Lambda Insights Layer.',
		);
	}

	const seen = new Set<string>();
	for (const layerArn of customLayerArns) {
		if (typeof layerArn !== 'string' || layerArn.length === 0) {
			throw new TypeError(
				'Each customLayerArns entry must be a non-empty string.',
			);
		}

		const match = layerArn.match(layerVersionArnRegex);
		if (!match) {
			throw new TypeError(
				`Invalid Lambda Layer version ARN: ${layerArn}. Expected arn:<partition>:lambda:<region>:<12-digit-account-id>:layer:<layer-name>:<numeric-version>.`,
			);
		}

		if (match[2] !== region) {
			throw new Error(
				`The custom Layer ARN ${layerArn} is in region ${match[2]}, but the function is being deployed to ${region}.`,
			);
		}

		if (seen.has(layerArn)) {
			throw new Error(`Duplicate custom Layer ARN: ${layerArn}.`);
		}

		seen.add(layerArn);
	}
};
