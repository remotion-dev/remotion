import React, {useCallback, useContext} from 'react';
import {ModalsContext} from '../state/modals';
import {Flex} from './layout';
import {CancelButton} from './NewComposition/CancelButton';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	padding: 12,
	width: '100%',
	borderBottom: '1px solid black',
};

const icon: React.CSSProperties = {
	height: 20,
	width: 20,
};

export const NewCompHeader: React.FC<{
	title: string;
}> = ({title}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const onPress = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);
	return (
		<div style={container}>
			<div>{title}</div>
			<Flex />
			<CancelButton style={icon} onPress={onPress} />
		</div>
	);
};
