import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {Img} from '../Img.js';
import type {RemotionEnvironment} from '../remotion-environment-context.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(() => {
	cleanup();
});

const testImgUrl = 'https://source.unsplash.com/random/50x50';

const previewEnvironment: RemotionEnvironment = {
	isClientSideRendering: false,
	isPlayer: false,
	isReadOnlyStudio: false,
	isRendering: false,
	isStudio: false,
};

const renderImg = (
	element: React.ReactElement,
	environment: RemotionEnvironment = previewEnvironment,
) => {
	render(
		<RemotionEnvironmentContext.Provider value={environment}>
			<WrapSequenceContext>{element}</WrapSequenceContext>
		</RemotionEnvironmentContext.Provider>,
	);
};

test('Img component renders img tag', () => {
	const ref = React.createRef<HTMLImageElement>();
	renderImg(<Img ref={ref} src={testImgUrl} />);

	expect(ref.current?.tagName).toBe('IMG');
});

test('Src attribute is forwarded to img tag', () => {
	const ref = React.createRef<HTMLImageElement>();
	renderImg(<Img ref={ref} src={testImgUrl} />);

	expect(ref.current).toHaveProperty('src', testImgUrl);
});

test('Img does not force synchronous decoding outside of rendering', () => {
	const ref = React.createRef<HTMLImageElement>();
	renderImg(<Img ref={ref} src={testImgUrl} />);

	expect(ref.current?.getAttribute('decoding')).toBeNull();
});

test('Img preserves the decoding prop outside of rendering', () => {
	const ref = React.createRef<HTMLImageElement>();
	renderImg(<Img ref={ref} src={testImgUrl} decoding="async" />);

	expect(ref.current?.getAttribute('decoding')).toBe('async');
});

test('Img forces synchronous decoding while rendering', () => {
	const ref = React.createRef<HTMLImageElement>();
	renderImg(<Img ref={ref} src={testImgUrl} decoding="async" />, {
		...previewEnvironment,
		isRendering: true,
	});

	expect(ref.current?.getAttribute('decoding')).toBe('sync');
});
