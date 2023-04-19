import React, {useContext} from 'react';
import {PreviewServerConnectionCtx} from '../../helpers/client-id';
import {BORDER_COLOR, LIGHT_TEXT} from '../../helpers/colors';
import {Spacing} from '../layout';
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
};

export const RenderQueue: React.FC = () => {
	const connectionStatus = useContext(PreviewServerConnectionCtx).type;
	const {jobs} = useContext(RenderQueueContext);
	const jobCount = jobs.length;

	if (connectionStatus === 'disconnected') {
		return (
			<div style={explainer}>
				<Spacing y={5} />
				<div style={errorExplanation}>
					The preview server has disconnected. Renderqueue unavailable.
				</div>
				<Spacing y={2} block />
			</div>
		);
	}

	if (jobCount === 0) {
		return (
			<div style={explainer}>
				<Spacing y={5} />
				<div style={errorExplanation}>
					No renders done yet. Click on the Rocket or press R to render this
					composition
				</div>
				<Spacing y={2} block />
			</div>
		);
	}

	return (
		<div>
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
