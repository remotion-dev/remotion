import React, {useRef, useState} from 'react';
import {
	IsMutedIcon,
	NotMutedIcon,
	PausedIcon,
	PlayingIcon,
} from '../homepage/Demo/icons';
import {MuxVideo} from '../homepage/MuxVideo';
import {SectionTitle} from '../homepage/VideoAppsTitle';

const videoApps = [
	{
		title: 'Banger.Show',
		description:
			'The all-in-one 3D visual creation tool for ambitious artists. Seamlessly craft visuals that match your sound and propel your brand forward.',
		link: 'https://banger.show?ref=remotion',
		videoWidth: 1080,
		videoHeight: 1080,
		muxId: 'Kg02XHfkR6x8400BtO4Ica54XlSPimmmTRpqDHHUaeACk',
		buttonText: 'Banger.Show website',
	},
	{
		title: 'Submagic',
		description:
			'A video editor for creating short-form content fast. Designed for creators, teams and agencies, it accelerates video editing with AI-powered features such as descriptions, zooms, sound effects and music.',
		additionalInfo: '',
		link: 'https://www.submagic.co/?ref=remotion',
		videoWidth: 540,
		videoHeight: 1080,
		muxId: 'pxqGEjlBBntnXrEe4v00pYUBw3FPgUPKumfhSym00Vs004',
		buttonText: 'Submagic website',
	},
	{
		title: 'Remotion Recorder',
		description:
			'The Remotion Recorder is a video production tool built entirely in JavaScript. Create high-quality videos that feel native on each platform while only editing them once.',
		link: 'https://www.remotion.dev/recorder',
		videoWidth: 1080,
		videoHeight: 1080,
		muxId: 'pHlwqDZFUH00Aubo9M001ty3gZ6YW8z689XTd9R479ayE',
		buttonText: 'More infos',
	},
	{
		title: 'GitHub Unwrapped',
		description:
			'Your coding year in review. Get a personalized video of your GitHub activity.',
		additionalInfo:
			'Uncover your go-to language, peak productivity hours, and track your GitHub impact – all in one video.',
		link: 'https://githubunwrapped.com/',
		videoWidth: 1080,
		videoHeight: 1080,
		muxId: 'OwQFvqomOR00q6yj5SWwaA7DBg01NaCPKcOvczoZqCty00',
		buttonText: 'GitHub Unwrapped website',
	},
];

const icon: React.CSSProperties = {
	height: 16,
	marginLeft: 10,
};

