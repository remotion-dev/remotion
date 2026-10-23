import React, {useEffect, useState} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {Internals} from 'remotion';

export const EffectHistogram: React.FC<{
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly effectIndex: number;
	readonly channel: 'rgb' | 'red' | 'green' | 'blue';
	readonly disabled: boolean;
	readonly multipleInstances: boolean;
	readonly height: number | string;
}> = ({
	nodePath,
	effectIndex,
	channel,
	disabled,
	multipleInstances,
	height,
}) => {
	const sequenceKey = Internals.makeSequencePropsSubscriptionKey(nodePath);
	const playing = Internals.usePlaying();
	const [histogram, setHistogram] = useState<{
		readonly path: string;
		readonly available: boolean;
	} | null>(null);

	useEffect(() => {
		setHistogram(null);
		if (disabled || multipleInstances) {
			return;
		}

		const canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 144;
		const context = canvas.getContext('2d', {willReadFrequently: true});
		if (!context) {
			setHistogram({path: '', available: false});
			return;
		}

		let lastSample = -Infinity;
		return Internals.subscribeToEffectSource({
			sequenceKey,
			effectIndex,
			onSource: (source) => {
				if (source === null) {
					lastSample = -Infinity;
					setHistogram(null);
					return;
				}

				const now = performance.now();
				if (playing && now - lastSample < 100) {
					return;
				}

				lastSample = now;
				try {
					context.clearRect(0, 0, canvas.width, canvas.height);
					context.drawImage(source, 0, 0, canvas.width, canvas.height);
					const {data} = context.getImageData(
						0,
						0,
						canvas.width,
						canvas.height,
					);
					const bins = new Uint32Array(256);
					let maximum = 0;
					for (let i = 0; i < data.length; i += 4) {
						if (data[i + 3] === 0) {
							continue;
						}

						const value =
							channel === 'red'
								? data[i]
								: channel === 'green'
									? data[i + 1]
									: channel === 'blue'
										? data[i + 2]
										: Math.round(
												data[i] * 0.2126 +
													data[i + 1] * 0.7152 +
													data[i + 2] * 0.0722,
											);
						bins[value]++;
						maximum = Math.max(maximum, bins[value]);
					}

					let path = '';
					for (let i = 0; i < bins.length; i++) {
						if (bins[i] === 0) {
							continue;
						}

						const barHeight = (bins[i] / maximum) * 78;
						path += `M${i} 80v-${barHeight.toFixed(2)}h1V80z`;
					}

					setHistogram({path, available: true});
				} catch {
					// Cross-origin or unavailable frames cannot be inspected.
					setHistogram({path: '', available: false});
				}
			},
		});
	}, [channel, disabled, effectIndex, multipleInstances, playing, sequenceKey]);

	const color =
		channel === 'red'
			? '#e65d5d'
			: channel === 'green'
				? '#65c77b'
				: channel === 'blue'
					? '#648ee8'
					: '#b6b6bd';
	const message = disabled
		? 'Effect is disabled'
		: multipleInstances
			? 'Histogram unavailable for repeated layers'
			: histogram === null
				? 'No input frame'
				: !histogram.available
					? 'Histogram unavailable'
					: null;

	return (
		<div
			style={{
				position: 'relative',
				height,
				backgroundColor: '#151519',
				border: '1px solid #45454b',
			}}
			title="Input histogram: pixels entering this effect"
		>
			<svg
				role="img"
				aria-label={`${channel === 'rgb' ? 'Luminance' : channel} input histogram`}
				viewBox="0 0 256 80"
				preserveAspectRatio="none"
				style={{display: 'block', width: '100%', height: '100%'}}
			>
				<path d="M64 0V80M128 0V80M192 0V80" stroke="#29292f" />
				{!message && histogram ? (
					<path d={histogram.path} fill={color} />
				) : null}
			</svg>
			{message ? (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 11,
						color: '#9b9ba2',
					}}
				>
					{message}
				</div>
			) : null}
		</div>
	);
};
