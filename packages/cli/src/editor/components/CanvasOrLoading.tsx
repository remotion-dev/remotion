import React, {useContext, useEffect, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {ErrorLoader} from '../../preview-server/error-overlay/remotion-overlay/ErrorLoader';
import {BACKGROUND, LIGHT_TEXT} from '../helpers/colors';
import {Canvas} from './Canvas';
import {Spacing} from './layout';
import {inlineCodeSnippet} from './Menu/styles';
import {Spinner} from './Spinner';
import {FramePersistor} from './FramePersistor';
import {ZoomPersistor} from './ZoomPersistor';
import {ensureFrameIsInViewport} from './Timeline/timeline-scroll-logic';
import {TimelineZoomCtx} from '../state/timeline-zoom';
import {getCurrentFrame} from './Timeline/imperative-state';

const container: React.CSSProperties = {
	color: 'white',
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center',
	display: 'flex',
	backgroundColor: BACKGROUND,
	flexDirection: 'column',
};

export const CanvasOrLoading: React.FC = () => {
	const resolved = Internals.useResolvedVideoConfig(null);
	const [takesALongTime, setTakesALongTime] = useState(false);
	const {setZoom} = useContext(TimelineZoomCtx);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setTakesALongTime(true);
		}, 500);
		return () => {
			clearTimeout(timeout);
		};
	}, []);

	useEffect(() => {
		if (resolved?.type !== 'success') {
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

	const style = useMemo(() => {
		return {
			...loaderLabel,
			opacity: takesALongTime ? 1 : 0,
			transition: 'opacity 0.3s',
		};
	}, [takesALongTime]);

	if (!resolved) {
		return null;
	}

	if (resolved.type === 'loading') {
		return (
			<div style={container} className="css-reset">
				<Spinner size={30} duration={1} />
				<Spacing y={2} />
				<div style={style}>
					Running <code style={inlineCodeSnippet}>calculateMetadata()</code>...
				</div>
			</div>
		);
	}

	if (resolved.type === 'error') {
		return <ErrorLoading error={resolved.error} />;
	}

	return (
		<>
			<FramePersistor />
			<ZoomPersistor />
			<Canvas />
		</>
	);
};

const loaderLabel: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
};

const loaderContainer: React.CSSProperties = {
	marginLeft: 'auto',
	marginRight: 'auto',
	width: '100%',
	position: 'absolute',
	height: '100%',
	overflowY: 'auto',
};

export const ErrorLoading: React.FC<{
	error: Error;
}> = ({error}) => {
	return (
		<div style={loaderContainer}>
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
