import React, {useEffect, useRef, useState} from 'react';

import {IsMutedIcon, NotMutedIcon, PausedIcon, PlayingIcon} from './Demo/icons';
import {MuxVideo} from './MuxVideo';
import {SectionTitle} from './VideoAppsTitle';

const tabs = [
	'Music visualization',
	'Captions',
	'Screencast',
	'Year in review',
];

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

const VideoAppsShowcase: React.FC = () => {
	const [activeTab, setActiveTab] = useState(0);
	const [isMuted, setIsMuted] = useState(true);
	const [isPlaying, setIsPlaying] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Remove the intersection observer autoplay logic
	useEffect(() => {
		const video = videoRef.current;
		if (video) {
			video.pause();
			setIsPlaying(false);
			video.currentTime = 0;
			video.load();
		}
	}, [activeTab]);

	const handlePlayPause = () => {
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
		<div ref={containerRef}>
			<SectionTitle>Use Cases</SectionTitle>
			<div
				className={
					'grid justify-center grid-flow-col grid-rows-1 gap-2.5 justify-self-center mb-4 w-[90vw] md:w-auto -mt-4'
				}
			>
				{tabs.map((tab, index) => (
					<button
						key={tab}
						type="button"
						data-active={index === activeTab}
						className={`bg-transparent border-none m-0 p-0 lg:mx-3 my-4 cursor-pointer text-base fontbrand font-bold transition-colors text-muted data-[active=true]:text-brand`}
						onClick={() => setActiveTab(index)}
					>
						{tab}
					</button>
				))}
			</div>
			<div className={'card flex p-0 overflow-hidden'}>
				<div className={'flex-1 flex flex-col lg:flex-row justify-center'}>
					<div
						className={
							'w-full max-w-[500px] aspect-square relative overflow-hidden bg-[#eee] cursor-pointer'
						}
						onClick={handlePlayPause}
					>
						<MuxVideo
							ref={videoRef}
							muxId={videoApps[activeTab].muxId}
							className={
								'absolute left-0 top-0 w-full h-full object-contain rounded-sm rounded-tr-none rounded-br-none'
							}
							loop
							playsInline
							muted={isMuted}
						/>

						{/* Play/Pause Button - bottom left corner */}
						<button
							type="button"
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
					<div className={'p-6 flex-1 flex flex-col h-full'}>
						<div className="text-4xl font-bold fontbrand mt-0">
							{videoApps[activeTab].title}
						</div>
						<div className="text-muted mt-4 text-base fontbrand">
							{videoApps[activeTab].description}
						</div>
						{videoApps[activeTab].additionalInfo ? (
							<div className="text-muted mt-4 text-base fontbrand">
								{videoApps[activeTab].additionalInfo}
							</div>
						) : null}
						<div className="h-5" />
						<a
							className="no-underline text-brand font-brand font-bold inline-flex flex-row items-center"
							href={videoApps[activeTab].link}
						>
							{videoApps[activeTab].buttonText}
							<svg
								style={icon}
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 448 512"
							>
								<path
									fill="currentColor"
									d="M438.6 278.6l-160 160C272.4 444.9 264.2 448 256 448s-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L338.8 288H32C14.33 288 .0016 273.7 .0016 256S14.33 224 32 224h306.8l-105.4-105.4c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160C451.1 245.9 451.1 266.1 438.6 278.6z"
								/>
							</svg>
						</a>
					</div>
				</div>
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
					For more examples see our{' '}
					<a href="/showcase" className="bluelink">
						Showcase page
					</a>
					.
				</div>
			</div>
		</div>
	);
};

export default VideoAppsShowcase;
