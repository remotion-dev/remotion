import {expect, test} from 'vitest';
import {validateOutnameGui} from '../editor/components/RenderModal/out-name-checker';

test('Should catch dot in front', () => {
	expect(() =>
		validateOutnameGui({
			outName: 'out/.looped.mp4',
			codec: 'h264',
			audioCodec: 'aac',
			renderMode: 'video',
			stillImageFormat: 'png',
		})
	).toThrow();
});
