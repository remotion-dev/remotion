import type {Size} from '@remotion/player';
import React, {useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {ErrorLoader} from '../error-overlay/remotion-overlay/ErrorLoader';
import {BACKGROUND} from '../helpers/colors';
import {TimelineZoomCtx} from '../state/timeline-zoom';
import {Canvas} from './Canvas';
import {FramePersistor} from './FramePersistor';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {RefreshCompositionOverlay} from './RefreshCompositionOverlay';
import {
	RunningCalculateMetadata,
	loaderLabel,
} from './RunningCalculateMetadata';
import {getCurrentFrame} from './Timeline/imperative-state';
import {ensureFrameIsInViewport} from './Timeline/timeline-scroll-logic';
import {ZoomPersistor} from './ZoomPersistor';

const container: React.CSSProperties = {
	color: 'white',
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center',
	display: 'flex',
	backgroundColor: BACKGROUND,
	flexDirection: 'column',
};

export const CanvasOrLoading: React.FC<{
	readonly size: Size;
}> = ({size}) => {
	const resolved = Internals.useResolvedVideoConfig(null);
	const {setZoom} = useContext(TimelineZoomCtx);
	const {canvasContent} = useContext(Internals.CompositionManager);

	useEffect(() => {
		if (
			resolved?.type !== 'success' &&
			resolved?.type !== 'success-and-refreshing'
		) {
			return;
		}

		const c = resolved.result;

		setTimeout(() => {
			ensureFrameIsInViewport({
				direction: 'center',
				frame: getCurrentFrame(),
				durationInFrames: c.durationInFrames,
			});
		});
	}, [resolved, setZoom]);

	if (!canvasContent) {
		const compname = window.location.pathname.replace('/', '');

		return (
			<div style={container} className="css-reset">
				<div style={loaderLabel}>Composition with ID {compname} not found.</div>
			</div>
		);
	}

	const content = (
		<>
			<ZoomPersistor />
			<Canvas
				isRefreshing={resolved?.type === 'success-and-refreshing'}
				size={size}
				canvasContent={canvasContent}
			/>
			{resolved?.type === 'success-and-refreshing' ? (
				<RefreshCompositionOverlay />
			) : null}
		</>
	);
	if (canvasContent.type === 'asset' || canvasContent.type === 'output') {
		return content;
	}

	if (!resolved) {
		return null;
	}

	if (resolved.type === 'loading') {
		return (
			<div style={container} className="css-reset">
				<RunningCalculateMetadata />
			</div>
		);
	}

	if (resolved.type === 'error') {
		return <ErrorLoading error={resolved.error} />;
	}

	return (
		<>
			<FramePersistor /> {content}
		</>
	);
};

const loaderContainer: React.CSSProperties = {
	marginLeft: 'auto',
	marginRight: 'auto',
	width: '100%',
	position: 'absolute',
	height: '100%',
	overflowY: 'auto',
};

const ErrorLoading: React.FC<{
	readonly error: Error;
}> = ({error}) => {
	return (
		<div style={loaderContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<ErrorLoader
				key={error.stack}
				canHaveDismissButton={false}
				keyboardShortcuts={false}
				error={error}
				onRetry={() =>
					Internals.resolveCompositionsRef.current?.reloadCurrentlySelectedComposition()
				}
				calculateMetadata
			/>
		</div>
	);
};
