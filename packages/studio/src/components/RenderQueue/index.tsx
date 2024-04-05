import React, {useContext, useEffect, useMemo} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BACKGROUND, BORDER_COLOR, LIGHT_TEXT} from '../../helpers/colors';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {Spacing} from '../layout';
import {RenderQueueItem} from './RenderQueueItem';
import {RenderQueueContext} from './context';

const separatorStyle: React.CSSProperties = {
	borderBottom: `1px solid ${BORDER_COLOR}`,
};

const errorExplanation: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
};

const explainer: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	padding: '0 12px',
	justifyContent: 'center',
	alignItems: 'center',
	textAlign: 'center',
	background: BACKGROUND,
};

const renderQueue: React.CSSProperties = {
	background: BACKGROUND,
	flex: 1,
	overflowY: 'auto',
};

export const RenderQueue: React.FC = () => {
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const {jobs} = useContext(RenderQueueContext);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const previousJobCount = React.useRef(jobs.length);
	const jobCount = jobs.length;

	const divRef = React.useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!divRef.current) {
			return;
		}

		// Scroll down to bottom of render queue if new jobs have been added
		if (jobCount > previousJobCount.current) {
			divRef.current.scrollTo({
				top: divRef.current.scrollHeight,
				behavior: 'smooth',
			});
		}

		previousJobCount.current = jobCount;
	}, [jobCount]);

	const selectedJob = useMemo(() => {
		let selectedIndex = -1;
		for (let i = 0; i < jobs.length; i++) {
			const job = jobs[i];

			if (
				canvasContent &&
				canvasContent.type === 'output' &&
				canvasContent.path === `/${job.outName}` &&
				job.status === 'done'
			) {
				selectedIndex = i;
			}
		}

		return selectedIndex;
	}, [canvasContent, jobs]);

	if (connectionStatus === 'disconnected') {
		return (
			<div style={explainer}>
				<Spacing y={5} />
				<div style={errorExplanation}>The studio server has disconnected.</div>
				<Spacing y={2} block />
			</div>
		);
	}

	if (jobCount === 0) {
		return (
			<div style={explainer}>
				<Spacing y={5} />
				<div style={errorExplanation}>No renders in the queue.</div>
				<Spacing y={2} block />
			</div>
		);
	}

	return (
		<div
			ref={divRef}
			style={renderQueue}
			className={['css-reset', VERTICAL_SCROLLBAR_CLASSNAME].join(' ')}
		>
			{jobs.map((j, index) => {
				return (
					<div
						key={j.id}
						style={index === jobs.length - 1 ? undefined : separatorStyle}
					>
						<RenderQueueItem selected={selectedJob === index} job={j} />
					</div>
				);
			})}
		</div>
	);
};
