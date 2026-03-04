import assert from 'assert';
import {expect, test} from 'bun:test';
import {computeSequencePropsStatusFromContent} from '../preview-server/routes/can-update-sequence-props';
import {lineColumnToNodePath} from './test-utils';

const componentInput = `import {Video} from '@remotion/media';

const src = 'https://remotion.media/video.mp4';

export const Component = () => {
	return (
		<Video
			src={src}
			style={{
				translate: '0px 202px',
				scale: 2.47,
			}}
			playbackRate={2.19}
		/>
	);
};

`;

test('Should be able to update translate if it is pixels', () => {
	const result = computeSequencePropsStatusFromContent(
		componentInput,
		lineColumnToNodePath(componentInput, 7),
		['style.scale', 'style.translate'],
	);

	assert(result.canUpdate);
	expect(result.props['style.translate'].canUpdate).toBe(true);
	assert(result.props['style.translate'].canUpdate);
	expect(result.props['style.translate'].codeValue).toBe('0px 202px');
});
