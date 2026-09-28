import type {
	CompositionEditResponse,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {ShortcutHint} from '../../error-overlay/remotion-overlay/ShortcutHint';
import {LIGHT_TEXT} from '../../helpers/colors';
import {resolvedStackToSymbolicated} from '../../helpers/resolved-stack-to-symbolicated';
import {useKeybinding} from '../../helpers/use-keybinding';
import {SetSelectedModalContext} from '../../state/modals';
import {Flex, Row, Spacing} from '../layout';
import {ModalButton} from '../ModalButton';
import {showNotification} from '../Notifications/NotificationCenter';
import {useResolvedStack} from '../Timeline/use-resolved-stack';

type ApplyCompositionEditAction = (options: {
	signal: AbortSignal;
	symbolicatedStack: SymbolicatedStackFrame | null;
}) => Promise<CompositionEditResponse>;

const CompositionEditFooterPresentation: React.FC<{
	readonly disabled: boolean;
	readonly genericSubmitLabel: string;
	readonly relativeFilePath: string | null;
	readonly submitLabel: (options: {relativeRootPath: string}) => string;
	readonly trigger: () => void;
}> = ({
	disabled,
	genericSubmitLabel,
	relativeFilePath,
	submitLabel,
	trigger,
}) => {
	return (
		<Row align="center">
			<span style={{color: LIGHT_TEXT, fontSize: 13, lineHeight: 1.2}}>
				This will edit your codebase.
			</span>
			<Flex />
			<Spacing block x={2} />
			<ModalButton onClick={trigger} disabled={disabled}>
				{relativeFilePath
					? submitLabel({relativeRootPath: relativeFilePath})
					: genericSubmitLabel}
				<ShortcutHint keyToPress="↵" cmdOrCtrl={false} />
			</ModalButton>
		</Row>
	);
};

export const CompositionEditFooter: React.FC<{
	readonly valid: boolean;
	readonly stack: string | null;
	readonly loadingNotification: React.ReactNode | null;
	readonly errorNotification: string;
	readonly genericSubmitLabel: string;
	readonly submitLabel: (options: {relativeRootPath: string}) => string;
	readonly onSuccess: (() => void) | null;
	readonly fallbackToRootFile?: boolean;
	readonly applyEdit: ApplyCompositionEditAction;
}> = ({
	stack,
	valid,
	loadingNotification,
	errorNotification,
	genericSubmitLabel,
	submitLabel,
	onSuccess,
	fallbackToRootFile = false,
	applyEdit,
}) => {
	const [submitting, setSubmitting] = useState(false);
	const {setSelectedModal} = useContext(SetSelectedModalContext);

	const resolvedLocation = useResolvedStack(stack);
	const symbolicatedStack = useMemo(
		() => resolvedStackToSymbolicated(resolvedLocation),
		[resolvedLocation],
	);

	const relativeFilePath = symbolicatedStack?.originalFileName ?? null;

	const trigger = useCallback(() => {
		setSubmitting(true);
		setSelectedModal(null);
		const notification =
			loadingNotification === null
				? null
				: showNotification(loadingNotification, null);

		applyEdit({
			symbolicatedStack,
			signal: new AbortController().signal,
		})
			.then((result) => {
				if (!result.success) {
					const message = `${errorNotification}: ${result.reason}`;
					if (notification) {
						notification.replaceContent(message, 2000);
					} else {
						showNotification(message, 2000);
					}

					return;
				}

				notification?.dismiss();

				onSuccess?.();
			})
			.catch((err) => {
				const message = `${errorNotification}: ${(err as Error).message}`;
				if (notification) {
					notification.replaceContent(message, 2000);
				} else {
					showNotification(message, 2000);
				}
			});
	}, [
		applyEdit,
		errorNotification,
		loadingNotification,
		onSuccess,
		setSelectedModal,
		symbolicatedStack,
	]);

	const disabled =
		!valid || submitting || (symbolicatedStack === null && !fallbackToRootFile);

	const {registerKeybinding} = useKeybinding();

	useEffect(() => {
		if (disabled) {
			return;
		}

		const enter = registerKeybinding({
			callback() {
				trigger();
			},
			commandCtrlKey: false,
			key: 'Enter',
			event: 'keydown',
			preventDefault: true,
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
		});
		return () => {
			enter.unregister();
		};
	}, [disabled, registerKeybinding, trigger, valid]);

	return (
		<CompositionEditFooterPresentation
			disabled={disabled}
			genericSubmitLabel={genericSubmitLabel}
			relativeFilePath={relativeFilePath}
			submitLabel={submitLabel}
			trigger={trigger}
		/>
	);
};
