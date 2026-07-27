import {expect, test} from 'bun:test';
import {renderToString} from 'react-dom/server';
import {pushCut} from '../presentations/push-cut';

test('pushCut() should return a presentation', () => {
	const presentation = pushCut({
		cutProgress: 0.4,
		flashColor: '#ffffff',
	});

	expect(presentation.props).toEqual({
		cutProgress: 0.4,
		flashColor: '#ffffff',
	});
	expect(typeof presentation.component).toBe('function');
});

test('pushCut() should hide the incoming scene before the cut', () => {
	const presentation = pushCut({cutProgress: 0.5});
	const Component = presentation.component;
	const markup = renderToString(
		<Component
			bothEnteringAndExiting
			onElementImage={() => undefined}
			onUnmount={() => undefined}
			passedProps={presentation.props}
			presentationDirection="entering"
			presentationDurationInFrames={10}
			presentationProgress={0.25}
		>
			<div>Incoming</div>
		</Component>,
	);

	expect(markup).toContain('opacity:0');
});

test('pushCut() should apply the incoming scale and flash at the cut', () => {
	const presentation = pushCut({cutProgress: 0.5});
	const Component = presentation.component;
	const markup = renderToString(
		<Component
			bothEnteringAndExiting
			onElementImage={() => undefined}
			onUnmount={() => undefined}
			passedProps={presentation.props}
			presentationDirection="entering"
			presentationDurationInFrames={10}
			presentationProgress={0.5}
		>
			<div>Incoming</div>
		</Component>,
	);

	expect(markup).toContain('transform:scale(1.04)');
	expect(markup).toContain('background-color:#f5f2ed');
	expect(markup).toContain('opacity:0.2');
});

test('pushCut() should reject invalid props', () => {
	expect(() => pushCut({cutProgress: 0})).toThrow('cutProgress');
	expect(() => pushCut({cutProgress: Number.NaN})).toThrow('finite');
	expect(() => pushCut({outgoingScale: 0})).toThrow('outgoingScale');
	expect(() => pushCut({incomingStartScale: Number.POSITIVE_INFINITY})).toThrow(
		'finite',
	);
	expect(() => pushCut({flashOpacity: 1.1})).toThrow('flashOpacity');
	expect(() => pushCut({flashFrames: -1})).toThrow('flashFrames');
});
