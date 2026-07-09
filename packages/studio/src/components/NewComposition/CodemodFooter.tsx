import type {
	ApplyCodemodResponse,
	RecastCodemod,
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
import {resolvedStackToSymbolicated} from '../../helpers/resolved-stack-to-symbolicated';
import {useKeybinding} from '../../helpers/use-keybinding';
import {ModalsContext} from '../../state/modals';
import {Flex, Row, Spacing} from '../layout';
import {ModalButton} from '../ModalButton';
import {showNotification} from '../Notifications/NotificationCenter';
import {applyCodemod as applyCodemodApi} from '../RenderQueue/actions';
import {
	hasResolvedStack,
	useResolvedStack,
} from '../Timeline/use-resolved-stack';
import type {CodemodStatus} from './DiffPreview';
import {CodemodDiffPreview} from './DiffPreview';

type ApplyCodemodAction = (options: {
	signal: AbortSignal;
	symbolicatedStack: SymbolicatedStackFrame | null;
}) => Promise<ApplyCodemodResponse>;

const CodemodFooterPresentation: React.FC<{
	readonly codemodStatus: CodemodStatus;
	readonly disabled: boolean;
	readonly genericSubmitLabel: string;
	readonly relativeFilePath: string | null;
	readonly submitLabel: (options: {relativeRootPath: string}) => string;
	readonly trigger: () => void;
}> = ({
	codemodStatus,
	disabled,
	genericSubmitLabel,
	relativeFilePath,
	submitLabel,
	trigger,
}) => {
	return (
		<Row align="center">
			<CodemodDiffPreview status={codemodStatus} />
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

export const CodemodFooter: React.FC<{
	readonly valid: boolean;
	readonly codemod: RecastCodemod;
	readonly stack: string | null;
	readonly loadingNotification: React.ReactNode;
	readonly successNotification: React.ReactNode;
	readonly errorNotification: string;
	readonly genericSubmitLabel: string;
	readonly submitLabel: (options: {relativeRootPath: string}) => string;
	readonly onSuccess: (() => void) | null;
	readonly fallbackToRootFile?: boolean;
	readonly applyCodemod: ApplyCodemodAction;
}> = ({
	codemod,
	stack,
	valid,
	loadingNotification,
	successNotification,
	errorNotification,
	genericSubmitLabel,
	submitLabel,
	onSuccess,
	fallbackToRootFile = false,
	applyCodemod,
}) => {
	const [submitting, setSubmitting] = useState(false);
	const {setSelectedModal} = useContext(ModalsContext);
	const [codemodStatus, setCanApplyCodemod] = useState<CodemodStatus>({
		type: 'loading',
	});

	const resolvedLocation = useResolvedStack(stack);
	const symbolicatedStack = useMemo(
		() => resolvedStackToSymbolicated(resolvedLocation),
		[resolvedLocation],
	);

	const relativeFilePath = symbolicatedStack?.originalFileName ?? null;

	const trigger = useCallback(() => {
		setSubmitting(true);
		setSelectedModal(null);
		const notification = showNotification(loadingNotification, null);

		applyCodemod({
			symbolicatedStack,
			signal: new AbortController().signal,
		})
			.then((result) => {
				if (!result.success) {
					notification.replaceContent(
						`${errorNotification}: ${result.reason}`,
						2000,
					);
					return;
				}

				notification.replaceContent(successNotification, 2000);
				onSuccess?.();
			})
			.catch((err) => {
				notification.replaceContent(
					`${errorNotification}: ${(err as Error).message}`,
					2000,
				);
			});
	}, [
		applyCodemod,
		errorNotification,
		loadingNotification,
		onSuccess,
		setSelectedModal,
		successNotification,
		symbolicatedStack,
	]);

	const getCanApplyCodemod = useCallback(
		async (signal: AbortSignal) => {
			const res = await applyCodemodApi({
				codemod,
				dryRun: true,
				symbolicatedStack,
				signal,
			});

			if (res.success) {
				setCanApplyCodemod({type: 'success', diff: res.diff});
			} else {
				setCanApplyCodemod({
					type: 'fail',
					error: res.reason,
				});
			}
		},
		[codemod, symbolicatedStack],
	);

	useEffect(() => {
		if (!stack) {
			if (fallbackToRootFile) {
				const rootFileAbortController = new AbortController();
				let rootFileAborted = false;
				getCanApplyCodemod(rootFileAbortController.signal)
					.then(() => undefined)
					.catch((err) => {
						if (rootFileAborted) {
							return;
						}

						showNotification(
							`${errorNotification}: ${(err as Error).message}`,
							3000,
						);
					});

				return () => {
					rootFileAborted = true;
					rootFileAbortController.abort();
				};
			}

			setCanApplyCodemod({
				type: 'fail',
				error: 'Could not determine where this item is defined',
			});
			return;
		}

		if (!hasResolvedStack(stack)) {
			return;
		}

		if (!symbolicatedStack) {
			setCanApplyCodemod({
				type: 'fail',
				error: 'Could not resolve the source location of this item',
			});
			return;
		}

		const abortController = new AbortController();
		let aborted = false;
		getCanApplyCodemod(abortController.signal)
			.then(() => undefined)
			.catch((err) => {
				if (aborted) {
					return;
				}

				showNotification(
					`${errorNotification}: ${(err as Error).message}`,
					3000,
				);
			});

		return () => {
			aborted = true;
			abortController.abort();
		};
	}, [
		errorNotification,
		fallbackToRootFile,
		getCanApplyCodemod,
		stack,
		symbolicatedStack,
	]);

	const disabled =
		!valid ||
		submitting ||
		(symbolicatedStack === null && !fallbackToRootFile) ||
		codemodStatus.type !== 'success';

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
		<CodemodFooterPresentation
			codemodStatus={codemodStatus}
			disabled={disabled}
			genericSubmitLabel={genericSubmitLabel}
			relativeFilePath={relativeFilePath}
			submitLabel={submitLabel}
			trigger={trigger}
		/>
	);
};
