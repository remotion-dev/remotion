import React, {useEffect, useRef, useState} from 'react';

import {MuxVideo} from '../../src/components/MuxVideo';
import {BlueButton} from '../layout/Button';
import styles from './VideoAppsShowcase.module.css';

const tabs = [
	'Captions',
	'Screencast',
	'Music visualization',
	'Year in review',
];

const videoApps = [
	{
		title: 'Submagic',
		description:
			'A video editor for creating short-form content fast. Designed for creators, teams and agencies.',
		additionalInfo:
			'Accelerates video editing with AI-powered features such as descriptions, zooms, sound effects and music.',
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
		additionalInfo: 'Various templates optimized for sharing on social media.',
		link: 'https://www.remotion.pro/recorder',
		videoWidth: 1080,
		videoHeight: 1080,
		muxId: 'pHlwqDZFUH00Aubo9M001ty3gZ6YW8z689XTd9R479ayE',
		thumbnailSrc: '/img/homepage-showcase/remotion-recorder-thumbnail.png',
		buttonText: 'More infos',
	},
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

const AUDIO_VOLUME = 0.05; // Adjust this value between 0 and 1 as needed

const VideoAppsShowcase: React.FC = () => {
	const [activeTab, setActiveTab] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		// Generate a random index when the component mounts
		const randomIndex = Math.floor(Math.random() * tabs.length);
		setActiveTab(randomIndex);
	}, []); // Empty dependency array ensures this runs only once on mount

	const handlePlayPause = () => {
		if (videoRef.current) {
			if (videoRef.current.paused) {
				videoRef.current.volume = AUDIO_VOLUME;
				videoRef.current.play();
				setIsPlaying(true);
			} else {
				videoRef.current.pause();
				setIsPlaying(false);
			}
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.titleContainer}>
				<h2 className={styles.title}>
					Create not just videos.
					<br />
					Create <span className={styles.highlight}>video apps.</span>
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
							style={{
								aspectRatio: `${videoApps[activeTab].videoWidth} / ${videoApps[activeTab].videoHeight}`,
							}}
							className={styles.video}
							poster={videoApps[activeTab].thumbnailSrc}
							loop
							playsInline
						/>
						{!isPlaying && (
							<div className={styles.playButton}>
								<span>▶</span>
							</div>
						)}
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
