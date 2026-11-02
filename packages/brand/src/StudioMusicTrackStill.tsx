import {Img, Interactive, useVideoConfig} from 'remotion';

const StudioMusicTrackStillContent = () => {
	const {width, height} = useVideoConfig();

	return (
		<Img
			name="Music track - waveform and volume keyframes"
			src="https://remotion.media/studio-update/music-track-still-d4d1ddf4b582.png"
			style={{
				position: 'absolute',
				width: 2560,
				height: 1210,
				maxWidth: 'none',
				left: '50%',
				top: '50%',
				translate: '-1920px -875px',
				transformOrigin: '1920px 875px',
				scale: 2.4 * Math.min(width / 2560, height / 1600),
			}}
		/>
	);
};

export const StudioMusicTrackStill = Interactive.create({
	Component: StudioMusicTrackStillContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
