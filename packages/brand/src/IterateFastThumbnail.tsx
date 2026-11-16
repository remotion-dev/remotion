import {colorCorrection} from '@remotion/effects/color-correction';
import {
	AbsoluteFill,
	CanvasImage,
	Interactive,
	Sequence,
	staticFile,
	useVideoConfig,
} from 'remotion';
import {TimelineRightTrimComposition} from './TimelineRightTrimComposition';

export const IterateFastThumbnail = () => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Sequence
				name="Live Studio source"
				from={-(153 / 30) * fps}
				width={1920}
				height={1080}
				style={{
					left: 0,
					top: 0,
					transformOrigin: 'top left',
					scale: 1.261,
					translate: '42px -146.5px',
				}}
			>
				<TimelineRightTrimComposition
					name="Right trim source"
					style={{backgroundColor: '#1c1e23', overflow: 'hidden'}}
				/>
			</Sequence>
			<Interactive.Div
				name="Studio background fade"
				style={{
					position: 'absolute',
					inset: 0,
					background:
						'linear-gradient(90deg, #1f2427 0%, #1f2427 8%, rgba(31, 36, 39, 0.96) 18%, rgba(31, 36, 39, 0.84) 30%, rgba(31, 36, 39, 0.65) 42%, rgba(31, 36, 39, 0.42) 54%, rgba(31, 36, 39, 0.2) 66%, rgba(31, 36, 39, 0.05) 78%, rgba(31, 36, 39, 0) 90%)',
				}}
			/>
			<Interactive.Div
				name="Calm portrait and work status"
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1920,
					height: 1080,
				}}
			>
				<CanvasImage
					name="Calm portrait"
					src={staticFile('iterate-fast-portraits/calm-here26-34.90-clean.png')}
					fit="contain"
					width={1182}
					height={1063}
					effects={[
						colorCorrection({
							exposure: -0.12,
							temperature: -0.06,
							tint: -0.02,
							highlights: -0.08,
							contrast: 1.03,
							saturation: 0.93,
						}),
					]}
					style={{position: 'absolute', top: 17, width: 1182, height: 1063}}
				/>
				<Interactive.Div
					name="Worked for 5m 40s"
					style={{
						position: 'absolute',
						left: 40,
						top: 761,
						width: 1220,
						boxSizing: 'border-box',
						padding: '48px',
						paddingLeft: 80,
						backgroundColor: '#212121',
						borderRadius: 28,
						boxShadow: '0 24px 128px 24px rgba(0, 0, 0, 0.5)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'flex-start',
						gap: 44,
						fontFamily: 'Arial, Helvetica, sans-serif',
						fontSize: 100,
						lineHeight: '120px',
						fontWeight: 500,
						color: '#7c7c7c',
						translate: '136.6px 25.7px',
						scale: 1.12,
					}}
				>
					<span>Worked for 5m 40s</span>
					<svg width="54" height="90" viewBox="0 0 18 30" fill="none">
						<path
							d="m4 5 10 10L4 25"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</Interactive.Div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
