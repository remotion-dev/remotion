import React from 'react';
import type {StudioHandoffMode} from './studio-handoff/animation';

export const StudioHandoffSectionTitle: React.FC<{
	readonly mode: StudioHandoffMode;
	readonly selectModeRef: React.RefObject<
		((mode: StudioHandoffMode) => void) | null
	>;
}> = ({mode, selectModeRef}) => {
	return (
		<button
			type="button"
			onClick={() => selectModeRef.current?.(mode)}
			className="cursor-pointer border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
			style={{font: 'inherit', color: 'inherit'}}
		>
			<span
				className="min-[900px]:text-[var(--handoff-label-color,var(--subtitle))]"
				style={
					{
						'--handoff-label-color': `var(--make-videos-${mode}-color)`,
					} as React.CSSProperties
				}
			>
				Make videos
			</span>{' '}
			<br className="hidden min-[900px]:block" />
			{mode}
		</button>
	);
};
