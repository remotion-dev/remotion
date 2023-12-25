import {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import type {
	TransitionPresentation,
	TransitionPresentationComponentProps,
} from '../types.js';

// No options: https://www.totaltypescript.com/the-empty-object-type-in-typescript
export type FadeProps = Record<string, never>;

const FadePresentation: React.FC<
	TransitionPresentationComponentProps<FadeProps>
> = ({children, presentationDirection, presentationProgress}) => {
	const isEntering = presentationDirection === 'entering';
	const style: React.CSSProperties = useMemo(() => {
		return {
			opacity: isEntering ? presentationProgress : 1,
		};
	}, [isEntering, presentationProgress]);

	return (
		<AbsoluteFill>
			<AbsoluteFill style={style}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const fade = (props?: FadeProps): TransitionPresentation<FadeProps> => {
	return {
		component: FadePresentation,
		props: props ?? {},
	};
};
