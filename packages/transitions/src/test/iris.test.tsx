import {
	makeMockCompositionManagerContext,
	makeTimelineContext,
} from '@remotion/test-utils';
import {expect, test} from 'bun:test';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {Internals} from 'remotion';
import {iris} from '../presentations/iris';

const renderForFrame = (frame: number, markup: React.ReactNode) => {
	return renderToString(
		<Internals.CanUseRemotionHooksProvider>
			<Internals.CompositionManager.Provider
				value={makeMockCompositionManagerContext()}
			>
				<Internals.Timeline.TimelineContext.Provider
					value={makeTimelineContext(frame)}
				>
					{markup}
				</Internals.Timeline.TimelineContext.Provider>
			</Internals.CompositionManager.Provider>
		</Internals.CanUseRemotionHooksProvider>,
	);
};

test('iris presentation should create correct component structure', () => {
	const irisPresentation = iris({
		width: 100,
		height: 100,
	});

	expect(irisPresentation).toHaveProperty('component');
	expect(irisPresentation).toHaveProperty('props');
	expect(irisPresentation.props).toEqual({
		width: 100,
		height: 100,
	});
});

test('iris presentation should render without crashing', () => {
	const irisPresentation = iris({
		width: 100,
		height: 100,
	});

	const IrisComponent = irisPresentation.component;

	expect(() => {
		renderForFrame(
			10,
			<IrisComponent
				presentationDirection="entering"
				presentationProgress={0.5}
				passedProps={irisPresentation.props}
				presentationDurationInFrames={30}
			>
				<div>Test Content</div>
			</IrisComponent>,
		);
	}).not.toThrow();
});

test('iris presentation should handle different presentation directions', () => {
	const irisPresentation = iris({
		width: 100,
		height: 100,
	});

	const IrisComponent = irisPresentation.component;

	// Test entering direction
	expect(() => {
		renderForFrame(
			10,
			<IrisComponent
				presentationDirection="entering"
				presentationProgress={0.5}
				passedProps={irisPresentation.props}
				presentationDurationInFrames={30}
			>
				<div>Test Content</div>
			</IrisComponent>,
		);
	}).not.toThrow();

	// Test exiting direction
	expect(() => {
		renderForFrame(
			10,
			<IrisComponent
				presentationDirection="exiting"
				presentationProgress={0.5}
				passedProps={irisPresentation.props}
				presentationDurationInFrames={30}
			>
				<div>Test Content</div>
			</IrisComponent>,
		);
	}).not.toThrow();
});