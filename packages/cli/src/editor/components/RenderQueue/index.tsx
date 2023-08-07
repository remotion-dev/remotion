import React, {useContext} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BACKGROUND, BORDER_COLOR, LIGHT_TEXT} from '../../helpers/colors';
import {Spacing} from '../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {RenderQueueContext} from './context';
import {RenderQueueItem} from './RenderQueueItem';

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
	const connectionStatus = useContext(StudioServerConnectionCtx).type;
	const {jobs} = useContext(RenderQueueContext);
	const jobCount = jobs.length;

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
			style={renderQueue}
			className={['css-reset', VERTICAL_SCROLLBAR_CLASSNAME].join(' ')}
		>
			{jobs.map((j, index) => {
				return (
					<div
						key={j.id}
						style={index === jobs.length - 1 ? undefined : separatorStyle}
					>
						<RenderQueueItem job={j} />
					</div>
				);
			})}
		</div>
	);
};
