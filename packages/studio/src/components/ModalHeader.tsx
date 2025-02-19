import React, {useCallback, useContext} from 'react';
import {ModalsContext} from '../state/modals';
import {CancelButton} from './NewComposition/CancelButton';
import {Flex} from './layout';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	padding: '12px 16px',
	width: '100%',
	borderBottom: '1px solid black',
};

const titleStyle: React.CSSProperties = {
	fontSize: 14,
	color: 'white',
};

const icon: React.CSSProperties = {
	height: 20,
	width: 20,
};

export const ModalHeader: React.FC<{
	readonly title: string;
}> = ({title}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onPress = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	return (
		<div style={container}>
			<div style={titleStyle}>{title}</div>
			<Flex />
			<CancelButton style={icon} onPress={onPress} />
		</div>
	);
};
