import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {NeonRays} from './NeonRays';
import {NotebookSheet} from './NotebookSheet';
import {PaperDiscoBall} from './PaperDiscoBall';

/** Transparent ball only — render as ProRes 4444 / PNG sequence for layering. */
export const PaperDiscoBallLayer: React.FC = () => {
	const {width} = useVideoConfig();
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
			<PaperDiscoBall
				gridOpacity={null}
				name="Paper disco ball"
				size={width}
				shadow
				shadowOpacity={0.25}
			/>
		</AbsoluteFill>
	);
};

/** Same ball, no shadow — add your own shadow in the edit. */
export const PaperDiscoBallNoShadowLayer: React.FC = () => {
	const {width} = useVideoConfig();
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
			<PaperDiscoBall
				gridOpacity={null}
				name="Paper disco ball"
				size={width}
				shadow={false}
			/>
		</AbsoluteFill>
	);
};

/** Neon rays on transparent. Put it under the paper layers. */
export const NeonRaysLayer: React.FC = () => {
	const {width, height} = useVideoConfig();
	return (
		<AbsoluteFill>
			<NeonRays
				gridOpacity={null}
				name="Neon rays"
				centerX={width / 2}
				centerY={height / 2}
			/>
		</AbsoluteFill>
	);
};

/** A full lined notebook page with punched holes, slightly inset so the torn edge shows. */
export const NotebookPageLayer: React.FC = () => {
	const {width, height} = useVideoConfig();
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
			<NotebookSheet
				name="Notebook page"
				width={width - 80}
				height={height - 80}
				seed={7}
				tornness={26}
			/>
		</AbsoluteFill>
	);
};
