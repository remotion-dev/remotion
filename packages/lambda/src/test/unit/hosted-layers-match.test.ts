import {expect, test} from 'vitest';
import type {LambdaArchitecture} from '../..';
import {
	REMOTION_HOSTED_LAYER_ARN,
	__internal_doNotUsehostedLayers,
} from '../../shared/hosted-layers';

test('All hosted layers should match ARN', () => {
	Object.keys(__internal_doNotUsehostedLayers).forEach((arch) => {
		Object.values(
			__internal_doNotUsehostedLayers[arch as LambdaArchitecture]
		).forEach((h) => {
			h.forEach(({layerArn}) => {
				expect(layerArn).toMatch(
					new RegExp(REMOTION_HOSTED_LAYER_ARN.replace(/\*/g, '(.*)'))
				);
			});
		});
	});
});
