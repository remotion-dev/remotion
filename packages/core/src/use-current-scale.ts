import React, {createContext} from 'react';
import {getRemotionEnvironment} from './get-remotion-environment';
import {useUnsafeVideoConfig} from './use-unsafe-video-config';

type Size = {
	width: number;
	height: number;
	left: number;
	top: number;
	windowSize: {
		width: number;
		height: number;
	};
	refresh: () => void;
};

export type CurrentScaleContextType =
	| {
			type: 'scale';
			scale: number;
	  }
	| {
			type: 'canvas-size';
			canvasSize: Size;
	  };

export const CurrentScaleContext =
	React.createContext<CurrentScaleContextType | null>(null);

type Options = {
	dontThrowIfOutsideOfRemotion: boolean;
};

export type Translation = {
	x: number;
	y: number;
};

export type PreviewSize = {
	size: number | 'auto';
	translation: Translation;
};

export type PreviewSizeCtx = {
	size: PreviewSize;
	setSize: (cb: (oldSize: PreviewSize) => PreviewSize) => void;
};

export const PreviewSizeContext = createContext<PreviewSizeCtx>({
	setSize: () => undefined,
	size: {size: 'auto', translation: {x: 0, y: 0}},
});

export const calculateScale = ({
	canvasSize,
	compositionHeight,
	compositionWidth,
	previewSize,
}: {
	previewSize: PreviewSize['size'];
	compositionWidth: number;
	compositionHeight: number;
	canvasSize: {width: number; height: number};
}) => {
	const heightRatio = canvasSize.height / compositionHeight;
	const widthRatio = canvasSize.width / compositionWidth;

	const ratio = Math.min(heightRatio, widthRatio);

	return previewSize === 'auto' ? ratio : Number(previewSize);
};

/*
 * @description Retrieves the current scale of the canvas within Remotion's Studio or Player context. In the Studio, it corresponds to the zoom level (1 equals no scaling, i.e., 100% zoom). In the Player, it indicates the scaling necessary to fit the video into the player. If called outside of a Remotion context, by default, it throws an error unless configured not to.
 * @see [Documentation](https://www.remotion.dev/docs/use-current-scale)
 */
export const useCurrentScale = (options?: Options) => {
	const hasContext = React.useContext(CurrentScaleContext);
	const zoomContext = React.useContext(PreviewSizeContext);
	const config = useUnsafeVideoConfig();

	if (hasContext === null || config === null || zoomContext === null) {
		if (options?.dontThrowIfOutsideOfRemotion) {
			return 1;
		}

		if (getRemotionEnvironment().isRendering) {
			return 1;
		}

		throw new Error(
			[
				'useCurrentScale() was called outside of a Remotion context.',
				'This hook can only be called in a component that is being rendered by Remotion.',
				'If you want to this hook to return 1 outside of Remotion, pass {dontThrowIfOutsideOfRemotion: true} as an option.',
				'If you think you called this hook in a Remotion component, make sure all versions of Remotion are aligned.',
			].join('\n'),
		);
	}

	if (hasContext.type === 'scale') {
		return hasContext.scale;
	}

	return calculateScale({
		canvasSize: hasContext.canvasSize,
		compositionHeight: config.height,
		compositionWidth: config.width,
		previewSize: zoomContext.size.size,
	});
};
