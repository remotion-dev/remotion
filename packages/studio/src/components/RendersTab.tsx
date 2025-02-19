import type {MouseEventHandler} from 'react';
import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {FAIL_COLOR, LIGHT_TEXT} from '../helpers/colors';
import {RenderQueueContext} from './RenderQueue/context';
import {Tab} from './Tabs';
import {Flex} from './layout';

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	fontSize: 14,
	color: 'inherit',
	alignItems: 'center',
	flex: 1,
};

const badge: React.CSSProperties = {
	height: 16,
	width: 16,
	borderRadius: 3,
	fontSize: 10,
	display: 'inline-flex',
	justifyContent: 'center',
	alignItems: 'center',
};

export const RendersTab: React.FC<{
	readonly selected: boolean;
	readonly onClick: MouseEventHandler<HTMLDivElement>;
}> = ({selected, onClick}) => {
	const {jobs} = useContext(RenderQueueContext);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const failedJobs = jobs.filter((j) => j.status === 'failed').length;
	const jobCount = jobs.length;

	const isActuallySelected = useMemo(() => {
		if (!canvasContent || canvasContent.type !== 'composition') {
			return true;
		}

		return selected;
	}, [canvasContent, selected]);

	const badgeStyle: React.CSSProperties = useMemo(() => {
		return {
			...badge,
			backgroundColor: failedJobs > 0 ? FAIL_COLOR : 'transparent',
			color: failedJobs > 0 ? 'white' : LIGHT_TEXT,
			borderWidth: failedJobs > 0 ? 0 : 1,
			borderStyle: 'solid',
			borderColor: LIGHT_TEXT,
		};
	}, [failedJobs]);

	return (
		<Tab selected={isActuallySelected} onClick={onClick}>
			<div style={row}>
				Renders
				{jobCount > 0 ? (
					<>
						<Flex />
						<div style={badgeStyle}>{jobCount}</div>
					</>
				) : null}
			</div>
		</Tab>
	);
};
