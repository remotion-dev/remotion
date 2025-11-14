import {getMaxModalHeight, getMaxModalWidth} from '../ModalContainer';

export const outerModalStyle: React.CSSProperties = {
	width: getMaxModalWidth(1000),
	height: getMaxModalHeight(640),
	overflow: 'hidden',
	display: 'flex',
	flexDirection: 'column',
};
