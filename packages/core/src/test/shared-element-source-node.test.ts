import {expect, test} from 'bun:test';
import type React from 'react';
import {makeSharedElementSourceNode} from '../audio/shared-element-source-node.js';

test('connects once an AudioContext becomes available', () => {
	const audioElement = {} as HTMLAudioElement;
	const ref = {
		current: audioElement,
	} as React.RefObject<HTMLAudioElement>;
	const createdFor: HTMLMediaElement[] = [];
	const mediaElementSourceNode = {
		disconnect: () => undefined,
	} as MediaElementAudioSourceNode;
	const audioContext = {
		createMediaElementSource: (element: HTMLMediaElement) => {
			createdFor.push(element);
			return mediaElementSourceNode;
		},
	} as AudioContext;
	const source = makeSharedElementSourceNode({
		audioContext: null,
		ref,
	});

	source.attemptToConnect();
	source.setAudioContext(audioContext);
	source.attemptToConnect();

	expect(createdFor).toEqual([audioElement]);
	expect(source.get()).toBe(mediaElementSourceNode);
});
