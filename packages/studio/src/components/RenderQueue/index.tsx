import React, {useContext, useEffect, useMemo} from 'react';
import {Internals} from 'remotion';
import {BACKGROUND, LIGHT_TEXT} from '../../helpers/colors';
import {Spacing} from '../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {isCaptionJob} from './caption-job-types';
import {CaptionQueueItem} from './CaptionQueueItem';
import {RenderQueueContext} from './context';
import {RenderQueueItem} from './RenderQueueItem';
import {isVideoMattingJob} from './video-matting-job-types';
import {VideoMattingQueueItem} from './VideoMattingQueueItem';

const errorExplanation: React.CSSProperties = {
	fontSize: 13,
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
	paddingTop: 4,
	paddingBottom: 4,
};

export const RenderQueue: React.FC = () => {
	const {jobs, captionJobs, videoMattingJobs} = useContext(RenderQueueContext);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const allJobs = useMemo(
		() =>
			[...jobs, ...captionJobs, ...videoMattingJobs].sort(
				(a, b) => a.startedAt - b.startedAt,
			),
		[jobs, captionJobs, videoMattingJobs],
	);
	const previousJobCount = React.useRef(allJobs.length);
	const jobCount = allJobs.length;

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
		if (!canvasContent) {
			return -1;
		}

		if (canvasContent.type === 'output') {
			for (let i = 0; i < allJobs.length; i++) {
				const job = allJobs[i];
				if (isCaptionJob(job) || isVideoMattingJob(job)) {
					continue;
				}

				if (job.status === 'done' && canvasContent.path === `/${job.outName}`) {
					return i;
				}
			}
		}

		if (canvasContent.type === 'asset') {
			for (let i = 0; i < allJobs.length; i++) {
				const job = allJobs[i];
				if (
					isCaptionJob(job) &&
					job.status === 'done' &&
					canvasContent.asset === job.outName
				) {
					return i;
				}

				if (
					isVideoMattingJob(job) &&
					job.status === 'done' &&
					(canvasContent.asset === job.baseOutName ||
						canvasContent.asset === job.foregroundOutName)
				) {
					return i;
				}
			}
		}

		return -1;
	}, [allJobs, canvasContent]);

	if (jobCount === 0) {
		return (
			<div style={explainer}>
				<Spacing y={5} />
				<div style={errorExplanation}>
					Renders, transcriptions and video matting jobs will show up here.
				</div>
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
			{allJobs.map((job, index) => {
				return isCaptionJob(job) ? (
					<CaptionQueueItem
						key={job.id}
						job={job}
						selected={selectedJob === index}
					/>
				) : isVideoMattingJob(job) ? (
					<VideoMattingQueueItem
						key={job.id}
						job={job}
						selected={selectedJob === index}
					/>
				) : (
					<RenderQueueItem
						key={job.id}
						selected={selectedJob === index}
						job={job}
					/>
				);
			})}
		</div>
	);
};
