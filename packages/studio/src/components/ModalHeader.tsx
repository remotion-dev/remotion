import React, {useCallback, useContext} from 'react';
import {BORDER_BLACK, WHITE} from '../helpers/colors';
import {ModalsContext} from '../state/modals';
import {Flex} from './layout';
import {CancelButton} from './NewComposition/CancelButton';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	padding: '12px 16px',
	width: '100%',
	borderBottom: BORDER_BLACK,
};

const titleStyle: React.CSSProperties = {
	fontSize: 14,
	color: WHITE,
};

const icon: React.CSSProperties = {
	height: 20,
	width: 20,
};

export const ModalHeader: React.FC<{
	readonly title: string;
	readonly onClose?: () => void;
}> = ({title, onClose}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onPress = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	return (
		<div style={container}>
			<div style={titleStyle}>{title}</div>
			<Flex />
			<CancelButton style={icon} onPress={onClose ?? onPress} />
		</div>
	);
};
