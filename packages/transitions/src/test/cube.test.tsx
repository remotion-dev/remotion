import {expect, test} from 'bun:test';
import {renderToStaticMarkup} from 'react-dom/server';
import type {CubeDirection} from '../presentations/cube';
import {cube} from '../presentations/cube';

test.each([
	['from-left', 'entering', 'translateX(-50%) rotateY(-45deg)', 'right'],
	['from-left', 'exiting', 'translateX(50%) rotateY(45deg)', 'left'],
	['from-right', 'entering', 'translateX(50%) rotateY(45deg)', 'left'],
	['from-right', 'exiting', 'translateX(-50%) rotateY(-45deg)', 'right'],
	['from-top', 'entering', 'translateY(-50%) rotateX(45deg)', 'bottom'],
	['from-top', 'exiting', 'translateY(50%) rotateX(-45deg)', 'top'],
	['from-bottom', 'entering', 'translateY(50%) rotateX(-45deg)', 'top'],
	['from-bottom', 'exiting', 'translateY(-50%) rotateX(45deg)', 'bottom'],
] as const)(
	'cube %s %s preserves its rotation and translation',
	(direction, presentationDirection, transform, origin) => {
		const presentation = cube({direction, perspective: 750});
		const Component = presentation.component;
		const html = renderToStaticMarkup(
			<Component
				presentationDirection={presentationDirection}
				presentationProgress={0.5}
				presentationDurationInFrames={30}
				passedProps={presentation.props}
				onElementImage={() => {}}
				onUnmount={() => {}}
				bothEnteringAndExiting={false}
			>
				Scene
			</Component>,
		);
		expect(html).toContain(`transform:${transform}`);
		expect(html).toContain(`transform-origin:${origin}`);
		expect(html).toContain('perspective:750px');
		expect(html).toContain('backface-visibility:hidden');
		expect(html).toContain('Scene');
	},
);

test.each(['from-left', 'from-right', 'from-top', 'from-bottom'] as const)(
	'cube %s enters fully with the default perspective',
	(direction: CubeDirection) => {
		const presentation = cube({direction});
		const Component = presentation.component;
		const html = renderToStaticMarkup(
			<Component
				presentationDirection="entering"
				presentationProgress={1}
				presentationDurationInFrames={30}
				passedProps={presentation.props}
				onElementImage={() => {}}
				onUnmount={() => {}}
				bothEnteringAndExiting={false}
			>
				Scene
			</Component>,
		);
		expect(html).toContain('perspective:1000px');
		expect(html).toContain(
			direction === 'from-left' || direction === 'from-right'
				? 'transform:translateX(0%) rotateY(0deg)'
				: 'transform:translateY(0%) rotateX(0deg)',
		);
	},
);
