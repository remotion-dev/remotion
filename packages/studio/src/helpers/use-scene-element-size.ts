import {PlayerInternals} from '@remotion/player';
import {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import type {TimelineSceneNode} from '../components/Timeline/timeline-scene-node';
import {isTimelineSceneNode} from '../components/Timeline/timeline-scene-node';

type SceneSizeSource =
	| React.RefObject<HTMLElement | TimelineSceneNode | null>
	| HTMLElement
	| TimelineSceneNode
	| null;

const getSizeSource = (source: SceneSizeSource) => {
	return source && 'current' in source ? source.current : source;
};

export const useSceneElementSize = (
	source: SceneSizeSource,
	options: Parameters<typeof PlayerInternals.useElementSize>[1],
): ReturnType<typeof PlayerInternals.useElementSize> => {
	const domSource = useMemo(
		() => ({
			get current() {
				const element = getSizeSource(source);
				return isTimelineSceneNode(element) ? null : element;
			},
		}),
		[source],
	);
	const domSize = PlayerInternals.useElementSize(domSource, options);
	const [sceneSize, setSceneSize] =
		useState<ReturnType<typeof PlayerInternals.useElementSize>>(null);
	const refresh = useCallback(() => {
		const node = getSizeSource(source);
		if (!isTimelineSceneNode(node)) {
			setSceneSize(null);
			return;
		}

		const rect = node.getBoundingClientRect();
		setSceneSize((previous) => {
			if (
				previous?.width === rect.width &&
				previous.height === rect.height &&
				previous.left === rect.left &&
				previous.top === rect.top &&
				previous.windowSize.width === window.innerWidth &&
				previous.windowSize.height === window.innerHeight
			) {
				return previous;
			}

			return {
				width: rect.width,
				height: rect.height,
				left: rect.left,
				top: rect.top,
				windowSize: {width: window.innerWidth, height: window.innerHeight},
				refresh,
			};
		});
	}, [source]);

	useLayoutEffect(() => {
		refresh();
		const node = getSizeSource(source);
		if (!isTimelineSceneNode(node)) {
			return;
		}

		const unsubscribe = node.store.subscribeLayout(refresh);
		if (options.triggerOnWindowResize) {
			window.addEventListener('resize', refresh);
		}

		return () => {
			unsubscribe();
			window.removeEventListener('resize', refresh);
		};
	}, [options.triggerOnWindowResize, refresh, source]);

	return isTimelineSceneNode(getSizeSource(source)) ? sceneSize : domSize;
};
