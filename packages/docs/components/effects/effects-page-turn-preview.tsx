import {pageTurn, type PageTurnRender} from '@remotion/effects/page-turn';
import {Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	CanvasImage,
	Easing,
	HtmlInCanvas,
	Interactive,
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

const PageTurnSceneInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<AbsoluteFill
				showInTimeline={false}
				style={{justifyContent: 'center', padding: 90}}
			>
				<Interactive.Div
					name="Next chapter label"
					style={{
						fontSize: 22,
						letterSpacing: 5,
						marginBottom: 32,
						color: '#f7f3eb',
						fontFamily: 'Arial, Helvetica, sans-serif',
					}}
				>
					CHAPTER TWO
				</Interactive.Div>
				<Interactive.Div
					name="Next chapter title"
					style={{
						fontSize: 112,
						fontWeight: 700,
						lineHeight: 0.95,
						whiteSpace: 'pre-line',
						color: '#f7f3eb',
						fontFamily: 'Arial, Helvetica, sans-serif',
					}}
				>
					{'A fresh\nperspective.'}
				</Interactive.Div>
			</AbsoluteFill>
			<HtmlInCanvas
				name="Turning page"
				width={1280}
				height={720}
				effects={[
					pageTurn({
						foldPosition: interpolate(
							frame,
							[20, 82.5, 145],
							[
								[1.4, 0.5],
								[0.45, 0.5],
								[-0.5, 0.5],
							],
							{
								easing: [Easing.cubic, Easing.out(Easing.cubic)],
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
						foldDirection: -75,
						foldRadius: 85,
						paperColor: '#f7f3eb',
						backPageOpacity: 0.12,
					}),
				]}
			>
				<AbsoluteFill
					showInTimeline={false}
					style={{backgroundColor: '#f7f3eb', padding: 90}}
				>
					<div style={{display: 'flex', justifyContent: 'space-between'}}>
						<Interactive.Span
							name="Front chapter label"
							style={{
								fontSize: 22,
								letterSpacing: 4,
								color: '#182033',
								fontFamily: 'Arial, Helvetica, sans-serif',
							}}
						>
							CHAPTER ONE
						</Interactive.Span>
						<Interactive.Span
							name="Page number"
							style={{
								fontSize: 22,
								letterSpacing: 4,
								color: '#182033',
								fontFamily: 'Arial, Helvetica, sans-serif',
							}}
						>
							01 / 02
						</Interactive.Span>
					</div>
					<Interactive.Div
						name="Front page title"
						style={{
							fontSize: 130,
							fontWeight: 700,
							lineHeight: 0.9,
							letterSpacing: -6,
							marginTop: 95,
							whiteSpace: 'pre-line',
							color: '#182033',
							fontFamily: 'Arial, Helvetica, sans-serif',
						}}
					>
						{'Turn\nthe page.'}
					</Interactive.Div>
					<Interactive.Div
						name="Front page footer"
						style={{
							marginTop: 'auto',
							borderTop: '2px solid #182033',
							paddingTop: 24,
							fontSize: 24,
							color: '#182033',
							fontFamily: 'Arial, Helvetica, sans-serif',
						}}
					>
						Every ending is a new beginning.
					</Interactive.Div>
				</AbsoluteFill>
			</HtmlInCanvas>
		</>
	);
};

export const PageTurnScene = Interactive.create({
	Component: PageTurnSceneInner,
	componentName: '<PageTurnScene>',
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});

export const PageTurnDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch('webgpu');
	if (branch === 'pending') return null;
	if (branch === 'live') {
		return (
			<PageTurnScene name="Page turn" style={{backgroundColor: '#182033'}} />
		);
	}

	return (
		<Video
			name="Page turn preview"
			muted
			src="https://remotion.media/page-turn-demo-1025fe4ae350.mp4"
			style={{width: '100%', height: '100%'}}
		/>
	);
};
