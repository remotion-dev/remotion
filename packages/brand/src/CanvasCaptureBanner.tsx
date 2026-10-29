import {Video} from '@remotion/media';
import {AbsoluteFill, Interactive, staticFile} from 'remotion';

export const CanvasCaptureBannerOneX = ({
	source,
	trimBefore,
}: {
	readonly source: string;
	readonly trimBefore: number;
}) => {
	return (
		<Video
			src={source.startsWith('http') ? source : staticFile(source)}
			trimBefore={trimBefore}
			muted
			style={{width: 616, height: 718}}
		/>
	);
};

export const CanvasCaptureBanner = ({
	oneXSource,
}: {
	readonly oneXSource: string;
}) => {
	return (
		<AbsoluteFill style={{backgroundColor: '#1f2429'}}>
			<AbsoluteFill
				name="1× recompressed recording"
				style={{
					left: 0,
					top: 0,
					width: 480,
					height: 540,
					overflow: 'hidden',
				}}
			>
				<Video
					src={
						oneXSource.startsWith('http') ? oneXSource : staticFile(oneXSource)
					}
					muted
					style={{
						position: 'absolute',
						left: -1660,
						top: -1205,
						width: 3084,
						height: 3588,
						rotate: '0.904608 0.351506 -0.241096 27.995464deg',
						scale: 1,
						transformOrigin: '1960px 1575px',
					}}
				/>
			</AbsoluteFill>
			<AbsoluteFill
				name="5× original recording"
				style={{
					left: 480,
					top: 0,
					width: 480,
					height: 540,
					overflow: 'hidden',
				}}
			>
				<Video
					src="https://remotion.media/canvas-capture/render-modal-codec-2026-09-21.webm"
					trimBefore={585}
					muted
					style={{
						position: 'absolute',
						left: -1660,
						top: -1205,
						width: 3084,
						height: 3588,
						rotate: '0.904608 0.351506 -0.241096 27.995464deg',
						scale: 1,
						transformOrigin: '1960px 1575px',
					}}
				/>
			</AbsoluteFill>
			<Interactive.Div
				name="Divider"
				style={{
					position: 'absolute',
					left: 479,
					top: 0,
					bottom: 0,
					width: 2,
					backgroundColor: '#7b858e',
				}}
			/>
		</AbsoluteFill>
	);
};
