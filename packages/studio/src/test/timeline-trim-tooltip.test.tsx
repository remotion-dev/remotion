import {expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import {portals} from '../components/Menu/portals';
import type {TimelineTrimLimitReason} from '../components/Timeline/timeline-trim-limit-reason';
import {
	TimelineTrimTooltip,
	type TimelineTrimTooltipState,
} from '../components/Timeline/TimelineTrimTooltip';

test('trim feedback starts centered, grows left, and hides natural boundary reasons', () => {
	const portal = document.createElement('div');
	document.body.appendChild(portal);
	const previousPortal = portals[0];
	portals[0] = portal;
	const state: TimelineTrimTooltipState = {
		x: 300,
		y: 300,
		deltaFrames: -2,
		edgeFrame: 48,
		limitReason: null,
	};
	try {
		const view = render(
			<TimelineTrimTooltip showSourceLimits={false} state={state} fps={30} />,
		);
		const tooltip = () => portal.firstElementChild as HTMLDivElement;
		const right = () =>
			parseFloat(tooltip().style.left) + parseFloat(tooltip().style.width);
		const initialWidth = parseFloat(tooltip().style.width);
		const initialRight = right();
		expect(parseFloat(tooltip().style.left) + initialWidth / 2).toBe(state.x);

		for (const reason of [
			'Keyframe constraint',
			'Computed keyframes',
			'Unknown media duration',
			'Transition limit',
		] as const) {
			view.rerender(
				<TimelineTrimTooltip
					showSourceLimits={false}
					state={{...state, limitReason: reason}}
					fps={30}
				/>,
			);
			expect(tooltip().textContent).toContain(reason);
			expect(parseFloat(tooltip().style.width)).toBeGreaterThan(initialWidth);
			expect(right()).toBe(initialRight);
			expect(parseFloat(tooltip().style.top)).toBeLessThan(state.y - 40);
		}

		const hidden: TimelineTrimLimitReason[] = [
			'Minimum duration',
			'Source start',
			'Source end',
			'Parent edge',
			'Composition edge',
			'Adjacent clip',
			'Content end',
			'Trim limit',
		];
		for (const reason of hidden) {
			view.rerender(
				<TimelineTrimTooltip
					showSourceLimits={false}
					state={{...state, x: 330, limitReason: reason}}
					fps={30}
				/>,
			);
			expect(tooltip().textContent).not.toContain(reason);
			expect(parseFloat(tooltip().style.width)).toBe(initialWidth);
			expect(right()).toBe(initialRight + 30);
			expect(parseFloat(tooltip().style.top)).toBe(state.y - 40);
		}

		view.unmount();
		render(
			<TimelineTrimTooltip
				showSourceLimits={false}
				state={{...state, limitReason: 'Keyframe constraint'}}
				fps={30}
			/>,
		);
		expect(
			parseFloat(tooltip().style.left) + parseFloat(tooltip().style.width) / 2,
		).toBe(state.x);
	} finally {
		cleanup();
		portals[0] = previousPortal;
		portal.remove();
	}
});
