import React, {useEffect, useRef} from 'react';
import type {StudioHandoffTitleState} from './studio-handoff/animation';

const creationModes = [
	'programmatically',
	'interactively',
	'agentically',
] as const;

export const StudioHandoffTitle: React.FC<{
	readonly onFrameRef: React.RefObject<
		((state: StudioHandoffTitleState) => void) | null
	>;
	readonly sectionLabelsRef: React.RefObject<HTMLDivElement | null> | null;
}> = ({onFrameRef, sectionLabelsRef}) => {
	const wordRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const word = wordRef.current;
		if (!word) {
			return;
		}

		const labels = sectionLabelsRef?.current;
		let previousLabelState = '';
		const update = ({mode: text, opacity, offset}: StudioHandoffTitleState) => {
			const content = `${text}.`;
			if (word.textContent !== content) {
				word.textContent = content;
			}

			const labelState = `${text}:${opacity}`;
			if (labelState !== previousLabelState) {
				for (const mode of creationModes) {
					const strength = mode === text ? opacity * 100 : 0;
					labels?.style.setProperty(
						`--make-videos-${mode}-color`,
						`color-mix(in srgb, var(--text-color) ${strength}%, var(--subtitle))`,
					);
				}

				previousLabelState = labelState;
			}

			word.style.opacity = String(opacity);
			word.style.transform = `translateX(${offset}px)`;
		};

		onFrameRef.current = update;
		update({mode: 'programmatically', opacity: 1, offset: 0});
		return () => {
			onFrameRef.current = null;
			for (const mode of creationModes) {
				labels?.style.removeProperty(`--make-videos-${mode}-color`);
			}
		};
	}, [onFrameRef, sectionLabelsRef]);

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
