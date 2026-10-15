import {
	AbsoluteFill,
	type InteractiveTransformProps,
	CanvasImage,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {AirportAircraft} from './AirportAircraft';
import {AirportLayout} from './AirportLayout';

const AirportTraffic = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<>
			<AirportLayout name="Airport with north and south angled taxiways" />
			<AirportAircraft
				name="Cloud Code — urgent priority"
				airline="Cloud Code"
				airframe="narrowbody"
				status={
					frame < 5 * fps
						? 'Needs your input'
						: frame < 11.5 * fps
							? 'Build failed · urgent'
							: frame < 20 * fps
								? 'Moved to front'
								: frame < 21.8 * fps
									? 'Taking off'
									: frame < 40 * fps
										? 'In flight'
										: frame < 40.8 * fps
											? 'On approach'
											: frame < 43.4 * fps
												? 'Landed · slowing'
												: frame < 45.4 * fps
													? 'Taxiing in'
													: 'Ready for review'
				}
				priority={frame >= 5 * fps && frame < 21.8 * fps}
				labelPosition={
					frame >= 8.7 * fps && frame < 11.5 * fps
						? 'left'
						: frame < 40 * fps
							? 'below'
							: 'above'
				}
				altitude={interpolate(
					frame,
					[20.8 * fps, 21.8 * fps, 40 * fps, 40.8 * fps, 41.1 * fps],
					[0, 1, 1, 0.2, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
				width={192}
				height={332}
				heading={interpolate(
					frame,
					[
						0 * fps,
						5 * fps,
						5.8 * fps,
						8 * fps,
						8.7 * fps,
						21.8 * fps,
						40 * fps,
						43.4 * fps,
						43.9 * fps,
						45 * fps,
						45.2 * fps,
					],
					[90, 90, 45, 45, 90, 90, 270, 270, 315, 315, 270],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
				style={{
					position: 'absolute',
					overflow: 'visible',
					left: -96,
					top: -164,
					translate: interpolate(
						frame,
						[
							0 * fps,
							5 * fps,
							5.4 * fps,
							5.8 * fps,
							8 * fps,
							8.3 * fps,
							8.5 * fps,
							8.7 * fps,
							11.5 * fps,
							20 * fps,
							20.8 * fps,
							21.3 * fps,
							21.8 * fps,
							40 * fps,
							40.8 * fps,
							43.4 * fps,
							43.5 * fps,
							43.7 * fps,
							43.9 * fps,
							45 * fps,
							45.2 * fps,
							45.4 * fps,
						],
						[
							'250px 550px',
							'250px 550px',
							'258px 548px',
							'271px 541px',
							'414px 398px',
							'431px 386px',
							'446px 381px',
							'458px 380px',
							'1130px 380px',
							'1130px 380px',
							'1210px 380px',
							'1330px 380px',
							'1450px 380px',
							'1480px 380px',
							'1210px 380px',
							'458px 380px',
							'446px 379px',
							'431px 374px',
							'414px 362px',
							'271px 219px',
							'250px 210px',
							'250px 210px',
						],
						{
							easing: Easing.linear,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			/>
			<AirportAircraft
				name="OpenAir — yields and rejoins"
				airline="OpenAir"
				airframe="widebody"
				status={
					frame < 5 * fps
						? 'Next for review'
						: frame < 11.5 * fps
							? 'Yielding · urgent first'
							: frame < 15.3 * fps
								? 'Rejoining queue'
								: frame < 22.5 * fps
									? 'Next after urgent'
									: frame < 25 * fps
										? 'Taking off'
										: frame < 44 * fps
											? 'In flight'
											: frame < 44.8 * fps
												? 'On approach'
												: frame < 47.4 * fps
													? 'Landed · slowing'
													: frame < 49.4 * fps
														? 'Taxiing in'
														: 'Ready for review'
				}
				priority={false}
				labelPosition={frame < 44 * fps ? 'above' : 'below'}
				altitude={interpolate(
					frame,
					[24 * fps, 25 * fps, 44 * fps, 44.8 * fps, 45.1 * fps],
					[0, 1, 1, 0.2, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
				width={192}
				height={332}
				heading={interpolate(
					frame,
					[
						0 * fps,
						2.5 * fps,
						3.1 * fps,
						14 * fps,
						14.7 * fps,
						25 * fps,
						44 * fps,
						47.4 * fps,
						47.9 * fps,
						49 * fps,
						49.2 * fps,
					],
					[90, 90, 135, 135, 90, 90, 270, 270, 225, 225, 270],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
				style={{
					position: 'absolute',
					left: -96,
					top: -164,
					translate: interpolate(
						frame,
						[
							0 * fps,
							2.5 * fps,
							3.1 * fps,
							11.5 * fps,
							12 * fps,
							14 * fps,
							14.3 * fps,
							14.5 * fps,
							14.7 * fps,
							15.3 * fps,
							22.5 * fps,
							24 * fps,
							24.5 * fps,
							25 * fps,
							44 * fps,
							44.8 * fps,
							47.4 * fps,
							47.5 * fps,
							47.7 * fps,
							47.9 * fps,
							49 * fps,
							49.2 * fps,
							49.4 * fps,
						],
						[
							'540px 210px',
							'590px 210px',
							'611px 219px',
							'611px 219px',
							'650px 258px',
							'754px 362px',
							'771px 374px',
							'786px 379px',
							'798px 380px',
							'880px 380px',
							'880px 380px',
							'1210px 380px',
							'1330px 380px',
							'1450px 380px',
							'1480px 380px',
							'1210px 380px',
							'458px 380px',
							'446px 381px',
							'431px 386px',
							'414px 398px',
							'271px 541px',
							'250px 550px',
							'250px 550px',
						],
						{
							easing: Easing.linear,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			/>
			<AirportAircraft
				name="Cloud Code — moves into the reordered queue"
				airline="Cloud Code"
				airframe="widebody"
				status={
					frame < 13.5 * fps
						? 'Tests passed · queued'
						: frame < 18.5 * fps
							? 'Queue reshuffled'
							: frame < 25.5 * fps
								? 'Ready for takeoff'
								: frame < 28.3 * fps
									? 'Taking off'
									: frame < 48 * fps
										? 'In flight'
										: frame < 48.8 * fps
											? 'On approach'
											: frame < 50.5 * fps
												? 'Landed · slowing'
												: frame < 52.5 * fps
													? 'Taxiing in'
													: 'Ready for review'
				}
				priority={false}
				labelPosition="above"
				altitude={interpolate(
					frame,
					[27.3 * fps, 28.3 * fps, 48 * fps, 48.8 * fps, 49.1 * fps],
					[0, 1, 1, 0.2, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
				width={192}
				height={332}
				heading={interpolate(
					frame,
					[
						0 * fps,
						13.5 * fps,
						14.1 * fps,
						16.5 * fps,
						17.2 * fps,
						28.3 * fps,
						48 * fps,
						50.5 * fps,
						51 * fps,
						52.1 * fps,
						52.3 * fps,
					],
					[90, 90, 135, 135, 90, 90, 270, 270, 315, 315, 270],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
				style={{
					position: 'absolute',
					left: -96,
					top: -164,
					translate: interpolate(
						frame,
						[
							0 * fps,
							13.5 * fps,
							14.1 * fps,
							16.5 * fps,
							16.8 * fps,
							17 * fps,
							17.2 * fps,
							18.5 * fps,
							25.5 * fps,
							27.3 * fps,
							27.8 * fps,
							28.3 * fps,
							48 * fps,
							48.8 * fps,
							50.5 * fps,
							50.6 * fps,
							50.8 * fps,
							51 * fps,
							52.1 * fps,
							52.3 * fps,
							52.5 * fps,
						],
						[
							'250px 210px',
							'250px 210px',
							'271px 219px',
							'414px 362px',
							'431px 374px',
							'446px 379px',
							'458px 380px',
							'640px 380px',
							'640px 380px',
							'1210px 380px',
							'1330px 380px',
							'1450px 380px',
							'1480px 380px',
							'1210px 380px',
							'798px 380px',
							'786px 379px',
							'771px 374px',
							'754px 362px',
							'611px 219px',
							'590px 210px',
							'590px 210px',
						],
						{
							easing: Easing.linear,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			/>
			<AirportAircraft
				name="OpenAir — build completes"
				airline="OpenAir"
				airframe="narrowbody"
				status={
					frame < 24 * fps
						? 'Waiting on build'
						: frame < 27 * fps
							? 'Build passed · ready'
							: frame < 30.2 * fps
								? 'Joining the runway'
								: frame < 32.3 * fps
									? 'Taking off'
									: frame < 52 * fps
										? 'In flight'
										: frame < 52.8 * fps
											? 'On approach'
											: frame < 54.5 * fps
												? 'Landed · slowing'
												: frame < 56.5 * fps
													? 'Taxiing in'
													: 'Ready for review'
				}
				priority={false}
				labelPosition="below"
				altitude={interpolate(
					frame,
					[31.3 * fps, 32.3 * fps, 52 * fps, 52.8 * fps, 53.1 * fps],
					[0, 1, 1, 0.2, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
				width={192}
				height={332}
				heading={interpolate(
					frame,
					[
						0 * fps,
						27 * fps,
						27.5 * fps,
						29.2 * fps,
						29.8 * fps,
						32.3 * fps,
						52 * fps,
						54.5 * fps,
						55 * fps,
						56.1 * fps,
						56.3 * fps,
					],
					[90, 90, 45, 45, 90, 90, 270, 270, 225, 225, 270],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
				style={{
					position: 'absolute',
					left: -96,
					top: -164,
					translate: interpolate(
						frame,
						[
							0 * fps,
							27 * fps,
							27.5 * fps,
							29.2 * fps,
							29.4 * fps,
							29.6 * fps,
							29.8 * fps,
							30.5 * fps,
							31.3 * fps,
							31.8 * fps,
							32.3 * fps,
							52 * fps,
							52.8 * fps,
							54.5 * fps,
							54.6 * fps,
							54.8 * fps,
							55 * fps,
							56.1 * fps,
							56.3 * fps,
							56.5 * fps,
						],
						[
							'590px 550px',
							'590px 550px',
							'611px 541px',
							'754px 398px',
							'771px 386px',
							'786px 381px',
							'798px 380px',
							'1050px 380px',
							'1210px 380px',
							'1330px 380px',
							'1450px 380px',
							'1480px 380px',
							'1210px 380px',
							'798px 380px',
							'786px 381px',
							'771px 386px',
							'754px 398px',
							'611px 541px',
							'590px 550px',
							'590px 550px',
						],
						{
							easing: Easing.linear,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			/>
			<AirportAircraft
				name="Cloud Code — approval clears"
				airline="Cloud Code"
				airframe="widebody"
				status={
					frame < 30 * fps
						? 'Waiting on approval'
						: frame < 32 * fps
							? 'Approved · ready'
							: frame < 34.3 * fps
								? 'Joining the runway'
								: frame < 35.5 * fps
									? 'Taking off'
									: frame < 56 * fps
										? 'In flight'
										: frame < 56.8 * fps
											? 'On approach'
											: frame < 57.8 * fps
												? 'Landed · slowing'
												: frame < 59.8 * fps
													? 'Taxiing in'
													: 'Ready for review'
				}
				priority={false}
				labelPosition="above"
				altitude={interpolate(
					frame,
					[34.6 * fps, 35.5 * fps, 56 * fps, 56.8 * fps, 57.1 * fps],
					[0, 1, 1, 0.2, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
				width={192}
				height={332}
				heading={interpolate(
					frame,
					[
						0 * fps,
						32 * fps,
						32.5 * fps,
						33.9 * fps,
						34.3 * fps,
						35.5 * fps,
						56 * fps,
						57.8 * fps,
						58.3 * fps,
						59.4 * fps,
						59.6 * fps,
					],
					[90, 90, 149, 149, 90, 90, 270, 270, 329, 329, 270],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
				style={{
					position: 'absolute',
					left: -96,
					top: -164,
					translate: interpolate(
						frame,
						[
							0 * fps,
							32 * fps,
							32.5 * fps,
							33.9 * fps,
							34.1 * fps,
							34.3 * fps,
							34.6 * fps,
							35 * fps,
							35.5 * fps,
							56 * fps,
							56.8 * fps,
							57.8 * fps,
							57.9 * fps,
							58.1 * fps,
							58.3 * fps,
							59.4 * fps,
							59.6 * fps,
							59.8 * fps,
						],
						[
							'1060px 210px',
							'1060px 210px',
							'1081px 229px',
							'1160px 360px',
							'1167px 374px',
							'1178px 380px',
							'1220px 380px',
							'1330px 380px',
							'1450px 380px',
							'1480px 380px',
							'1210px 380px',
							'1178px 380px',
							'1172px 378px',
							'1165px 371px',
							'1160px 360px',
							'1081px 229px',
							'1060px 210px',
							'1060px 210px',
						],
						{
							easing: Easing.linear,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			/>
			<AirportAircraft
				name="OpenAir — dependency clears"
				airline="OpenAir"
				airframe="widebody"
				status={
					frame < 33.5 * fps
						? 'Waiting on dependency'
						: frame < 35 * fps
							? 'Dependency cleared'
							: frame < 37.5 * fps
								? 'Joining the runway'
								: frame < 38.9 * fps
									? 'Taking off'
									: frame < 60 * fps
										? 'In flight'
										: frame < 60.8 * fps
											? 'On approach'
											: frame < 61.8 * fps
												? 'Landed · slowing'
												: frame < 63.8 * fps
													? 'Taxiing in'
													: 'Ready for review'
				}
				priority={false}
				labelPosition="below"
				altitude={interpolate(
					frame,
					[38 * fps, 38.9 * fps, 60 * fps, 60.8 * fps, 61.1 * fps],
					[0, 1, 1, 0.2, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
				width={192}
				height={332}
				heading={interpolate(
					frame,
					[
						0 * fps,
						35 * fps,
						35.5 * fps,
						37 * fps,
						37.6 * fps,
						38.9 * fps,
						60 * fps,
						61.8 * fps,
						62.3 * fps,
						63.4 * fps,
						63.6 * fps,
					],
					[90, 90, 45, 45, 90, 90, 270, 270, 225, 225, 270],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
				style={{
					position: 'absolute',
					left: -96,
					top: -164,
					translate: interpolate(
						frame,
						[
							0 * fps,
							35 * fps,
							35.5 * fps,
							37 * fps,
							37.2 * fps,
							37.4 * fps,
							37.6 * fps,
							38 * fps,
							38.4 * fps,
							38.9 * fps,
							60 * fps,
							60.8 * fps,
							61.8 * fps,
							61.9 * fps,
							62.1 * fps,
							62.3 * fps,
							63.4 * fps,
							63.6 * fps,
							63.8 * fps,
						],
						[
							'950px 550px',
							'950px 550px',
							'971px 541px',
							'1114px 398px',
							'1131px 386px',
							'1146px 381px',
							'1158px 380px',
							'1220px 380px',
							'1330px 380px',
							'1450px 380px',
							'1480px 380px',
							'1210px 380px',
							'1158px 380px',
							'1146px 381px',
							'1131px 386px',
							'1114px 398px',
							'971px 541px',
							'950px 550px',
							'950px 550px',
						],
						{
							easing: Easing.linear,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			/>
		</>
	);
};

const PixelAirportContent = ({style}: InteractiveTransformProps) => {
	return (
		<AbsoluteFill style={style}>
			<Interactive.Div
				name="Airport backdrop"
				style={{position: 'absolute', inset: 0, backgroundColor: '#527347'}}
			/>
			<Interactive.Div
				name="Airfield below entrance sign"
				style={{
					position: 'absolute',
					left: 128,
					top: 144,
					width: 1280,
					height: 720,
					scale: 0.8,
					transformOrigin: '0 0',
				}}
			>
				<AirportTraffic />
			</Interactive.Div>
			<CanvasImage
				name="Agent Airport International — entrance sign"
				src={
					'https://remotion.media/jonnys-videos/plane-sight/branding/agent-airport-international.png'
				}
				style={{
					position: 'absolute',
					left: 360,
					top: -19,
					width: 560,
					height: 227,
					objectFit: 'contain',
					imageRendering: 'pixelated',
				}}
			/>
		</AbsoluteFill>
	);
};

export const PixelAirport = Interactive.create({
	Component: PixelAirportContent,
	componentName: 'PixelAirport',
});
