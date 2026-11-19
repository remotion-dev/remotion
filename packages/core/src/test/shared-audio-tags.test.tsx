import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {Html5Audio} from '../audio/index.js';
import {
	SharedAudioContextProvider,
	SharedAudioTagsContextProvider,
} from '../audio/shared-audio-tags.js';
import {
	RemotionEnvironmentContext,
	type RemotionEnvironment,
} from '../remotion-environment-context.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

const playerEnvironment: RemotionEnvironment = {
	isStudio: false,
	isRendering: false,
	isClientSideRendering: false,
	isPlayer: true,
	isReadOnlyStudio: false,
};

const PlayerAudioWrapper: React.FC<{
	readonly numberOfAudioTags: number;
	readonly children: React.ReactNode;
}> = ({numberOfAudioTags, children}) => {
	return (
		<RemotionEnvironmentContext.Provider value={playerEnvironment}>
			<WrapSequenceContext>
				<SharedAudioContextProvider
					audioLatencyHint="interactive"
					audioEnabled={false}
					previewSampleRate={null}
					_experimentalKeepAudioContextAlive={false}
				>
					<SharedAudioTagsContextProvider numberOfAudioTags={numberOfAudioTags}>
						{children}
					</SharedAudioTagsContextProvider>
				</SharedAudioContextProvider>
			</WrapSequenceContext>
		</RemotionEnvironmentContext.Provider>
	);
};

afterEach(() => {
	cleanup();
});

const Sound: React.FC<{readonly src: string}> = ({src}) => {
	return <Html5Audio src={src} />;
};

const getAudioSrcs = (container: HTMLElement) => {
	return Array.from(container.querySelectorAll('audio')).map(
		(audio) => audio.src,
	);
};

test('keeps shared audio src when parent component remounts via key change', () => {
	const src = 'https://example.com/beep.mp3';
	const App: React.FC<{
		readonly version: string;
		readonly mounted?: boolean;
	}> = ({version, mounted = true}) => {
		return (
			<PlayerAudioWrapper numberOfAudioTags={5}>
				{mounted ? <Sound key={version} src={src} /> : null}
			</PlayerAudioWrapper>
		);
	};

	const {container, rerender} = render(<App version="a" mounted={false} />);
	rerender(<App version="a" />);

	expect(getAudioSrcs(container).filter((s) => s === src)).toHaveLength(1);

	rerender(<App version="b" />);

	expect(getAudioSrcs(container).filter((s) => s === src)).toHaveLength(1);

	rerender(<App version="c" />);

	expect(getAudioSrcs(container).filter((s) => s === src)).toHaveLength(1);

	rerender(<App version="c" mounted={false} />);

	expect(getAudioSrcs(container).filter((s) => s === src)).toHaveLength(0);
	expect(
		getAudioSrcs(container).every((s) =>
			s.startsWith('data:audio/mp3;base64,'),
		),
	).toBe(true);
});

test('keeps shared audio src on remount when numberOfAudioTags is 1', () => {
	const src = 'https://example.com/beep.mp3';
	const App: React.FC<{
		readonly version: string;
		readonly mounted?: boolean;
	}> = ({version, mounted = true}) => {
		return (
			<PlayerAudioWrapper numberOfAudioTags={1}>
				{mounted ? <Sound key={version} src={src} /> : null}
			</PlayerAudioWrapper>
		);
	};

	const {container, rerender} = render(<App version="a" mounted={false} />);
	rerender(<App version="a" />);

	expect(getAudioSrcs(container)).toEqual([src]);

	rerender(<App version="b" />);

	expect(getAudioSrcs(container)).toEqual([src]);
});

test('keeps shared audio src on remount under React.StrictMode', () => {
	const src = 'https://example.com/beep.mp3';
	const App: React.FC<{
		readonly version: string;
		readonly mounted?: boolean;
	}> = ({version, mounted = true}) => {
		return (
			<React.StrictMode>
				<PlayerAudioWrapper numberOfAudioTags={2}>
					{mounted ? <Sound key={version} src={src} /> : null}
				</PlayerAudioWrapper>
			</React.StrictMode>
		);
	};

	const {container, rerender} = render(<App version="a" mounted={false} />);
	rerender(<App version="a" />);

	expect(getAudioSrcs(container).filter((s) => s === src)).toHaveLength(1);

	rerender(<App version="b" />);

	expect(getAudioSrcs(container).filter((s) => s === src)).toHaveLength(1);

	rerender(<App version="b" mounted={false} />);

	expect(getAudioSrcs(container).filter((s) => s === src)).toHaveLength(0);
});

test('keeps shared audio src while another identical Html5Audio remains mounted', () => {
	const src = 'https://example.com/beep.mp3';
	const App: React.FC<{
		readonly showFirst: boolean;
		readonly showSecond: boolean;
	}> = ({showFirst, showSecond}) => {
		return (
			<PlayerAudioWrapper numberOfAudioTags={3}>
				{showFirst ? <Sound key="first" src={src} /> : null}
				{showSecond ? <Sound key="second" src={src} /> : null}
			</PlayerAudioWrapper>
		);
	};

	const {container, rerender} = render(
		<App showFirst={false} showSecond={false} />,
	);
	rerender(<App showFirst showSecond />);

	expect(getAudioSrcs(container).filter((s) => s === src)).toHaveLength(1);

	rerender(<App showFirst={false} showSecond />);

	expect(getAudioSrcs(container).filter((s) => s === src)).toHaveLength(1);

	rerender(<App showFirst={false} showSecond={false} />);

	expect(getAudioSrcs(container).filter((s) => s === src)).toHaveLength(0);
});
