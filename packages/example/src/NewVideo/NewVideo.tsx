import {experimental_Video as NewVideo} from '@remotion/media';
import {AbsoluteFill, staticFile} from 'remotion';

export const NewVideoExample: React.FC = () => {
	return (
		<>
			<AbsoluteFill>
				<div
					style={{
						position: 'absolute',
						fontSize: 70,
						fontWeight: 900,
						left: 20,
						height: 'fit-content',
						bottom: 20,
						color: 'white',
					}}
				>
					<h1
						style={{
							textShadow: '0px 5px 10px black',
						}}
					>
						No Flickering
					</h1>
				</div>
				<NewVideo src={staticFile('demo_smpte_h264_pcm.mkv')} />
			</AbsoluteFill>
		</>
	);
};
