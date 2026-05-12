import React, {useEffect, useMemo, useState} from 'react';
import {useCurrentFrame} from '../use-current-frame.js';
import {useDelayRender} from '../use-delay-render.js';
import type {EffectsProp} from './effect-types.js';
import {runEffectChain} from './run-effect-chain.js';
import {useEffectChainState} from './use-effect-chain-state.js';

export type SolidProps = {
	readonly color: string;
	readonly width: number;
	readonly height: number;
	readonly _experimentalEffects?: EffectsProp;
	readonly className?: string;
	readonly style?: React.CSSProperties;
	readonly pixelRatio?: number;
};

export const Solid: React.FC<SolidProps> = ({
	color,
	width,
	height,
	_experimentalEffects: experimentalEffects = [],
	className,
	style,
	pixelRatio = 1,
}) => {
	const frame = useCurrentFrame();
	const {delayRender, continueRender, cancelRender} = useDelayRender();

	const [outputCanvas, setOutputCanvas] = useState<HTMLCanvasElement | null>(
		null,
	);

	const sourceCanvas = useMemo(() => {
		if (typeof document === 'undefined') {
			return null;
		}

		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;
		return canvas;
	}, []);

	const chainState = useEffectChainState();

	// Fill source and run effect chain on every frame / color change.
	useEffect(() => {
		if (!outputCanvas || !sourceCanvas) {
			return;
		}

		const handle = delayRender(`Solid effect chain (frame ${frame})`);

		if (!chainState) {
			continueRender(handle);
			return () => {
				continueRender(handle);
			};
		}

		const ctx = sourceCanvas.getContext('2d', {colorSpace: 'srgb'});
		if (!ctx) {
			cancelRender(
				new Error('Failed to acquire 2D context for <Solid> source'),
			);
			return;
		}

		ctx.fillStyle = color;
		ctx.fillRect(0, 0, 1, 1);

		runEffectChain({
			state: chainState.get(width, height)!,
			source: sourceCanvas,
			effects: experimentalEffects,
			output: outputCanvas,
			frame,
			width,
			height,
		})
			.then((completed) => {
				if (completed) {
					continueRender(handle);
				}
			})
			.catch((err) => {
				cancelRender(err);
			});

		return () => {
			continueRender(handle);
		};
	}, [
		frame,
		color,
		experimentalEffects,
		outputCanvas,
		sourceCanvas,
		chainState,
		width,
		height,
		pixelRatio,
		delayRender,
		continueRender,
		cancelRender,
	]);

	return (
		<canvas
			ref={setOutputCanvas}
			width={width}
			height={height}
			className={className}
			style={style}
		/>
	);
};
