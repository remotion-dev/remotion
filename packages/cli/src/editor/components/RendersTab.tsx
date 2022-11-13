import type {MouseEventHandler} from 'react';
import React, {useContext, useMemo} from 'react';
import {FAIL_COLOR} from '../helpers/colors';
import {Spacing} from './layout';
import {RenderQueueContext} from './RenderQueue/context';
import {Tab} from './Tabs';

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	fontSize: 13,
	justifyContent: 'center',
	color: 'inherit',
	alignItems: 'center',
};

const badge: React.CSSProperties = {
	height: 16,
	width: 16,
	borderRadius: 8,
	fontSize: 10,
	display: 'inline-flex',
	justifyContent: 'center',
	alignItems: 'center',
};

export const RendersTab: React.FC<{
	selected: boolean;
	onClick: MouseEventHandler<HTMLButtonElement>;
}> = ({selected, onClick}) => {
	const {jobs} = useContext(RenderQueueContext);

	const failedJobs = jobs.filter((j) => j.status === 'failed').length;
	const jobCount = jobs.length;

	const badgeStyle: React.CSSProperties = useMemo(() => {
		return {
			...badge,
			backgroundColor: failedJobs > 0 ? FAIL_COLOR : 'white',
		};
	}, [failedJobs]);

	return (
		<Tab selected={selected} onClick={onClick}>
			<div style={row}>
				Renders
				{failedJobs ? (
					<>
						<Spacing x={0.5} />
						<div style={badgeStyle}>{jobCount}</div>
					</>
				) : null}
			</div>
		</Tab>
	);
};
