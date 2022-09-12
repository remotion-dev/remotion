import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useContext, useEffect, useRef} from 'react';
import {smoothenZoom, unsmoothenZoom} from '../../smooth-zoom';
import {BACKGROUND} from '../helpers/colors';
import {useIsStill} from '../helpers/is-current-selected-still';
import {PreviewSizeContext} from '../state/preview-size';
import {StillPreview, VideoPreview} from './Preview';

const container: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	overflow: 'hidden',
	position: 'relative',
	backgroundColor: BACKGROUND,
};

const stillContainer: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	overflow: 'auto',
	position: 'relative',
	backgroundColor: BACKGROUND,
};

const ZOOM_PX_FACTOR = 0.003;

export const Canvas: React.FC = () => {
	const isStill = useIsStill();
	const ref = useRef<HTMLDivElement>(null);
	const {setSize, setTranslation} = useContext(PreviewSizeContext);

	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: false,
		shouldApplyCssTransforms: true,
	});

	const onWheel = useCallback((e: WheelEvent) => {
		if (e.ctrlKey || e.metaKey) {
			setSize((prevSize) => {
				// TODO: Might not be 1
				const oldSize = prevSize === 'auto' ? 1 : prevSize;
				const unsmoothened = smoothenZoom(oldSize);
				const added = unsmoothened + e.deltaY * ZOOM_PX_FACTOR;
				const smoothened = unsmoothenZoom(added);
				console.log({unsmoothened, smoothened, added, delta: e.deltaY});

				return smoothened;
			});
		} else {
			console.log(e.deltaX, e.deltaY);
			setTranslation((prevTranslation) => {
				return {
					x: prevTranslation.x + e.deltaX,
					y: prevTranslation.y + e.deltaY,
				};
			});
		}
	}, []);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		current.addEventListener('wheel', onWheel);

		return () => current.removeEventListener('wheel', onWheel);
	}, []);

	if (isStill) {
		return (
			<div ref={ref} style={stillContainer}>
				{size ? <StillPreview canvasSize={size} /> : null}
			</div>
		);
	}

	return (
		<div ref={ref} style={container}>
			{size ? <VideoPreview canvasSize={size} /> : null}
		</div>
	);
};
