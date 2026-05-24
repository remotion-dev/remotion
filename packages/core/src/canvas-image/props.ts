import type React from 'react';
import type {ImageFit} from '../calculate-image-fit.js';
import type {EffectsProp} from '../effects/effect-types.js';
import type {SequenceProps} from '../Sequence.js';

type CanvasImageSequenceProps = Pick<
	SequenceProps,
	'durationInFrames' | 'from' | 'hidden' | 'name' | 'showInTimeline'
> & {
	/**
	 * @deprecated For internal use only.
	 */
	readonly stack?: string;
};

export type CanvasImageProps = CanvasImageSequenceProps & {
	readonly src: string;
	readonly width?: number;
	readonly height?: number;
	readonly fit?: ImageFit;
	readonly effects?: EffectsProp;
	readonly className?: string;
	readonly style?: React.CSSProperties;
	readonly id?: string;
	readonly onError?: (error: Error) => void;
};
