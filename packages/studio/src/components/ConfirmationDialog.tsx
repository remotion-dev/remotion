import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from 'react';
import {ShortcutHint} from '../error-overlay/remotion-overlay/ShortcutHint';
import type {ConfirmationDialogState} from '../state/modals';
import {ModalsContext} from '../state/modals';
import {Button} from './Button';
import type {ConfirmationDialogFunction} from './ConfirmationDialog-types';
import {Flex, Row, Spacing} from './layout';
import {ModalButton} from './ModalButton';
import {ModalContainer} from './ModalContainer';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';

const content: React.CSSProperties = {
	padding: 16,
	fontSize: 14,
	flex: 1,
	minWidth: 420,
	maxWidth: 560,
	lineHeight: 1.4,
};

export const useConfirmationDialog = (): ConfirmationDialogFunction => {
	const {setSelectedModal} = useContext(ModalsContext);

	return useCallback(
		(options) => {
			return new Promise<boolean>((resolve) => {
				let settled = false;
				const settle = (result: boolean) => {
					if (settled) {
						return;
					}

					settled = true;
					resolve(result);
				};

				setSelectedModal({
					type: 'confirmation-dialog',
					id: String(Math.random()),
					title: options.title,
					message: options.message,
					confirmLabel: options.confirmLabel ?? 'Continue',
					cancelLabel: options.cancelLabel ?? 'Cancel',
					onConfirm: () => settle(true),
					onCancel: () => settle(false),
				});
			});
		},
		[setSelectedModal],
	);
};

export const ConfirmationDialog: React.FC<{
	readonly state: ConfirmationDialogState;
}> = ({state}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const settledRef = useRef(false);

	const closeCurrentModal = useCallback(() => {
		setSelectedModal((modal) =>
			modal?.type === 'confirmation-dialog' && modal.id === state.id
				? null
				: modal,
		);
	}, [setSelectedModal, state.id]);

	const settle = useCallback(
		(confirmed: boolean) => {
			if (settledRef.current) {
				return;
			}

			settledRef.current = true;
			closeCurrentModal();
			if (confirmed) {
				state.onConfirm();
			} else {
				state.onCancel();
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
			state.onCancel();
		};
	}, [state]);

	const onCancel = useCallback(() => {
		settle(false);
	}, [settle]);

	const onConfirm = useCallback(() => {
		settle(true);
	}, [settle]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
		(e) => {
			e.preventDefault();
			onConfirm();
		},
		[onConfirm],
	);

	const cancelStyle = useMemo((): React.CSSProperties => {
		return {
			minWidth: 90,
		};
	}, []);

	return (
		<ModalContainer onOutsideClick={onCancel} onEscape={onCancel}>
			<ModalHeader title={state.title} onClose={onCancel} />
			<form onSubmit={onSubmit}>
				<div style={content}>{state.message}</div>
				<ModalFooterContainer>
					<Row align="center">
						<Flex />
						<Button onClick={onCancel} style={cancelStyle}>
							{state.cancelLabel}
						</Button>
						<Spacing x={1} />
						<ModalButton onClick={onConfirm} autoFocus>
							{state.confirmLabel}
							<ShortcutHint keyToPress="↵" cmdOrCtrl={false} />
						</ModalButton>
					</Row>
				</ModalFooterContainer>
			</form>
		</ModalContainer>
	);
};
