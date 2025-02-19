import React from 'react';
import {BACKGROUND} from '../helpers/colors';
import {HigherZIndex} from '../state/z-index';

const padding = 20;

export const getMaxModalWidth = (width: number) => {
	return `min(calc(100vw - ${padding * 2}px), calc(${width}px - ${
		padding * 2
	}px))`;
};

export const getMaxModalHeight = (height: number) => {
	return `min(calc(100vh - ${padding * 2}px), calc(${height}px - ${
		padding * 2
	}px))`;
};

const backgroundOverlay: React.CSSProperties = {
	backgroundColor: 'rgba(255, 255, 255, 0.2)',
	backdropFilter: `blur(1px)`,
	position: 'fixed',
	height: '100%',
	width: '100%',
	display: 'flex',
	padding,
};

const panel: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	boxShadow: '0 0 4px black',
	color: 'white',
	margin: 'auto',
};

export const ModalContainer: React.FC<{
	readonly onEscape: () => void;
	readonly onOutsideClick: () => void;
	readonly children: React.ReactNode;
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
