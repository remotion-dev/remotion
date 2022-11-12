import React, {useCallback, useContext, useMemo} from 'react';
import type {TCompMetadata} from 'remotion';
import {Button} from '../../../preview-server/error-overlay/remotion-overlay/Button';
import {ModalsContext} from '../../state/modals';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';

export const RenderModal: React.FC<{composition: TCompMetadata}> = ({
	composition,
}) => {
	const panelContent: React.CSSProperties = useMemo(() => {
		return {
			flexDirection: 'row',
			display: 'flex',
		};
	}, []);

	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const onClick = useCallback(() => {
		console.log('on click');
	}, []);

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title={`Render ${composition.id}`} />
			<Button onClick={onClick}>Render</Button>
		</ModalContainer>
	);
};
