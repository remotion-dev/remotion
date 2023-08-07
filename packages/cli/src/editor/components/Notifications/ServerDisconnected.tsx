import React, {useContext} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';

const container: React.CSSProperties = {
	position: 'fixed',
	justifyContent: 'flex-end',
	alignItems: 'flex-start',
	display: 'flex',
	width: '100%',
	height: '100%',
	flexDirection: 'column',
	padding: 30,
	pointerEvents: 'none',
	backgroundColor: 'transparent',
	fontFamily: 'SF Pro, Arial, Helvetica, sans-serif',
};

const message: React.CSSProperties = {
	backgroundColor: '#e74c3c',
	color: 'white',
	paddingLeft: 20,
	paddingRight: 20,
	paddingTop: 12,
	paddingBottom: 12,
	borderRadius: 4,
	boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
	lineHeight: 1.5,
};

const inlineCode: React.CSSProperties = {
	fontSize: 16,
	fontFamily: 'monospace',
};

let pageIsGoingToReload = false;
window.addEventListener('beforeunload', () => {
	pageIsGoingToReload = true;
});

export const ServerDisconnected: React.FC = () => {
	const ctx = useContext(StudioServerConnectionCtx);

	if (ctx.type !== 'disconnected') {
		return null;
	}

	if (pageIsGoingToReload) {
		return null;
	}

	return (
		<div style={container} className="css-reset">
			<div style={message}>
				The studio server has disconnected. <br />
				{window.remotion_studioServerCommand ? (
					<span>
						Run{' '}
						<code style={inlineCode}>
							{window.remotion_studioServerCommand}
						</code>{' '}
						to run it again.
					</span>
				) : (
					<span>Fast refresh will not work.</span>
				)}
			</div>
		</div>
	);
};
