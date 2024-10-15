import React, {useEffect, useRef, useState} from 'react';

import {MuxVideo} from '../../src/components/MuxVideo';
import {BlueButton} from '../layout/Button';
import styles from './VideoAppsShowcase.module.css';

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
		muxId: 'riYdneJ2zu1Vqiayoe1qAZXcSIRq0201tHgSBbh9JbtlU',
		thumbnailSrc: '/img/homepage-showcase/banger-show-thumbnail.png',
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
		thumbnailSrc: '/img/homepage-showcase/submagic-thumbnail.png',
		buttonText: 'Submagic website',
	},
	{
		title: 'Remotion Recorder',
		description:
			'The Remotion Recorder is a video production tool built entirely in JavaScript. Create high-quality videos that feel native on each platform while only editing them once.',

		link: 'https://www.remotion.pro/recorder',
		videoWidth: 1080,
		videoHeight: 1080,
		muxId: 'pHlwqDZFUH00Aubo9M001ty3gZ6YW8z689XTd9R479ayE',
		thumbnailSrc: '/img/homepage-showcase/remotion-recorder-thumbnail.png',
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
		thumbnailSrc: '/img/homepage-showcase/GHU-thumbnail.png',
		buttonText: 'GitHub Unwrapped website',
	},
];

// const AUDIO_VOLUME = 0.05; // Adjust this value between 0 and 1 as needed

const VideoAppsShowcase: React.FC = () => {
	const [activeTab, setActiveTab] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(true);
	const videoRef = useRef<HTMLVideoElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setActiveTab(0); // Set to 0 for "Music visualization"

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					if (videoRef.current && videoRef.current.paused) {
						videoRef.current.muted = true; // Ensure video is muted before autoplay
						setIsMuted(true); // Update state to reflect muted status
						videoRef.current
							.play()
							.then(() => {
								setIsPlaying(true);
							})
							.catch((error) => {
								console.error('Playback error:', error);
								setIsPlaying(false);
							});
					}
				} else if (videoRef.current && !videoRef.current.paused) {
					videoRef.current.pause();
					setIsPlaying(false);
				}
			},
			{threshold: 0.5},
		);

		const currentContainer = containerRef.current;
		if (currentContainer) {
			observer.observe(currentContainer);
		}

		return () => {
			if (currentContainer) {
				observer.unobserve(currentContainer);
			}
		};
	}, []);

	useEffect(() => {
		setIsPlaying(false);
		const video = videoRef.current;
		if (video) {
			video.pause();
			video.currentTime = 0;
			video.load();

			// Check if the video is visible and play it if it is
			const observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						// Introduce a delay before playing the video
						setTimeout(() => {
							if (video) {
								video.muted = true; // Ensure video is muted before autoplay
								setIsMuted(true); // Update state to reflect muted status
								video
									.play()
									.then(() => {
										setIsPlaying(true);
									})
									.catch((error) => {
										console.error('Playback error:', error);
										setIsPlaying(false);
									});
							}
						}, 750); // 750ms (0.75 second) delay, adjust as needed
					}
				},
				{threshold: 0.5},
			);

			observer.observe(video);

			return () => {
				observer.disconnect();
				video.muted = false; // Unmute the video when it's no longer visible
				if (video) {
					video.pause();
					video.currentTime = 0;
					video.load();
				}
			};
		}
	}, [activeTab]);

	const handlePlayPause = () => {
		if (videoRef.current) {
			if (videoRef.current.paused) {
				const playPromise = videoRef.current.play();

				if (playPromise !== undefined) {
					playPromise
						.then(() => {
							// Playback started successfully
							setIsPlaying(true);
						})
						.catch((error) => {
							// Auto-play was prevented or there was an error
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
		<div ref={containerRef} className={styles.container}>
			<div className={styles.titleContainer}>
				<h2 className={styles.title}>
					Video apps created with{' '}
					<span className={styles.highlight}>Remotion</span>
				</h2>
			</div>
			<div className={styles.tabs}>
				{tabs.map((tab, index) => (
					<button
						key={tab}
						type="button"
						className={`${styles.tab} ${index === activeTab ? styles.activeTab : ''}`}
						onClick={() => setActiveTab(index)}
					>
						{tab}
					</button>
				))}
			</div>
			<div className={styles.content}>
				<div className={styles.videoWrapper}>
					<div className={styles.videoContainer} onClick={handlePlayPause}>
						<MuxVideo
							ref={videoRef}
							muxId={videoApps[activeTab].muxId}
							className={styles.video}
							poster={videoApps[activeTab].thumbnailSrc}
							loop
							playsInline
							muted={isMuted}
						/>
						{!isPlaying && (
							<div className={styles.playButton}>
								<span>▶</span>
							</div>
						)}
						<button
							type="button"
							className={styles.muteButton}
							onClick={(e) => {
								e.stopPropagation();
								handleMuteToggle();
							}}
						>
							{isMuted ? '🔇' : '🔊'}
						</button>
					</div>
				</div>
				<div className={styles.textContent}>
					<h1>{videoApps[activeTab].title}</h1>
					<p>{videoApps[activeTab].description}</p>
					<p>{videoApps[activeTab].additionalInfo}</p>
					<a
						target="_blank"
						href={videoApps[activeTab].link}
						style={{textDecoration: 'none'}}
					>
						<BlueButton loading={false} fullWidth={false} size="sm">
							{videoApps[activeTab].buttonText}
						</BlueButton>
					</a>
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
					For more examples see our <a href="../showcase">showcase page</a>.
				</div>
			</div>
		</div>
	);
};

export default VideoAppsShowcase;
