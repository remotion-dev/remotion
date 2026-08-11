import {Video} from '@remotion/media';
import {Sequence, Series, Solid, staticFile} from 'remotion';

export const Issue8216 = () => {
	return (
		<>
			<Sequence name="Default absolute-fill layout">
				<div />
			</Sequence>
			<Series name="Default none layout">
				<Series.Sequence name="Series item" durationInFrames={90}>
					<div />
				</Series.Sequence>
			</Series>
			<Video name="Default premount" src={staticFile('vp8-vorbis.webm')} />
			<Solid
				name="Foreground"
				width={200}
				height={200}
				color="#0b84ff"
				style={{
					position: 'absolute',
					translate: '172.4px 83.1px',
				}}
			/>
			<Solid
				name="Background"
				width={1280}
				height={720}
				color="#ffffff"
				style={{
					position: 'absolute',
					translate: '0.2px 0px',
				}}
			/>
		</>
	);
};
