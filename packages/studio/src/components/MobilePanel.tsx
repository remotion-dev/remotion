import React from 'react';
import ReactDOM from 'react-dom';
import {BACKGROUND} from '../helpers/colors';
import {useZIndex} from '../state/z-index';
import {getPortal} from './Menu/portals';
import {CancelButton} from './NewComposition/CancelButton';

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
};

const button: React.CSSProperties = {
	height: 20,
	width: 20,
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
				<CancelButton style={button} onPress={onClose} />
			</div>
			{children}
		</div>,
		getPortal(currentZIndex),
	);
}
