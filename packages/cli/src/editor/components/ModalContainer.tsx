import React from 'react';
import {BACKGROUND} from '../helpers/colors';
import {HigherZIndex} from '../state/z-index';

const backgroundOverlay: React.CSSProperties = {
	backgroundColor: 'rgba(255, 255, 255, 0.2)',
	backdropFilter: `blur(1px)`,
	position: 'fixed',
	height: '100%',
	width: '100%',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
};

const panel: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	boxShadow: '0 0 4px black',
	color: 'white',
};

export const ModalContainer: React.FC<{
	onEscape: () => void;
	onOutsideClick: () => void;
	children: React.ReactNode;
}> = ({children, onEscape, onOutsideClick}) => {
	return (
		<div
			className="css-reset"
			style={backgroundOverlay}
			role="dialog"
			aria-modal="true"
		>
			<HigherZIndex onOutsideClick={onOutsideClick} onEscape={onEscape}>
				<div style={panel}>{children}</div>
			</HigherZIndex>
		</div>
	);
};
