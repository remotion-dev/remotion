import {
	AbsoluteFill,
	type InteractiveTransformProps,
	CanvasImage,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const AirportLayoutContent = ({style}: InteractiveTransformProps) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={style}>
			<CanvasImage
				name="Grass, terminal and control tower"
				src={
					'https://remotion.media/jonnys-videos/plane-sight/airport/airport-terrain-v2.png'
				}
				premountFor={fps}
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					imageRendering: 'pixelated',
				}}
			/>
			<Interactive.Svg
				name="Runway and angled taxiways"
				viewBox="0 0 1280 720"
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					shapeRendering: 'crispEdges',
				}}
			>
				<path
					data-name="Taxiway shoulders"
					d="M 38 210 H 1220 M 38 550 H 1220 M 250 210 Q 262 210 271 219 L 414 362 Q 432 380 458 380 M 590 210 Q 602 210 611 219 L 754 362 Q 772 380 798 380 M 1060 210 Q 1072 210 1081 229 L 1160 360 Q 1167 380 1178 380 M 250 550 Q 262 550 271 541 L 414 398 Q 432 380 458 380 M 590 550 Q 602 550 611 541 L 754 398 Q 772 380 798 380 M 950 550 Q 962 550 971 541 L 1114 398 Q 1132 380 1158 380"
					fill="none"
					stroke="#3c5146"
					strokeWidth={58}
					strokeLinejoin="round"
				/>
				<path
					data-name="Taxiway paving"
					d="M 38 210 H 1220 M 38 550 H 1220 M 250 210 Q 262 210 271 219 L 414 362 Q 432 380 458 380 M 590 210 Q 602 210 611 219 L 754 362 Q 772 380 798 380 M 1060 210 Q 1072 210 1081 229 L 1160 360 Q 1167 380 1178 380 M 250 550 Q 262 550 271 541 L 414 398 Q 432 380 458 380 M 590 550 Q 602 550 611 541 L 754 398 Q 772 380 798 380 M 950 550 Q 962 550 971 541 L 1114 398 Q 1132 380 1158 380"
					fill="none"
					stroke="#68766e"
					strokeWidth={48}
					strokeLinejoin="round"
				/>
				<Interactive.Path
					name="Runway pavement"
					d="M 20 336 H 1260 V 424 H 20 Z"
					fill="#37434a"
					stroke="#263b35"
					strokeWidth={6}
				/>
				<Interactive.Path
					name="Runway edge paint"
					d="M 24 342 H 1256 M 24 418 H 1256"
					fill="none"
					stroke="#8c9992"
					strokeWidth={2}
				/>
				<Interactive.Path
					name="Runway centerline"
					d="M 105 380 H 1175"
					fill="none"
					stroke="#f2f0df"
					strokeWidth={5}
					strokeDasharray="29 27"
				/>
				<Interactive.Path
					name="Runway thresholds"
					d="M 34 346 V 414 M 48 346 V 414 M 62 346 V 414 M 76 346 V 414 M 1204 346 V 414 M 1218 346 V 414 M 1232 346 V 414 M 1246 346 V 414"
					fill="none"
					stroke="#f2f0df"
					strokeWidth={7}
				/>
				<Interactive.Path
					name="North taxiway centerline"
					d="M 38 210 H 1220"
					fill="none"
					stroke="#e8c466"
					strokeWidth={2}
				/>
				<Interactive.Path
					name="South taxiway centerline"
					d="M 38 550 H 1220"
					fill="none"
					stroke="#e8c466"
					strokeWidth={2}
				/>
				<Interactive.Path
					name="North west angled entry"
					d="M 250 210 Q 262 210 271 219 L 414 362 Q 432 380 458 380"
					fill="none"
					stroke="#e8c466"
					strokeWidth={2}
				/>
				<Interactive.Path
					name="North central angled entry"
					d="M 590 210 Q 602 210 611 219 L 754 362 Q 772 380 798 380"
					fill="none"
					stroke="#e8c466"
					strokeWidth={2}
				/>
				<Interactive.Path
					name="North east angled entry"
					d="M 1060 210 Q 1072 210 1081 229 L 1160 360 Q 1167 380 1178 380"
					fill="none"
					stroke="#e8c466"
					strokeWidth={2}
				/>
				<Interactive.Path
					name="South west angled entry"
					d="M 250 550 Q 262 550 271 541 L 414 398 Q 432 380 458 380"
					fill="none"
					stroke="#e8c466"
					strokeWidth={2}
				/>
				<Interactive.Path
					name="South central angled entry"
					d="M 590 550 Q 602 550 611 541 L 754 398 Q 772 380 798 380"
					fill="none"
					stroke="#e8c466"
					strokeWidth={2}
				/>
				<Interactive.Path
					name="South east angled entry"
					d="M 950 550 Q 962 550 971 541 L 1114 398 Q 1132 380 1158 380"
					fill="none"
					stroke="#e8c466"
					strokeWidth={2}
				/>
				<Interactive.Path
					name="Angled hold lines"
					d="M 350 324 L 376 298 M 690 324 L 716 298 M 1110 319 L 1144 299 M 350 436 L 376 462 M 690 436 L 716 462 M 1050 436 L 1076 462"
					fill="none"
					stroke="#f2cc69"
					strokeWidth={6}
					strokeDasharray="4 3"
				/>
				<Interactive.Path
					name="Urgent aircraft priority route"
					d="M 250 550 Q 262 550 271 541 L 414 398 Q 432 380 458 380 H 1130"
					fill="none"
					stroke="#ffb73b"
					strokeWidth={5}
					strokeDasharray="10 8"
					style={{
						opacity: interpolate(
							frame,
							[4.8 * fps, 5.3 * fps, 11.8 * fps, 12.5 * fps],
							[0, 1, 1, 0],
							{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
						),
					}}
				/>
			</Interactive.Svg>
		</AbsoluteFill>
	);
};

export const AirportLayout = Interactive.create({
	Component: AirportLayoutContent,
	componentName: 'AirportLayout',
});
