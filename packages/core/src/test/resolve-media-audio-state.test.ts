import {describe, expect, test} from 'bun:test';
import {resolveMediaAudioState} from '../audio/use-media-audio-state.js';

describe('resolveMediaAudioState()', () => {
	test.each([
		{
			name: 'audible media',
			input: {
				muted: false,
				playerMuted: false,
				volume: 1,
				isInsideFreeze: false,
				audioEnabled: true,
			},
			expected: {
				isMutedForTimeline: false,
				isMutedForPlayback: false,
				shouldUseAudio: true,
			},
		},
		{
			name: 'muted media',
			input: {
				muted: true,
				playerMuted: false,
				volume: 1,
				isInsideFreeze: false,
				audioEnabled: true,
			},
			expected: {
				isMutedForTimeline: true,
				isMutedForPlayback: true,
				shouldUseAudio: false,
			},
		},
		{
			name: 'frozen media',
			input: {
				muted: false,
				playerMuted: false,
				volume: 1,
				isInsideFreeze: true,
				audioEnabled: true,
			},
			expected: {
				isMutedForTimeline: true,
				isMutedForPlayback: true,
				shouldUseAudio: false,
			},
		},
		{
			name: 'muted player',
			input: {
				muted: false,
				playerMuted: true,
				volume: 1,
				isInsideFreeze: false,
				audioEnabled: true,
			},
			expected: {
				isMutedForTimeline: false,
				isMutedForPlayback: true,
				shouldUseAudio: false,
			},
		},
		{
			name: 'zero volume',
			input: {
				muted: false,
				playerMuted: false,
				volume: 0,
				isInsideFreeze: false,
				audioEnabled: true,
			},
			expected: {
				isMutedForTimeline: false,
				isMutedForPlayback: true,
				shouldUseAudio: false,
			},
		},
		{
			name: 'volume not known yet',
			input: {
				muted: false,
				playerMuted: false,
				volume: null,
				isInsideFreeze: false,
				audioEnabled: true,
			},
			expected: {
				isMutedForTimeline: false,
				isMutedForPlayback: false,
				shouldUseAudio: true,
			},
		},
		{
			name: 'audio disabled by renderer',
			input: {
				muted: false,
				playerMuted: false,
				volume: 1,
				isInsideFreeze: false,
				audioEnabled: false,
			},
			expected: {
				isMutedForTimeline: false,
				isMutedForPlayback: false,
				shouldUseAudio: false,
			},
		},
	])('$name', ({input, expected}) => {
		expect(resolveMediaAudioState(input)).toEqual(expected);
	});
});
