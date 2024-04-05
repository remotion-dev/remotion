import {expect, mock, test} from 'bun:test';
import type {RefObject} from 'react';
import React, {useMemo} from 'react';
import {ResolveCompositionConfig} from '../ResolveCompositionConfig.js';
import type {SequenceManagerContext} from '../SequenceManager.js';
import {SequenceManager} from '../SequenceManager.js';
import {useMediaInTimeline} from '../use-media-in-timeline.js';
import {renderHook} from './render-hook.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

test('useMediaInTimeline registers and unregisters new sequence', () => {
	const registerSequence = mock();
	const unregisterSequence = mock();
	const wrapper: React.FC<{
		children: React.ReactNode;
	}> = ({children}) => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const sequenceManagerContext: SequenceManagerContext = useMemo(() => {
			return {
				registerSequence,
				unregisterSequence,
				sequences: [],
			};
		}, []);

		return (
			<WrapSequenceContext>
				<SequenceManager.Provider value={sequenceManagerContext}>
					<ResolveCompositionConfig>{children}</ResolveCompositionConfig>
				</SequenceManager.Provider>
			</WrapSequenceContext>
		);
	};

	const audioRef = {
		current: {volume: 0.5},
	} as unknown as RefObject<HTMLAudioElement>;

	const {unmount} = renderHook(
		() =>
			useMediaInTimeline({
				volume: 1,
				src: 'test',
				mediaVolume: 1,
				mediaType: 'audio',
				mediaRef: audioRef,
				playbackRate: 1,
				displayName: null,
				id: 'test',
				stack: null,
				showInTimeline: true,
			}),
		{
			wrapper,
		},
	);
	expect(registerSequence).toHaveBeenCalled();
	unmount();
	expect(unregisterSequence).toHaveBeenCalled();
});
