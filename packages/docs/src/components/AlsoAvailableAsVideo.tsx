import BrowserOnly from '@docusaurus/BrowserOnly';
import React, {useCallback} from 'react';
import {VideoPlayerWithControls} from './VideoPlayerWithControls';

const link: React.CSSProperties = {
	color: 'inherit',
	all: 'unset',
	display: 'block',
	cursor: 'pointer',
	width: '100%',
};

const container: React.CSSProperties = {
	background: 'var(--ifm-color-emphasis-100)',
	borderRadius: 10,
	overflow: 'hidden',
	marginBottom: 30,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const right: React.CSSProperties = {
	padding: 16,
	lineHeight: 1.5,
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	justifyContent: 'center',
};

const icon: React.CSSProperties = {
	height: 40,
	marginLeft: 20,
};

const wouldYouRather: React.CSSProperties = {
	fontSize: '.9em',
};

export const AlsoAvailableAsVideo: React.FC<{
	readonly minutes: number;
	readonly playbackId: string;
	readonly title: string;
	readonly thumb: string;
}> = ({minutes, title, thumb, playbackId}) => {
	const [showVideo, setShowVideo] = React.useState(false);

	const onClick = useCallback(() => {
		setShowVideo(true);
	}, []);

	if (showVideo) {
		return (
			<div style={{marginBottom: 30}}>
				<BrowserOnly>
					{() => (
						<VideoPlayerWithControls
							playbackId={playbackId}
							poster={thumb}
							onError={(error) => {
								console.log(error);
							}}
							onLoaded={() => undefined}
							onSize={() => undefined}
							autoPlay
						/>
					)}
				</BrowserOnly>
			</div>
		);
	}

	return (
		<button type="button" style={link} onClick={onClick}>
			<div style={container}>
				<svg
					style={icon}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 512 512"
				>
					<path
						fill="currentcolor"
						d="M512 256c0 141.4-114.6 256-256 256S0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"
					/>
				</svg>
				<div style={right}>
					<div style={wouldYouRather}>
						Also available as a {minutes}min video
					</div>
					<div>
						<strong>{title}</strong>
					</div>
				</div>
			</div>
		</button>
	);
};
