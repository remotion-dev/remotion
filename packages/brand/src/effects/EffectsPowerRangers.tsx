import {Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {
	Img,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const HtmlHelmet = ({cockpit}: {readonly cockpit: boolean}) => {
	const frame = useCurrentFrame();

	return (
		<Img
			name="HTML5 over the Red Ranger"
			alt="HTML5 logo by W3C"
			src={staticFile('effects-promo-2026-11-27/html5.svg')}
			style={{
				position: 'absolute',
				width: cockpit ? 206 : 270,
				height: cockpit ? 206 : 270,
				left: cockpit ? -103 : -135,
				top: cockpit ? -116 : -150,
				translate: cockpit
					? interpolate(
							frame,
							[0, 4, 8, 12, 15, 17, 20],
							[
								'480px 350px',
								'494px 380px',
								'501px 393px',
								'500px 404px',
								'503px 393px',
								'505px 360px',
								'505px 339px',
							],
							{extrapolateRight: 'clamp'},
						)
					: interpolate(
							frame,
							[0, 6, 14, 16, 19, 21, 24, 26, 28, 29, 32, 35, 37],
							[
								'509px 164px',
								'505px 156px',
								'500px 162px',
								'516px 174px',
								'532px 206px',
								'525px 225px',
								'497px 237px',
								'452px 259px',
								'395px 293px',
								'395px 293px',
								'315px 321px',
								'281px 333px',
								'274px 330px',
							],
							{extrapolateRight: 'clamp'},
						),
			}}
		/>
	);
};

const WebGpuHelmet = ({cockpit}: {readonly cockpit: boolean}) => {
	const frame = useCurrentFrame();

	return (
		<Img
			name="WebGPU over the Blue Ranger"
			alt="WebGPU logo by W3C"
			src={staticFile('effects-promo-2026-11-27/webgpu.svg')}
			style={{
				position: 'absolute',
				width: cockpit ? 216 : 306,
				height: cockpit ? 216 : 306,
				left: cockpit ? -94 : -133,
				top: cockpit ? -80 : -113,
				translate: cockpit
					? interpolate(
							frame,
							[0, 4, 8, 12, 14, 16, 18, 20],
							[
								'129px 373px',
								'156px 369px',
								'167px 368px',
								'179px 396px',
								'169px 398px',
								'149px 388px',
								'138px 357px',
								'132px 352px',
							],
							{extrapolateRight: 'clamp'},
						)
					: interpolate(
							frame,
							[0, 4, 8, 12, 16, 19, 22, 24, 25, 26, 28, 30, 32, 38],
							[
								'511px 187px',
								'519px 201px',
								'530px 202px',
								'549px 198px',
								'580px 187px',
								'611px 195px',
								'615px 222px',
								'605px 263px',
								'593px 296px',
								'593px 296px',
								'582px 344px',
								'578px 386px',
								'574px 407px',
								'558px 389px',
							],
							{extrapolateRight: 'clamp'},
						),
			}}
		/>
	);
};

export const EffectsPowerRangers = () => {
	const {width, height} = useVideoConfig();
	const scale = Math.max(width / 1080, height / 810);
	const cropLeft = (1080 - width / scale) * 0.45;

	return (
		<TransitionSeries
			name="Power Rangers ending"
			width={1080}
			height={810}
			style={{left: -cropLeft * scale, scale, transformOrigin: 'top left'}}
		>
			<TransitionSeries.Sequence name="HTML" durationInFrames={38}>
				<Video
					name="Red Ranger pose"
					src="https://remotion.media/effects-promo-2026-11-27/power-rangers/red-c89bb67ab852.mp4"
					muted
				/>
				<HtmlHelmet cockpit={false} />
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence name="WebGPU" durationInFrames={39}>
				<Video
					name="Blue Ranger pose"
					src="https://remotion.media/effects-promo-2026-11-27/power-rangers/blue-9067a926ddd0.mp4"
					muted
				/>
				<WebGpuHelmet cockpit={false} />
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="Together in the cockpit"
				style={{left: cropLeft}}
				durationInFrames={21}
				playbackRate={0.875}
			>
				<Video
					name="Rangers at the controls"
					src="https://remotion.media/effects-promo-2026-11-27/power-rangers/cockpit-16418a048f1a.mp4"
					muted
				/>
				<HtmlHelmet cockpit />
				<WebGpuHelmet cockpit />
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="Megazord assembles"
				durationInFrames={126}
				playbackRate={1.68}
			>
				<Video
					name="Dinozords lock together"
					src="https://remotion.media/effects-promo-2026-11-27/power-rangers/megazord-ffd65d486661.mp4"
					muted
				/>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				name="Best of both worlds"
				durationInFrames={50}
			>
				<Video
					name="Megazord reveal"
					src="https://remotion.media/effects-promo-2026-11-27/power-rangers/megazord-ffd65d486661.mp4"
					trimBefore={126}
					muted
				/>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
