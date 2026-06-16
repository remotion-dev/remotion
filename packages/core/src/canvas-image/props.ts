import type React from 'react';
import type {ImageFit} from '../calculate-image-fit.js';
import type {EffectsProp} from '../effects/effect-types.js';
import type {InteractiveBaseProps} from '../Interactive.js';

type CanvasImageSequenceProps = InteractiveBaseProps & {
	/**
	 * @deprecated For internal use only.
	 */
	readonly stack?: string;
};

export type CanvasImageCanvasProps = Omit<
	React.CanvasHTMLAttributes<HTMLCanvasElement>,
	'children' | 'height' | 'onError' | 'width'
>;

export type CanvasImageProps = CanvasImageSequenceProps &
	CanvasImageCanvasProps & {
		readonly src: string;
		readonly width?: number;
		readonly height?: number;
		readonly fit?: ImageFit;
		readonly effects?: EffectsProp;
		readonly className?: string;
		readonly style?: React.CSSProperties;
		readonly id?: string;
		readonly onError?: (error: Error) => void;
		readonly pauseWhenLoading?: boolean;
		readonly maxRetries?: number;
		readonly delayRenderRetries?: number;
		readonly delayRenderTimeoutInMilliseconds?: number;
		/**
		 * @deprecated For internal use only.
		 */
		readonly _remotionInternalDocumentationLink?: string;
		/**
		 * A React ref pointing to the element that Remotion Studio should use for
		 * drawing the selection outline in the preview.
		 */
		readonly outlineRef?: React.RefObject<HTMLElement | null> | null;
	};