const Arrow: React.FC = () => (
	<svg style={icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M438.6 278.6l-160 160C272.4 444.9 264.2 448 256 448s-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L338.8 288H32C14.33 288 .0016 273.7 .0016 256S14.33 224 32 224h306.8l-105.4-105.4c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160C451.1 245.9 451.1 266.1 438.6 278.6z"
		/>
	</svg>
);

const ShowcaseItem: React.FC<{
	readonly videoApp: (typeof videoApps)[number];
}> = ({videoApp}) => {
	const [isMuted, setIsMuted] = useState(true);
	const [isPlaying, setIsPlaying] = useState(false);
	const [videoLoaded, setVideoLoaded] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	const handlePlayPause = () => {
		if (!videoLoaded) {
			setVideoLoaded(true);
			return;
		}

		if (videoRef.current) {
			if (videoRef.current.paused) {
				const playPromise = videoRef.current.play();

				if (playPromise !== undefined) {
					playPromise
						.then(() => {
							setIsPlaying(true);
						})
						.catch((error) => {
							// eslint-disable-next-line no-console
							console.error('Playback error:', error);
							setIsPlaying(false);
						});
				}
			} else {
				videoRef.current.pause();
				setIsPlaying(false);
			}
		}
	};

	const handleMuteToggle = () => {
		if (videoRef.current) {
			const newMutedState = !videoRef.current.muted;
			videoRef.current.muted = newMutedState;
			setIsMuted(newMutedState);
		}
	};

	return (
		<div
			className={'card flex p-0 overflow-hidden'}
			// Prevent this from showing up in search engine results
			data-nosnippet
		>
			<div className={'flex-1 grid grid-cols-1 min-[900px]:grid-cols-2'}>
				<div
					className={
						'w-full aspect-video min-[900px]:aspect-square relative overflow-hidden bg-[#eee] cursor-pointer'
					}
					onClick={handlePlayPause}
				>
					{videoLoaded ? (
						<MuxVideo
							ref={videoRef}
							muxId={videoApp.muxId}
							className={
								'absolute left-0 top-0 w-full h-full object-contain rounded-sm rounded-tr-none rounded-br-none'
							}
							loop
							playsInline
							muted={isMuted}
							autoPlay
							onPlay={() => setIsPlaying(true)}
							onPause={() => setIsPlaying(false)}
						/>
					) : (
						<img
							src={`https://image.mux.com/${videoApp.muxId}/thumbnail.png?time=1`}
							className={
								'absolute left-0 top-0 w-full h-full object-contain rounded-sm rounded-tr-none rounded-br-none'
							}
							alt={videoApp.title}
							loading="lazy"
						/>
					)}

					{/* Play/Pause Button - bottom left corner */}
					<button
						type="button"
						aria-label={`${isPlaying ? 'Pause' : 'Play'} ${videoApp.title}`}
						className={
							'absolute bottom-2.5 left-2.5 bg-white text-black rounded-full w-8 h-8 flex justify-center items-center text-base cursor-pointer transition-colors border-2 border-black border-solid'
						}
						onClick={(e) => {
							e.stopPropagation();
							handlePlayPause();
						}}
					>
						{isPlaying ? (
							<PlayingIcon
								style={{
									width: 12,
									height: 20,
									marginLeft: '2px',
									marginTop: '1px',
								}}
							/>
						) : (
							<PausedIcon
								style={{
									width: 14,
									height: 16,
									marginLeft: '2px',
									marginTop: '0.5px',
								}}
							/>
						)}
					</button>

					{/* Mute/Unmute Button - bottom right corner */}
					<button
						type="button"
						aria-label={`${isMuted ? 'Unmute' : 'Mute'} ${videoApp.title}`}
						className={
							'absolute bottom-2.5 right-2.5 bg-white text-black rounded-full w-8 h-8 flex justify-center items-center text-base cursor-pointer transition-colors border-2 border-black border-solid'
						}
						onClick={(e) => {
							e.stopPropagation();
							handleMuteToggle();
						}}
					>
						{isMuted ? (
							<IsMutedIcon
								style={{
									width: 16,
									height: 16,
									marginTop: '1px',
								}}
							/>
						) : (
							<NotMutedIcon
								style={{
									width: 16,
									height: 16,
									marginTop: '1px',
								}}
							/>
						)}
					</button>
				</div>
				<div
					className={
						'p-6 min-[900px]:p-10 flex min-w-0 flex-col justify-center'
					}
				>
					<div className="text-3xl font-bold fontbrand mt-0">
						{videoApp.title}
					</div>
					<div className="text-muted mt-3 text-base fontbrand leading-relaxed">
						{videoApp.description}
					</div>
					{videoApp.additionalInfo ? (
						<div className="text-muted mt-4 text-base fontbrand">
							{videoApp.additionalInfo}
						</div>
					) : null}
					<div className="h-5" />
					<a
						className="no-underline text-brand font-brand font-bold inline-flex flex-row items-center"
						href={videoApp.link}
					>
						{videoApp.buttonText}
						<Arrow />
					</a>
				</div>
			</div>
		</div>
	);
};

export const BuiltWithRemotionShowcase: React.FC = () => {
	return (
		<div>
			<SectionTitle>Built with Remotion</SectionTitle>
			<div className="mt-8 flex flex-col gap-8">
				{videoApps.map((videoApp) => (
					<ShowcaseItem key={videoApp.title} videoApp={videoApp} />
				))}
			</div>
			<div
				style={{
					marginTop: '1rem',
					justifyContent: 'center',
					display: 'flex',
				}}
			>
				<div
					style={{
						fontFamily: 'GTPlanar',
					}}
				>
					For more examples of products and workflows, see our{' '}
					<a href="/showcase" className="bluelink">
						Showcase page
					</a>
					.
				</div>
			</div>
		</div>
	);
};
