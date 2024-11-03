import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ShowcaseVideo} from '../data/showcase-videos';
import {useMobileLayout} from '../helpers/mobile-layout';
import {useElementSize} from '../helpers/use-el-size';
import {PausedIcon} from '../icons/arrows';
import {MuxVideo} from './MuxVideo';
import {Spinner} from './Spinner';
import {SHOWCASE_MOBILE_HEADER_HEIGHT} from './VideoPlayerHeader';
import {VideoSidebar} from './VideoSidebar';

const videoCss: React.CSSProperties = {
	marginBottom: 0,
	backgroundColor: 'var(--ifm-hero-background-color)',
};

const RESERVED_FOR_SIDEBAR = 300;

const sidebar: React.CSSProperties = {
	width: RESERVED_FOR_SIDEBAR,
};

const spinner: React.CSSProperties = {
	height: 16,
	width: 16,
};

const loadingContainer: React.CSSProperties = {
	position: 'absolute',
	justifyContent: 'center',
	alignItems: 'center',
	display: 'flex',
};

const pausedContainer: React.CSSProperties = {
	...loadingContainer,
	pointerEvents: 'none',
};

const pausedIconStyle: React.CSSProperties = {
	color: 'white',
	width: 50,
	filter: `drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))`,
};

export const PAGINATE_ICON_WIDTH = 24;
export const PAGINATE_ICON_PADDING = 20;
export const PAGINATE_BUTTONS_WIDTH =
	(PAGINATE_ICON_WIDTH + PAGINATE_ICON_PADDING * 2) * 2;

export const VideoPlayerContent: React.FC<{
	readonly video: ShowcaseVideo;
	readonly userHasInteractedWithPage: boolean;
}> = ({video, userHasInteractedWithPage}) => {
	const [loaded, setLoaded] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const container = useRef<HTMLDivElement>(null);

	const [paused, setPaused] = useState(!userHasInteractedWithPage);

	const containerSize = useElementSize(
		typeof document === 'undefined' ? null : document.body,
	);
	const mobileLayout = useMobileLayout();

	const possibleVideoWidth = mobileLayout
		? containerSize?.width
		: Math.min(containerSize?.width ?? 0, 1200) -
			(mobileLayout ? 0 : RESERVED_FOR_SIDEBAR) -
			(mobileLayout ? 0 : PAGINATE_BUTTONS_WIDTH);
	const containerHeight = mobileLayout
		? Infinity
		: Math.min(containerSize?.height ?? 0, 800);

	const heightRatio = (containerHeight ?? 0) / video.height;
	const widthRatio = (possibleVideoWidth ?? 0) / video.width;

	const ratio = Math.min(heightRatio, widthRatio);

	const height = ratio * video.height;
	const width = ratio * video.width;

	const onLoadedMetadata = useCallback(() => {
		setLoaded(true);
	}, []);

	const containerCss: React.CSSProperties = useMemo(() => {
		return {
			backgroundColor: 'var(--ifm-hero-background-color)',
			marginBottom: 0,
			display: 'flex',
			flexDirection: mobileLayout ? 'column' : 'row',
			height: mobileLayout ? '100%' : undefined,
			width: mobileLayout ? '100%' : undefined,
			position: mobileLayout ? 'absolute' : undefined,
			left: mobileLayout ? 0 : undefined,
			top: mobileLayout ? 0 : undefined,
			overflow: 'auto',
		};
	}, [mobileLayout]);

	const loadingStyle = useMemo(() => {
		return {
			...loadingContainer,
			height,
			width,
		};
	}, [height, width]);

	useEffect(() => {
		const {current} = videoRef;

		if (!current) {
			return;
		}

		const onClick = () => {
			if (videoRef.current?.paused) {
				videoRef.current?.play();
				setPaused(false);
			} else {
				videoRef.current?.pause();
				setPaused(true);
			}
		};

		current.addEventListener('click', onClick);
		return () => {
			current.removeEventListener('click', onClick);
		};
	}, []);

	const loadingContainerStyle: React.CSSProperties = useMemo(() => {
		return {
			...pausedContainer,
			height,
			width,
		};
	}, [height, width]);

	return (
		<div ref={container} style={containerCss}>
			{mobileLayout ? (
				<div style={{height: SHOWCASE_MOBILE_HEADER_HEIGHT}} />
			) : null}

			{loaded ? null : (
				<div style={loadingStyle}>
					<Spinner style={spinner} />
				</div>
			)}
			<MuxVideo
				ref={videoRef}
				muxId={video.muxId}
				style={videoCss}
				onLoadedMetadata={onLoadedMetadata}
				loop
				height={height}
				playsInline
				width={width}
				autoPlay={userHasInteractedWithPage}
			/>
			{paused ? (
				<div style={loadingContainerStyle}>
					<PausedIcon style={pausedIconStyle} />
				</div>
			) : null}

			<div style={sidebar}>
				<VideoSidebar video={video} />
			</div>
		</div>
	);
};
