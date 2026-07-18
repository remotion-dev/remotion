import {afterEach, expect, test} from 'bun:test';
import {cleanup, fireEvent, render} from '@testing-library/react';
import type React from 'react';
import {SharedAudioContextProvider} from '../audio/shared-audio-tags.js';
import {CompositionRenderErrorContext} from '../composition-render-error-context.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import {Html5Video} from '../video/index.js';
import {MediaPlaybackError} from '../video/MediaPlaybackError.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(() => {
	cleanup();
});

const studioPreviewEnvironment = {
	isClientSideRendering: false,
	isPlayer: false,
	isReadOnlyStudio: false,
	isRendering: false,
	isStudio: true,
};

const WrapStudioPreview: React.FC<{
	readonly children: React.ReactNode;
	readonly setError: (error: Error) => void;
}> = ({children, setError}) => {
	return (
		<RemotionEnvironmentContext.Provider value={studioPreviewEnvironment}>
			<CompositionRenderErrorContext.Provider
				value={{
					setError,
					clearError: () => undefined,
				}}
			>
				<WrapSequenceContext>
					<SharedAudioContextProvider
						audioEnabled={false}
						audioLatencyHint="playback"
						previewSampleRate={null}
					>
						{children}
					</SharedAudioContextProvider>
				</WrapSequenceContext>
			</CompositionRenderErrorContext.Provider>
		</RemotionEnvironmentContext.Provider>
	);
};

test('Studio routes video media errors to CompositionRenderErrorContext', () => {
	const reported: Error[] = [];

	const {container} = render(
		<WrapStudioPreview
			setError={(error) => {
				reported.push(error);
			}}
		>
			<Html5Video src="https://example.com/missing.mp4" />
		</WrapStudioPreview>,
	);

	const video = container.querySelector('video');
	expect(video).not.toBeNull();

	Object.defineProperty(video, 'error', {
		configurable: true,
		value: {
			code: 4,
			message: 'MEDIA_ELEMENT_ERROR: Format error',
		},
	});

	expect(() => {
		fireEvent.error(video as HTMLVideoElement);
	}).not.toThrow();

	expect(reported).toHaveLength(1);
	expect(reported[0]).toBeInstanceOf(MediaPlaybackError);
	expect(reported[0]?.message).toContain('Code 4');
	expect((reported[0] as MediaPlaybackError).src).toBe(
		'https://example.com/missing.mp4',
	);
});

test('outside Studio, video media errors are not routed to CompositionRenderErrorContext', () => {
	const previewEnvironment = {
		...studioPreviewEnvironment,
		isStudio: false,
	};
	const reported: Error[] = [];
	const windowErrors: Error[] = [];
	const onWindowError = (event: ErrorEvent) => {
		if (event.error instanceof Error) {
			windowErrors.push(event.error);
		}

		event.preventDefault();
	};

	window.addEventListener('error', onWindowError);

	try {
		const {container} = render(
			<RemotionEnvironmentContext.Provider value={previewEnvironment}>
				<CompositionRenderErrorContext.Provider
					value={{
						setError: (error) => {
							reported.push(error);
						},
						clearError: () => undefined,
					}}
				>
					<WrapSequenceContext>
						<SharedAudioContextProvider
							audioEnabled={false}
							audioLatencyHint="playback"
							previewSampleRate={null}
						>
							<Html5Video src="https://example.com/missing.mp4" />
						</SharedAudioContextProvider>
					</WrapSequenceContext>
				</CompositionRenderErrorContext.Provider>
			</RemotionEnvironmentContext.Provider>,
		);

		const video = container.querySelector('video');
		expect(video).not.toBeNull();

		Object.defineProperty(video, 'error', {
			configurable: true,
			value: {
				code: 4,
				message: 'MEDIA_ELEMENT_ERROR: Format error',
			},
		});

		fireEvent.error(video as HTMLVideoElement);

		expect(reported).toHaveLength(0);
		expect(windowErrors.some((err) => err instanceof MediaPlaybackError)).toBe(
			true,
		);
	} finally {
		window.removeEventListener('error', onWindowError);
	}
});
