import React, {useCallback} from 'react';
import {
	BACKGROUND,
	SHADOW_BLACK,
	WHITE,
	WHITE_ALPHA_20,
} from '../helpers/colors';
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
	backgroundColor: WHITE_ALPHA_20,
	backdropFilter: `blur(1px)`,
	position: 'fixed',
	height: '100%',
	width: '100%',
	display: 'flex',
	padding,
};

const panel: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	boxShadow: SHADOW_BLACK,
	color: WHITE,
	margin: 'auto',
};

export const ModalContainer: React.FC<{
	readonly onEscape: () => void;
	readonly onOutsideClick: () => void;
	readonly children: React.ReactNode;
	readonly noZIndex?: boolean;
}> = ({children, onEscape, onOutsideClick, noZIndex}) => {
	const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
		// Prevent deselection of currently selected items
		e.stopPropagation();
	}, []);

	return (
		<div
			className="css-reset"
			style={backgroundOverlay}
			role="dialog"
			aria-modal="true"
			onPointerDown={onPointerDown}
		>
			<HigherZIndex
				disabled={noZIndex}
				onOutsideClick={onOutsideClick}
				onEscape={onEscape}
			>
				<div style={panel}>{children}</div>
			</HigherZIndex>
		</div>
	);
};
