import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {ShowcaseVideo} from '../data/showcase-videos';

const card: React.CSSProperties = {
	backgroundColor: 'var(--card-bg)',
	border: '2px solid var(--border-color)',
	borderRadius: 18,
	color: 'var(--text-color)',
	cursor: 'pointer',
	display: 'flex',
	flexDirection: 'column',
	overflow: 'hidden',
	textAlign: 'left',
	textDecoration: 'none',
	width: '100%',
};

const content: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	gap: 10,
	padding: 20,
};

const videoTitle: React.CSSProperties = {
	fontSize: '1.25rem',
	fontWeight: 650,
	letterSpacing: '-0.02em',
	margin: 0,
};

const videoDescription: React.CSSProperties = {
	color: 'var(--subtitle)',
	fontSize: '1rem',
	lineHeight: 1.6,
	margin: 0,
};

export const VideoPreview: React.FC<
	ShowcaseVideo & {
		readonly title: string;
		readonly description: React.ReactNode;
		readonly onClick: () => void;
	}
> = ({title, description, onClick, muxId, width, height, time}) => {
	const [hover, setHover] = useState(false);
	const [animatedLoaded, setAnimatedLoaded] = useState(false);
	const container = useRef<HTMLAnchorElement>(null);

	const animated = `https://image.mux.com/${muxId}/animated.gif?width=600`;
	const thumbnail = `https://image.mux.com/${muxId}/thumbnail.png?width=600&time=${time ?? 0}`;

	useEffect(() => {
		setAnimatedLoaded(false);

		const image = new Image();
		image.onload = () => {
			setAnimatedLoaded(true);
		};

		image.src = animated;

		return () => {
			image.onload = null;
		};
	}, [animated]);

	useEffect(() => {
		const {current} = container;
		if (!current) {
			return;
		}

		const onPointerEnter = () => {
			setHover(true);
		};

		const onPointerLeave = () => {
			setHover(false);
		};

		current.addEventListener('pointerenter', onPointerEnter);
		current.addEventListener('pointerleave', onPointerLeave);

		return () => {
			current.removeEventListener('pointerenter', onPointerEnter);
			current.removeEventListener('pointerleave', onPointerLeave);
		};
	}, []);

	const previewStyle: React.CSSProperties = useMemo(() => {
		return {
			backgroundImage: `url(${hover && animatedLoaded ? animated : thumbnail})`,
			backgroundPosition: '50% 50%',
			backgroundSize: 'cover',
			height: '100%',
			width: '100%',
		};
	}, [hover, animatedLoaded, animated, thumbnail]);

	const placeholder: React.CSSProperties = {
		backgroundColor: 'rgba(0, 0, 0, 0.05)',
		aspectRatio: `${width} / ${height}`,
		overflow: 'hidden',
		width: '100%',
	};

	return (
		<a ref={container} style={card} onClick={onClick}>
			<div style={placeholder}>
				<div style={previewStyle} />
			</div>
			<div style={content}>
				<h3 style={videoTitle}>{title}</h3>
				<p style={videoDescription}>{description}</p>
			</div>
		</a>
	);
};
