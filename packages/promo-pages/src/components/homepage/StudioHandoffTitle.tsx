import React, {useEffect, useRef} from 'react';
import {handoffEasing} from './studio-handoff/renderer';

// Midpoints and directions of the two-second slides in StudioCodeHandoff.
const transitions = [
	{midpoint: 3, from: 'programmatically', to: 'interactively', direction: 1},
	{midpoint: 6.5, from: 'interactively', to: 'agentically', direction: 1},
	{midpoint: 10, from: 'agentically', to: 'programmatically', direction: -1},
] as const;
const halfTransitionDuration = 0.2;

export const StudioHandoffTitle: React.FC<{
	readonly onFrameRef: React.RefObject<((time: number) => void) | null>;
}> = ({onFrameRef}) => {
	const wordRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const word = wordRef.current;
		if (!word) {
			return;
		}

		const update = (time: number) => {
			let text = 'programmatically';
			let opacity = 1;
			let offset = 0;

			for (const transition of transitions) {
				const start = transition.midpoint - halfTransitionDuration;
				const end = transition.midpoint + halfTransitionDuration;
				if (time < start) {
					break;
				}

				if (time >= end) {
					text = transition.to;
					continue;
				}

				const entering = time >= transition.midpoint;
				// Ease the entire motion once, so it keeps moving through the word swap.
				const progress = (time - start) / (end - start);
				const eased = handoffEasing(progress);
				text = entering ? transition.to : transition.from;
				opacity = Math.abs(2 * eased - 1);
				offset = transition.direction * 60 * (eased - (entering ? 1 : 0));
				break;
			}

			const content = `${text}.`;
			if (word.textContent !== content) {
				word.textContent = content;
			}

			word.style.opacity = String(opacity);
			word.style.transform = `translateX(${offset}px)`;
		};

		onFrameRef.current = update;
		update(0);
		return () => {
			onFrameRef.current = null;
		};
	}, [onFrameRef]);

	return (
		<>
			Make videos{' '}
			<span style={{display: 'inline-grid', whiteSpace: 'nowrap'}}>
				<span aria-hidden style={{gridArea: '1 / 1', visibility: 'hidden'}}>
					programmatically.
				</span>
				<span ref={wordRef} style={{gridArea: '1 / 1'}}>
					programmatically.
				</span>
			</span>
		</>
	);
};
