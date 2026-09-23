import type React from 'react';
import {Freeze} from './freeze.js';
import type {InteractivePremountProps} from './Interactive.js';
import {Sequence, type SequenceProps} from './Sequence.js';
import {usePremounting} from './use-premounting.js';

// Components that own their DOM element cannot use Sequence's layout wrapper.
// Keep the timing and registration shared, and let the caller hide its element.
export const PremountedSequence = ({
	from = 0,
	durationInFrames = Infinity,
	premountFor,
	postmountFor,
	style,
	styleWhilePremounted,
	styleWhilePostmounted,
	hideWhilePremounted,
	children,
	...props
}: Omit<SequenceProps, 'children' | 'layout' | 'style'> &
	InteractivePremountProps & {
		readonly style: React.CSSProperties | null;
		readonly hideWhilePremounted: 'opacity' | 'display-none';
		readonly children: (style: React.CSSProperties | null) => React.ReactNode;
	}) => {
	const {
		effectivePremountFor,
		effectivePostmountFor,
		freezeFrame,
		isPremountingOrPostmounting,
		premountingActive,
		postmountingActive,
		premountingStyle,
	} = usePremounting({
		from,
		durationInFrames,
		premountFor: premountFor ?? null,
		postmountFor: postmountFor ?? null,
		style,
		styleWhilePremounted: styleWhilePremounted ?? null,
		styleWhilePostmounted: styleWhilePostmounted ?? null,
		hideWhilePremounted,
	});

	return (
		<Freeze frame={freezeFrame} active={isPremountingOrPostmounting}>
			<Sequence
				{...props}
				layout="none"
				from={from}
				durationInFrames={durationInFrames}
				_remotionInternalPremountDisplay={effectivePremountFor || null}
				_remotionInternalPostmountDisplay={effectivePostmountFor || null}
				_remotionInternalIsPremounting={premountingActive}
				_remotionInternalIsPostmounting={postmountingActive}
			>
				{children(premountingStyle)}
			</Sequence>
		</Freeze>
	);
};
