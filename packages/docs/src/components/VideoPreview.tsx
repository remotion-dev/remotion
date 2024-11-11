import clsx from 'clsx';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {ShowcaseVideo} from '../data/showcase-videos';

const videoStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	padding: '2rem 0',
	width: '100%',
};

const videoTitle: React.CSSProperties = {
	marginTop: '1rem',
	textAlign: 'center',
	alignSelf: 'center',
	padding: '10px',
};

const videoDescription: React.CSSProperties = {
	textAlign: 'center',
	padding: '10px',
};

const padding: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
};

const containerTitleDescription: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	textAlign: 'center',
};

export const VideoPreview: React.FC<
	ShowcaseVideo & {
		readonly title: string;
		readonly description: React.ReactNode;
		readonly onClick: () => void;
	}
> = ({title, description, onClick, muxId, width, height, time}) => {
	const [hover, setHover] = useState(false);

	const container = useRef<HTMLAnchorElement>(null);

	const animated = `https://image.mux.com/${muxId}/animated.gif?width=600`;
	const thumbnail = `https://image.mux.com/${muxId}/thumbnail.png?width=600&time=${time}`;

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

	const a: React.CSSProperties = useMemo(() => {
		return {
			color: 'inherit',
			cursor: 'pointer',
			margin: 'auto',
			display: 'block',
			flex: 1,
		};
	}, []);

	const style = useMemo(() => {
		return {
			width: '100%',
			aspectRatio: `${width} / ${height}`,
			backgroundImage: `url(${hover ? animated : thumbnail})`,
			backgroundSize: 'cover',
			backgroundPosition: '50% 50%',
		};
	}, [width, height, hover, animated, thumbnail]);

	const placeholder: React.CSSProperties = useMemo(() => {
		return {
			backgroundColor: 'rgba(0, 0, 0, 0.05)',
			aspectRatio: `${width} / ${height}`,
		};
	}, [height, width]);

	const frameStyle: React.CSSProperties = {
		border: '2px solid var(--border-color)',
		borderRadius: 5,
		backgroundColor: 'var(--ifm-background-color)',
		overflow: 'hidden',
	};

	return (
		<a
			ref={container}
			style={{...a, ...frameStyle}}
			className={clsx(videoStyle)}
			onClick={onClick}
		>
			<div style={placeholder}>
				<div style={style} />
			</div>
			<div style={{...padding, ...containerTitleDescription}}>
				<h3 style={videoTitle}>{title}</h3>
				<p style={videoDescription}>{description}</p>
			</div>
		</a>
	);
};
