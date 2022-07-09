import type {LambdaArchitecture} from '../..';
import {
	hostedLayers,
	REMOTION_HOSTED_LAYER_ARN,
} from '../../shared/hosted-layers';

test('All hosted layers should match ARN', () => {
	Object.keys(hostedLayers).forEach((arch) => {
		Object.values(hostedLayers[arch as LambdaArchitecture]).forEach((h) => {
			h.forEach(({layerArn}) => {
				expect(layerArn).toMatch(
					new RegExp(REMOTION_HOSTED_LAYER_ARN.replace(/\*/g, '(.*)'))
				);
			});
		});
	});
});
