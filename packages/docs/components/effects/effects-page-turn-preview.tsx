import {
	pageTurn,
	type PageTurnParams,
	type PageTurnRender,
} from '@remotion/effects/page-turn';
import {Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	CanvasImage,
	Easing,
	HtmlInCanvas,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {useHtmlInCanvasDocsDemoBranch} from '../demos/useHtmlInCanvasDocsDemoBranch';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsPageTurnPreview: React.FC<{
	readonly foldPosition: readonly [number, number];
	readonly foldDirection: number;
	readonly foldRadius: number;
	readonly lightDirection: number;
	readonly render: PageTurnRender;
	readonly backPageOpacity: number;
	readonly paperColor: string;
}> = (params) => {
	return (
		<AbsoluteFill style={{backgroundColor: '#182033'}}>
			<CanvasImage
				src={EFFECTS_PREVIEW_IMAGE_SRC}
				width={1280}
				height={720}
				fit="cover"
				effects={[pageTurn(params)]}
			/>
		</AbsoluteFill>
	);
};

export const PageTurnScene: React.FC = () => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [20, 145], [0, 1], {
		easing: Easing.inOut(Easing.cubic),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const params: PageTurnParams = {
		foldPosition: [interpolate(progress, [0, 1], [1.4, -0.5]), 0.5],
		foldDirection: -75,
		foldRadius: 85,
		paperColor: '#f7f3eb',
		backPageOpacity: 0.12,
	};
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#182033',
				color: '#f7f3eb',
				fontFamily: 'Arial, Helvetica, sans-serif',
			}}
		>
			<AbsoluteFill style={{justifyContent: 'center', padding: 90}}>
				<div style={{fontSize: 22, letterSpacing: 5, marginBottom: 32}}>
					CHAPTER TWO
				</div>
				<div style={{fontSize: 112, fontWeight: 700, lineHeight: 0.95}}>
					A fresh
					<br />
					perspective.
				</div>
			</AbsoluteFill>
			<HtmlInCanvas width={1280} height={720} effects={[pageTurn(params)]}>
				<AbsoluteFill
					style={{backgroundColor: '#f7f3eb', color: '#182033', padding: 90}}
				>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							fontSize: 22,
							letterSpacing: 4,
						}}
					>
						<span>CHAPTER ONE</span>
						<span>01 / 02</span>
					</div>
					<div
						style={{
							fontSize: 130,
							fontWeight: 700,
							lineHeight: 0.9,
							letterSpacing: -6,
							marginTop: 95,
						}}
					>
						Turn
						<br />
						the page.
					</div>
					<div
						style={{
							marginTop: 'auto',
							borderTop: '2px solid #182033',
							paddingTop: 24,
							fontSize: 24,
						}}
					>
						Every ending is a new beginning.
					</div>
				</AbsoluteFill>
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};

export const PageTurnDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch('webgpu');
	if (branch === 'pending') return null;
	if (branch === 'live') return <PageTurnScene />;
	return (
		<Video
			muted
			src="https://remotion.media/page-turn-demo-1025fe4ae350.mp4"
			style={{width: '100%', height: '100%'}}
		/>
	);
};
