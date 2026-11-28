import {afterEach, expect, test} from 'bun:test';
import {cleanup, render, screen} from '@testing-library/react';
import {useEncodableVideoCodecs} from '../components/RenderModal/use-encodable-video-codecs';
import type {RenderFrameInput} from '../components/RenderModal/use-render-frame-input';
import {WebRenderModalBasic} from '../components/RenderModal/WebRenderModalBasic';

const originalSecureContextDescriptor = Object.getOwnPropertyDescriptor(
	window,
	'isSecureContext',
);

afterEach(() => {
	cleanup();
	if (originalSecureContextDescriptor) {
		Object.defineProperty(
			window,
			'isSecureContext',
			originalSecureContextDescriptor,
		);
	} else {
		Reflect.deleteProperty(window, 'isSecureContext');
	}
});

const frameInput = (value: number): RenderFrameInput => ({
	value,
	integerOnly: true,
	step: 1,
	onTextChange: () => undefined,
	onValueChange: () => undefined,
	onValueChangeEnd: () => undefined,
	onValueChangeCancel: () => undefined,
});

// happy-dom has no `VideoEncoder`, so no video codec is encodable,
// like in a browser that lacks WebCodecs video encoding.
const VideoGeneralTab: React.FC = () => {
	const encodableVideoCodecs = useEncodableVideoCodecs('mp4');

	return (
		<WebRenderModalBasic
			renderMode="video"
			resolvedComposition={{durationInFrames: 30} as never}
			imageFormat="png"
			setStillFormat={() => undefined}
			frame={frameInput(0)}
			container="mp4"
			setContainerFormat={() => undefined}
			setCodec={() => undefined}
			encodableVideoCodecs={encodableVideoCodecs}
			effectiveVideoCodec={encodableVideoCodecs[0] ?? 'h264'}
			startFrame={frameInput(0)}
			endFrame={frameInput(29)}
			outName="out.mp4"
			outputNameLabel="Output name"
			onOutNameChange={() => undefined}
			validationMessage={null}
			logLevel="info"
			setLogLevel={() => undefined}
		/>
	);
};

test('explains why no video codec can be picked instead of showing an empty Codec field', async () => {
	Object.defineProperty(window, 'isSecureContext', {
		configurable: true,
		value: true,
	});

	render(<VideoGeneralTab />);

	expect(
		await screen.findByText(
			'This browser cannot encode any MP4 video codec. Try another container.',
		),
	).toBeTruthy();
	expect(screen.queryByRole('button', {name: 'Codec'})).toBeNull();
});

test('points to HTTPS or localhost when the Studio is not in a secure context', async () => {
	Object.defineProperty(window, 'isSecureContext', {
		configurable: true,
		value: false,
	});

	render(<VideoGeneralTab />);

	expect(
		await screen.findByText('Video encoding requires HTTPS or localhost.'),
	).toBeTruthy();
	expect(screen.queryByRole('button', {name: 'Codec'})).toBeNull();
});
