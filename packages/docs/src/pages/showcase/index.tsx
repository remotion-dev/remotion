import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {VideoPlayer} from '../../components/VideoPlayer';
import {VideoPreview} from '../../components/VideoPreview';
import type {ShowcaseVideo} from '../../data/showcase-videos';
import {
	showcaseVideos,
	shuffledShowcaseVideos,
} from '../../data/showcase-videos';
import styles from './styles.module.css';

const PageHeader: React.FC = () => {
	return (
		<header className={styles.hero}>
			<div className={styles.container}>
				<h1 className={styles.title}>Showcase</h1>
				<p className={styles.lede}>
					Products, campaigns, launch videos, tutorials and creative tools made
					with Remotion. Scan the gallery by use case, then open any card to
					watch the motion in detail.
				</p>
				<p className={styles.note}>
					Curated by Remotion. We are not taking new showcase submissions right
					now. For more projects, applications, examples and libraries, browse
					the <a href="/docs/resources">Resources</a> page.
				</p>
			</div>
		</header>
	);
};

const Showcase = () => {
	const [userHasInteractedWithPage, setUserHasInteractedWithPage] =
		useState(false);
	const [video, setVideo] = useState<ShowcaseVideo | null>(() => {
		if (typeof window === 'undefined') {
			return null;
		}

		if (!window.location.hash) {
			return null;
		}

		return (
			showcaseVideos.find(
				(v) => v.muxId === window.location.hash.replace('#', ''),
			) ?? null
		);
	});

	const currentIndex = useMemo(() => {
		if (video === null) {
			return -1;
		}

		return showcaseVideos.findIndex((v) => v.muxId === video.muxId);
	}, [video]);

	useEffect(() => {
		if (video) {
			window.location.hash = video.muxId;
		} else if (window.location.href.includes('#')) {
			window.history.replaceState(
				{},
				document.title,
				window.location.href.substr(0, window.location.href.indexOf('#')),
			);
		}
	}, [video]);

	const hasNext = currentIndex < showcaseVideos.length - 1;
	const hasPrevious = currentIndex > 0;

	const goToNextVideo = useCallback(() => {
		if (!hasNext) {
			return;
		}

		setVideo(showcaseVideos[currentIndex + 1]);
		setUserHasInteractedWithPage(true);
	}, [currentIndex, hasNext]);

	const goToPreviousVideo = useCallback(() => {
		if (!hasPrevious) {
			return;
		}

		setVideo(showcaseVideos[currentIndex - 1]);
		setUserHasInteractedWithPage(true);
	}, [currentIndex, hasPrevious]);

	const dismiss = useCallback(() => {
		setVideo(null);
	}, []);

	return (
		<Layout>
			<Head>
				<title>Showcase</title>
				<meta name="og:image" content="/img/showcase.png" />
				<meta name="twitter:image" content="/img/showcase.png" />
				<meta property="og:image" content="/img/showcase.png" />
				<meta property="twitter:image" content="/img/showcase.png" />
			</Head>
			<div>
				<PageHeader />
				<VideoPlayer
					hasNext={hasNext}
					hasPrevious={hasPrevious}
					toNext={goToNextVideo}
					toPrevious={goToPreviousVideo}
					dismiss={dismiss}
					video={video}
					userHasInteractedWithPage={userHasInteractedWithPage}
				/>
				<main>
					<section className={styles.gallerySection}>
						<div className={styles.container}>
							<div className={styles.videosMasonry}>
								{shuffledShowcaseVideos.map((vid) => {
									return (
										<div key={vid.muxId} className={styles.videosMasonryItem}>
											<VideoPreview
												onClick={() => {
													setVideo(vid);
													setUserHasInteractedWithPage(true);
												}}
												{...vid}
											/>
										</div>
									);
								})}
							</div>
						</div>
					</section>
				</main>
			</div>
		</Layout>
	);
};

export default Showcase;
