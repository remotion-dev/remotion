import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';

export const PREMIUM_VERSION_DURATION_IN_FRAMES = 36;

const REMOTION_LOGO_PATH =
	'M87.6061 0.0346985C79.1878 0.491638 72.4039 1.82733 65.5673 4.42841C62.1578 5.71136 56.569 8.5058 53.4934 10.439C40.6286 18.5059 30.8219 30.6325 25.7076 44.7451C24.6882 47.5395 21.929 56.4499 20.1539 62.5835C8.32607 103.586 1.61249 148.419 0.171355 195.871C-0.0571182 203.428 -0.0571182 221.425 0.171355 228.859C1.13797 260.318 4.14327 288.719 9.59146 317.682C11.8059 329.405 15.356 345.152 17.4123 352.305C21.6126 366.839 30.1892 379.212 42.3861 388.28C50.5584 394.361 59.8379 398.438 70.1192 400.442C75.0753 401.409 81.6131 401.848 86.4286 401.532C93.0895 401.092 106.306 399.317 117.044 397.402C165.445 388.772 210.155 373.324 250.701 351.215C276.377 337.208 298.328 322.041 319.506 303.64C340.613 285.327 358.61 265.626 374.445 243.516C378.118 238.402 379.963 235.414 381.809 231.653C386.554 221.952 388.786 212.304 388.768 201.513C388.768 191.46 386.87 182.532 382.775 173.393C380.807 168.982 378.926 165.818 374.708 159.807C359.172 137.681 341.931 118.401 320.912 99.6664C288.328 70.6328 249.628 46.8189 206.412 29.1913C197.045 25.3776 187.818 22.0208 176.711 18.3828C153.195 10.7026 124.091 4.04178 99.4691 0.720123C95.6027 0.192871 90.3478 -0.105896 87.6061 0.0346985Z';

const TIERS = [
	{label: 'Remotion', rings: 3},
	{label: 'Remotion Plus', rings: 4},
	{label: 'Remotion Max', rings: 5},
] as const;

const INNER_RING_WIDTH = 118;
const RING_WIDTH_STEP = 48;
const LOGO_SLOT_WIDTH =
	INNER_RING_WIDTH + (TIERS[TIERS.length - 1].rings - 1) * RING_WIDTH_STEP;

const RingLogo: React.FC<{rings: number; rowIndex: number}> = ({
	rings,
	rowIndex,
}) => {
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				height: LOGO_SLOT_WIDTH * (402 / 389),
				position: 'relative',
				width: LOGO_SLOT_WIDTH,
			}}
		>
			{Array.from({length: rings}, (_, ringIndex) => {
				const ringWidth = INNER_RING_WIDTH + ringIndex * RING_WIDTH_STEP;
				const ringHeight = ringWidth * (402 / 389);

				return (
					<svg
						key={ringIndex}
						viewBox="0 0 389 402"
						style={{
							height: ringHeight,
							left: '50%',
							opacity: interpolate(
								frame,
								[
									rowIndex * 5 + ringIndex * 2,
									rowIndex * 5 + ringIndex * 2 + 5,
								],
								[0, 1],
								{
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
							position: 'absolute',
							top: '50%',
							translate: '-50% -50%',
							width: ringWidth,
						}}
					>
						<path
							d={REMOTION_LOGO_PATH}
							fill="none"
							stroke="#0B84F3"
							strokeWidth={3}
							vectorEffect="non-scaling-stroke"
						/>
					</svg>
				);
			})}
		</div>
	);
};

const TierRow: React.FC<{index: number; label: string; rings: number}> = ({
	index,
	label,
	rings,
}) => {
	const frame = useCurrentFrame();
	const startFrame = index * 5;

	return (
		<Interactive.Div
			name={`${label} — ${rings} rings`}
			style={{
				alignItems: 'center',
				display: 'flex',
				gap: 48,
				height: 294,
				opacity: interpolate(
					frame,
					[startFrame, startFrame + 6, 31, 35],
					[0, 1, 1, 0],
					{
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				translate: interpolate(
					frame,
					[startFrame, startFrame + 8],
					['-60px 0px', '0px 0px'],
					{
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
			}}
		>
			<RingLogo rings={rings} rowIndex={index} />
			<div
				style={{
					color: '#ffffff',
					fontFamily: 'Arial Black, Arial, sans-serif',
					fontSize: 42,
					fontWeight: 900,
					letterSpacing: -1.8,
					lineHeight: 1,
					textAlign: 'left',
					textTransform: 'uppercase',
					width: 500,
				}}
			>
				{label}
			</div>
		</Interactive.Div>
	);
};

export const PremiumVersion: React.FC = () => {
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 8,
					left: 92,
					position: 'absolute',
					top: 42,
				}}
			>
				{TIERS.map((tier, index) => (
					<TierRow
						key={tier.label}
						index={index}
						label={tier.label}
						rings={tier.rings}
					/>
				))}
			</div>
		</AbsoluteFill>
	);
};
