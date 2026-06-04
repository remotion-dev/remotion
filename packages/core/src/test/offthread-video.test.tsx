import {afterEach, describe, expect, test} from 'bun:test';
import {cleanup, fireEvent, render} from '@testing-library/react';
import type React from 'react';
import {SharedAudioContextProvider} from '../audio/shared-audio-tags.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import {OffthreadVideo} from '../video/index.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(() => {
	cleanup();
});

const previewEnvironment = {
	isClientSideRendering: false,
	isPlayer: false,
	isReadOnlyStudio: false,
	isRendering: false,
	isStudio: false,
};

const WrapPreviewContext: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<RemotionEnvironmentContext.Provider value={previewEnvironment}>
			<WrapSequenceContext>
				<SharedAudioContextProvider
					audioEnabled={false}
					audioLatencyHint="playback"
					previewSampleRate={null}
				>
					{children}
				</SharedAudioContextProvider>
			</WrapSequenceContext>
		</RemotionEnvironmentContext.Provider>
	);
};

describe('OffthreadVideo render correctly with props', () => {
	test('It should render OffthreadVideo without startFrom / endAt props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render OffthreadVideo with startFrom props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" startFrom={10} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render OffthreadVideo with endAt props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" endAt={10} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render OffthreadVideo with startFrom and endAt props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" startFrom={10} endAt={20} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render OffthreadVideo with trimBefore props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" trimBefore={10} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render OffthreadVideo with trimAfter props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" trimAfter={10} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render OffthreadVideo with trimBefore and trimAfter props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" trimBefore={10} trimAfter={20} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render OffthreadVideo with onVideoFrame metadata arguments', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo
						src="test"
						onVideoFrame={(_frame, _now, _metadata) => undefined}
					/>
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should throw when both startFrom and trimBefore are provided', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" startFrom={10} trimBefore={5} />
				</WrapSequenceContext>,
			),
		).toThrow(/Cannot use both startFrom and trimBefore props/);
	});

	test('It should throw when both endAt and trimAfter are provided', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" endAt={15} trimAfter={20} />
				</WrapSequenceContext>,
			),
		).toThrow(/Cannot use both endAt and trimAfter props/);
	});

	test('It should preserve the default pitch behavior if the prop is omitted from OffthreadVideo', () => {
		const descriptor = Object.getOwnPropertyDescriptor(
			HTMLMediaElement.prototype,
			'preservesPitch',
		);
		let writes = 0;

		Object.defineProperty(HTMLMediaElement.prototype, 'preservesPitch', {
			configurable: true,
			get() {
				return descriptor?.get?.call(this) ?? true;
			},
			set(value) {
				writes++;
				descriptor?.set?.call(this, value);
			},
		});

		try {
			render(
				<WrapPreviewContext>
					<OffthreadVideo src="https://example.com/test.mp4" />
				</WrapPreviewContext>,
			);

			expect(writes).toBe(0);
		} finally {
			if (descriptor) {
				Object.defineProperty(
					HTMLMediaElement.prototype,
					'preservesPitch',
					descriptor,
				);
			}
		}
	});

	test('It should sync preservePitch on OffthreadVideo', () => {
		const {container, rerender} = render(
			<WrapPreviewContext>
				<OffthreadVideo preservePitch src="https://example.com/test.mp4" />
			</WrapPreviewContext>,
		);

		expect(container.querySelector('video')?.preservesPitch).toBe(true);

		rerender(
			<WrapPreviewContext>
				<OffthreadVideo
					preservePitch={false}
					src="https://example.com/test.mp4"
				/>
			</WrapPreviewContext>,
		);

		expect(container.querySelector('video')?.preservesPitch).toBe(false);
	});

	test('It should forward native props on OffthreadVideo', () => {
		let clicks = 0;

		const {container} = render(
			<WrapPreviewContext>
				<OffthreadVideo
					aria-label="Video preview"
					data-testid="offthread-video"
					onClick={() => {
						clicks++;
					}}
					role="img"
					src="https://example.com/test.mp4"
					tabIndex={0}
					title="Preview video"
				/>
			</WrapPreviewContext>,
		);

		const video = container.querySelector('video');

		expect(video?.getAttribute('aria-label')).toBe('Video preview');
		expect(video?.getAttribute('data-testid')).toBe('offthread-video');
		expect(video?.getAttribute('role')).toBe('img');
		expect(video?.getAttribute('tabindex')).toBe('0');
		expect(video?.getAttribute('title')).toBe('Preview video');

		fireEvent.click(video as HTMLVideoElement);
		expect(clicks).toBe(1);
	});

	test('It should reject invalid preservePitch values on OffthreadVideo', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo
						// @ts-expect-error
						preservePitch="yes"
						src="test"
					/>
				</WrapSequenceContext>,
			),
		).toThrow(
			/'preservePitch' must be a boolean or undefined but got 'string' instead/,
		);
	});
});
