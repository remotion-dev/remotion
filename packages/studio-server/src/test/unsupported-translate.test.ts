import assert from 'assert';
import {expect, test} from 'bun:test';
import {computeSequencePropsStatusFromContent} from '../preview-server/routes/can-update-sequence-props';
import {lineColumnToNodePath} from './test-utils';

const makeComponent = (
	translateValue: string,
) => `import {Video} from '@remotion/media';

const src = 'https://remotion.media/video.mp4';

export const Component = () => {
	return (
		<Video
			src={src}
			style={{
				translate: '${translateValue}',
				scale: 2.47,
			}}
			playbackRate={2.19}
		/>
	);
};

`;

const getTranslateStatus = (translateValue: string) => {
	const input = makeComponent(translateValue);
	const result = computeSequencePropsStatusFromContent(
		input,
		lineColumnToNodePath(input, 7),
		['style.translate'],
	);

	assert(result.canUpdate);
	return result.props['style.translate'];
};

// Supported: two values in pixels
test('Should be able to update translate if it is two pixel values', () => {
	const status = getTranslateStatus('0px 202px');
	expect(status.canUpdate).toBe(true);
	assert(status.canUpdate);
	expect(status.codeValue).toBe('0px 202px');
});

// Supported: single value in pixels
test('Should be able to update translate if it is a single pixel value', () => {
	const status = getTranslateStatus('100px');
	expect(status.canUpdate).toBe(true);
	assert(status.canUpdate);
	expect(status.codeValue).toBe('100px');
});

test('Should be able to update translate with 0px', () => {
	const status = getTranslateStatus('0px');
	expect(status.canUpdate).toBe(true);
	assert(status.canUpdate);
	expect(status.codeValue).toBe('0px');
});

test('Should be able to update translate with negative pixel values', () => {
	const status = getTranslateStatus('-50px 100px');
	expect(status.canUpdate).toBe(true);
	assert(status.canUpdate);
	expect(status.codeValue).toBe('-50px 100px');
});

// Unsupported: three values (x, y, z)
test('Should not support translate with three values', () => {
	const status = getTranslateStatus('0px 100px 200px');
	expect(status.canUpdate).toBe(false);
});

// Unsupported: global CSS values
test('Should not support translate with "inherit"', () => {
	const status = getTranslateStatus('inherit');
	expect(status.canUpdate).toBe(false);
});

test('Should not support translate with "initial"', () => {
	const status = getTranslateStatus('initial');
	expect(status.canUpdate).toBe(false);
});

test('Should not support translate with "unset"', () => {
	const status = getTranslateStatus('unset');
	expect(status.canUpdate).toBe(false);
});

test('Should not support translate with "revert"', () => {
	const status = getTranslateStatus('revert');
	expect(status.canUpdate).toBe(false);
});

test('Should not support translate with "revert-layer"', () => {
	const status = getTranslateStatus('revert-layer');
	expect(status.canUpdate).toBe(false);
});

// Unsupported: keyword values
test('Should not support translate with "none"', () => {
	const status = getTranslateStatus('none');
	expect(status.canUpdate).toBe(false);
});

// Unsupported: percentage values
test('Should not support translate with percentage values', () => {
	const status = getTranslateStatus('50%');
	expect(status.canUpdate).toBe(false);
});

test('Should not support translate with mixed px and percentage', () => {
	const status = getTranslateStatus('100px 50%');
	expect(status.canUpdate).toBe(false);
});

// Unsupported: other units
test('Should not support translate with em values', () => {
	const status = getTranslateStatus('10em');
	expect(status.canUpdate).toBe(false);
});

test('Should not support translate with rem values', () => {
	const status = getTranslateStatus('10rem');
	expect(status.canUpdate).toBe(false);
});
