import {halftone} from '@remotion/effects/halftone';
import {tint} from '@remotion/effects/tint';
import React from 'react';
import {HtmlInCanvas, useVideoConfig} from 'remotion';
import ReactSvg from '../ReactSvg';

/** ReactSvg scene rasterized with drawElementImage, then halftone + tint on the canvas. */
export const HtmlInCanvasReactSvg: React.FC<{
	readonly transparent: boolean;
}> = ({transparent}) => {
	const {width, height} = useVideoConfig();

	return (
		<>
			<HtmlInCanvas
				width={width}
				height={height}
				effects={[
					halftone({
						dotSize: 30,
						dotSpacing: 20,
						shape: 'square',
					}),
					tint({color: 'green', amount: 1}),
				]}
			>
				<ReactSvg transparent={transparent} />
			</HtmlInCanvas>
		</>
	);
};
