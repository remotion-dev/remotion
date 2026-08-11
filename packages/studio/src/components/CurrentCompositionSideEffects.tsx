import type React from 'react';
import {useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {
	setCurrentCanvasContentId,
	setRenderJobs,
} from '../helpers/document-title';
import {RenderQueueContext} from './RenderQueue/context';

export const TitleUpdater: React.FC = () => {
	const renderQueue = useContext(RenderQueueContext);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {jobs} = renderQueue;

	useEffect(() => {
		if (!canvasContent) {
			setCurrentCanvasContentId(null);
			return;
		}

		if (canvasContent.type === 'composition') {
			setCurrentCanvasContentId(canvasContent.compositionId);
			return;
		}

		if (canvasContent.type === 'output') {
			setCurrentCanvasContentId(canvasContent.path);
			return;
		}

		if (canvasContent.type === 'output-blob') {
			setCurrentCanvasContentId(canvasContent.displayName);
			return;
		}

		setCurrentCanvasContentId(canvasContent.asset);
	}, [canvasContent]);

	useEffect(() => {
		setRenderJobs(jobs);
	}, [jobs]);

	return null;
};
