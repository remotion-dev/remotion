import type {FC} from 'react';
import {
	CanvasImage,
	Easing,
	Interactive,
	Sequence,
	interpolate,
	useCurrentFrame,
} from 'remotion';

type MapPinProps = {
	readonly imageSrc: string;
	readonly name: string;
};

export const MapPin: FC<MapPinProps> = ({imageSrc, name}) => {
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				height: 700,
				left: 0,
				position: 'absolute',
				top: 0,
				translate: '-50% -100%',
				width: 1080,
			}}
		>
			<Sequence
				name={name}
				style={{
					transformOrigin: '50% 100%',
					scale: interpolate(
						frame,
						[0, 9, 50, 73],
						[0, 1, 1.0000000000280422, 0.57],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
							easing: [
								Easing.spring({
									damping: 6,
									mass: 1,
									stiffness: 37,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
								Easing.linear,
								Easing.linear,
							],
						},
					),
					rotate: interpolate(frame, [0, 21], ['-116deg', '0deg'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [
							Easing.spring({
								damping: 6,
								mass: 1,
								stiffness: 37,
								allowTail: true,
								durationRestThreshold: 0.02,
								overshootClamping: false,
							}),
						],
					}),
					translate: '-0.4px -4.5px',
				}}
			>
				<Interactive.Svg
					name={`${name} shape`}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 384 512"
					style={{
						position: 'absolute',
						translate: '349.8px 89.5px',
						scale: 1.306,
						width: 384,
						height: 512,
						overflow: 'visible',
					}}
				>
					<path
						fill="#0B84F2"
						d="M192 0C86 0 0 84.4 0 188.6 0 307.9 120.2 450.9 170.4 505.4 182.2 518.2 201.8 518.2 213.6 505.4 263.8 450.9 384 307.9 384 188.6 384 84.4 298 0 192 0z"
					/>
				</Interactive.Svg>
				<CanvasImage
					name={`${name} image`}
					src={imageSrc}
					style={{
						position: 'absolute',
						width: 1080,
						height: 1080,
						scale: 0.371,
						borderRadius: '50%',
						translate: '1.8px -275.4px',
						borderWidth: 34,
						borderColor: '#ffffff',
					}}
				/>
			</Sequence>
		</div>
	);
};
