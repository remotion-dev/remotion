import {useColorMode} from '@docusaurus/theme-common';
import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AbsoluteFill} from 'remotion';
import {Spacer} from './layout/Spacer';

export const SingleVideoDemo: React.FC<{
	readonly dark: string;
	readonly light: string;
}> = ({dark, light}) => {
	const {colorMode} = useColorMode();

	const container = useRef<HTMLDivElement>(null);
	const ref1 = useRef<HTMLVideoElement>(null);

	const style: React.CSSProperties = useMemo(
		() => ({
			display: 'flex',
		}),
		[],
	);

	const videoContainer: React.CSSProperties = useMemo(() => {
		return {
			border:
				'1px solid ' +
				(colorMode === 'dark'
					? 'var(--ifm-color-emphasis-200)'
					: 'var(--ifm-color-emphasis-300)'),
			flex: 1,
			display: 'block',
			overflow: 'hidden',
			borderRadius: 'var(--ifm-code-border-radius)',
		};
	}, [colorMode]);

	useEffect(() => {
		ref1.current?.addEventListener(
			'canplay',
			() => {
				ref1.current?.play();
			},
			{
				once: true,
			},
		);
	}, [colorMode]);

	return (
		<div ref={container} style={style}>
			<div style={videoContainer}>
				<video
					ref={ref1}
					preload="metadata"
					src={colorMode === 'dark' ? dark : light}
					muted
					loop
					playsInline
				/>
			</div>
		</div>
	);
};

export const DualVideoDemo: React.FC<{
	readonly leftDark: string;
	readonly leftLight: string;
	readonly rightDark: string;
	readonly rightLight: string;
}> = ({leftDark, leftLight, rightDark, rightLight}) => {
	const {colorMode} = useColorMode();
	const [played, setPlayed] = useState(false);

	const container = useRef<HTMLDivElement>(null);
	const ref1 = useRef<HTMLVideoElement>(null);
	const ref2 = useRef<HTMLVideoElement>(null);

	const size = PlayerInternals.useElementSize(container, {
		triggerOnWindowResize: false,
		shouldApplyCssTransforms: true,
	});

	const mobile = (size?.width ?? 0) < 700;

	const style: React.CSSProperties = useMemo(
		() => ({
			display: 'flex',
			flexDirection: mobile ? 'column' : 'row',
		}),
		[mobile],
	);

	const videoContainer: React.CSSProperties = useMemo(() => {
		return {
			border:
				'1px solid ' +
				(colorMode === 'dark'
					? 'transparent'
					: 'var(--ifm-color-emphasis-300)'),
			flex: mobile ? 0 : 1,
			display: 'block',
			overflow: 'hidden',
			borderRadius: 'var(--ifm-code-border-radius)',
			aspectRatio: '16/9',
			position: 'relative',
		};
	}, [colorMode, mobile]);

	const playAll = useCallback(() => {
		ref1.current?.play();
		ref2.current?.play();
		setPlayed(true);
	}, []);

	useEffect(() => {
		Promise.all([
			new Promise<void>((resolve) => {
				ref1.current?.addEventListener('canplay', () => resolve(), {
					once: true,
				});
			}),
			new Promise<void>((resolve) => {
				ref2.current?.addEventListener('canplay', () => resolve(), {
					once: true,
				});
			}),
		]).then(() => {
			playAll();
		});
	}, [colorMode, playAll]);

	return (
		<div ref={container} style={style}>
			<div style={videoContainer}>
				<AbsoluteFill>
					<video
						ref={ref1}
						preload="metadata"
						src={colorMode === 'dark' ? leftDark : leftLight}
						muted
						loop
						playsInline
					/>
				</AbsoluteFill>
				<AbsoluteFill>
					<button
						type="button"
						style={{
							width: 36,
							height: 36,
							bottom: 6,
							left: 6,
							position: 'absolute',
							appearance: 'none',
							border: '1px solid rgba(255, 255, 255, 0.1)',
							outline: '1px solid rgba(0, 0, 0, 0.1)',
							borderRadius: 4,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							cursor: 'pointer',
							backgroundColor: 'transparent',
							pointerEvents: played ? 'none' : 'auto',
							opacity: played ? 0 : 1,
							transition: 'opacity 0.2s',
						}}
						onClick={playAll}
					>
						<svg
							style={{
								height: 24,
							}}
							viewBox="0 0 384 512"
						>
							<path
								fill="currentColor"
								d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
							/>
						</svg>
					</button>
				</AbsoluteFill>
			</div>
			<Spacer />
			<Spacer />
			<div style={videoContainer}>
				<video
					ref={ref2}
					preload="metadata"
					src={colorMode === 'dark' ? rightDark : rightLight}
					muted
					loop
					playsInline
				/>
			</div>
		</div>
	);
};

export const AnimatingProperties: React.FC = () => {
	return (
		<div>
			<DualVideoDemo
				leftDark="/img/animating-properties-left-dark.mp4"
				leftLight="/img/animating-properties-left-light.mp4"
				rightDark="/img/animating-properties-right-dark.mp4"
				rightLight="/img/animating-properties-right-light.mp4"
			/>
		</div>
	);
};

export const Springs: React.FC = () => {
	return (
		<div>
			<DualVideoDemo
				leftDark="/img/spring-left-dark.mp4"
				leftLight="/img/spring-left-light.mp4"
				rightDark="/img/spring-right-dark.mp4"
				rightLight="/img/spring-right-light.mp4"
			/>
		</div>
	);
};

export const Transforms: React.FC = () => {
	return (
		<div>
			<SingleVideoDemo
				dark="/img/transforms-dark.mp4"
				light="/img/transforms-light.mp4"
			/>
		</div>
	);
};
