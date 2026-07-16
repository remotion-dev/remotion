import React from 'react';
import ReactDOM from 'react-dom';
import {BACKGROUND} from '../helpers/colors';
import {useZIndex} from '../state/z-index';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {getPortal} from './Menu/portals';
import {CancelIcon} from './NewComposition/CancelButton';

const container: React.CSSProperties = {
	position: 'fixed',
	top: 0,
	left: 0,
	width: '100%',
	height: '100%',
	padding: '0 0px 50px 0px',
	background: BACKGROUND,
};

const buttonContainer: React.CSSProperties = {
	height: '40px',
	width: '100%',
	alignItems: 'center',
	display: 'flex',
	justifyContent: 'flex-end',
	paddingRight: 8,
};

const button: React.CSSProperties = {
	height: 16,
	width: 16,
	flexShrink: 0,
};

const renderCloseIcon: RenderInlineAction = (color) => {
	return <CancelIcon style={{...button, color}} />;
};

export default function MobilePanel({
	children,
	onClose,
}: {
	children: React.ReactNode;
	onClose: () => void;
}) {
	const {currentZIndex} = useZIndex();

	return ReactDOM.createPortal(
		<div style={container}>
			<div style={buttonContainer}>
				<InlineAction
					onClick={onClose}
					renderAction={renderCloseIcon}
					title="Close sidebar"
				/>
			</div>
			{children}
		</div>,
		getPortal(currentZIndex),
	);
}
