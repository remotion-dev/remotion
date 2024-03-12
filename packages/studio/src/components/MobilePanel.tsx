import ReactDOM from 'react-dom';
import {BACKGROUND} from '../helpers/colors';
import {useZIndex} from '../state/z-index';
import {getPortal} from './Menu/portals';
import {CancelButton} from './NewComposition/CancelButton';

export default function MobilePanel({
	children,
	onClose,
}: {
	children: React.ReactNode;
	onClose: () => void;
}) {
	const {currentZIndex} = useZIndex();

	return ReactDOM.createPortal(
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				padding: '0 0px 50px 0px',
				background: BACKGROUND,
			}}
		>
			<div
				style={{
					height: '40px',
					width: '100%',
					alignItems: 'center',
					display: 'flex',
					justifyContent: 'flex-end',
				}}
			>
				<CancelButton
					style={{
						height: 20,
						width: 20,
					}}
					onPress={onClose}
				/>
			</div>
			{children}
		</div>,
		getPortal(currentZIndex),
	);
}
