import React, {useCallback, useContext, useEffect, useRef} from 'react';
import type {SvgImportDialogState} from '../state/modals';
import {ModalsContext} from '../state/modals';
import {Button} from './Button';
import {Flex, Row, Spacing} from './layout';
import {ModalButton} from './ModalButton';
import {ModalContainer} from './ModalContainer';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';

export type SvgImportMode = 'image' | 'inline';

const content: React.CSSProperties = {
	padding: 16,
	fontFamily: 'inherit',
	fontSize: 14,
	lineHeight: 1.4,
	color: 'inherit',
	minWidth: 560,
};

const inlineCode: React.CSSProperties = {
	fontFamily: 'monospace',
	fontSize: 'inherit',
	lineHeight: 'inherit',
	color: 'inherit',
};

export const useSvgImportDialog = () => {
	const {setSelectedModal} = useContext(ModalsContext);

	return useCallback(() => {
		return new Promise<SvgImportMode | null>((resolve) => {
			let settled = false;
			const settle = (result: SvgImportMode | null) => {
				if (settled) {
					return;
				}

				settled = true;
				resolve(result);
			};

			setSelectedModal({
				type: 'svg-import-dialog',
				id: String(Math.random()),
				onImage: () => settle('image'),
				onInline: () => settle('inline'),
				onDismiss: () => settle(null),
			});
		});
	}, [setSelectedModal]);
};

export const SvgImportDialog: React.FC<{
	readonly state: SvgImportDialogState;
}> = ({state}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const settledRef = useRef(false);

	const closeCurrentModal = useCallback(() => {
		setSelectedModal((modal) =>
			modal?.type === 'svg-import-dialog' && modal.id === state.id
				? null
				: modal,
		);
	}, [setSelectedModal, state.id]);

	const settle = useCallback(
		(result: SvgImportMode | null) => {
			if (settledRef.current) {
				return;
			}

			settledRef.current = true;
			closeCurrentModal();
			if (result === 'image') {
				state.onImage();
			} else if (result === 'inline') {
				state.onInline();
			} else {
				state.onDismiss();
			}
		},
		[closeCurrentModal, state],
	);

	useEffect(() => {
		return () => {
			if (settledRef.current) {
				return;
			}

			settledRef.current = true;
			state.onDismiss();
		};
	}, [state]);

	const onImage = useCallback(() => {
		settle('image');
	}, [settle]);

	const onInline = useCallback(() => {
		settle('inline');
	}, [settle]);

	const onDismiss = useCallback(() => {
		settle(null);
	}, [settle]);

	return (
		<ModalContainer onOutsideClick={onDismiss} onEscape={onDismiss}>
			<ModalHeader title="Add .svg" onClose={onDismiss} />
			<div style={content}>
				Do you want to import this as an image or as inline SVG?
			</div>
			<ModalFooterContainer>
				<Row align="center">
					<Flex />
					<Button onClick={onImage}>
						Add to <code style={inlineCode}>public</code> and import as{' '}
						<code style={inlineCode}>{'<Img>'}</code>
					</Button>
					<Spacing x={1} />
					<ModalButton onClick={onInline} autoFocus>
						Import as inline <code style={inlineCode}>{'<svg>'}</code>
					</ModalButton>
				</Row>
			</ModalFooterContainer>
		</ModalContainer>
	);
};
