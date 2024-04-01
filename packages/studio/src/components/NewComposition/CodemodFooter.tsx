import type {
	ProjectInfo,
	RecastCodemod,
	SimpleDiff,
} from '@remotion/studio-shared';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {ShortcutHint} from '../../error-overlay/remotion-overlay/ShortcutHint';
import {BLUE, BLUE_DISABLED} from '../../helpers/colors';
import {useKeybinding} from '../../helpers/use-keybinding';
import {ModalsContext} from '../../state/modals';
import {Button} from '../Button';
import {Flex, Row} from '../layout';
import {showNotification} from '../Notifications/NotificationCenter';
import {applyCodemod, getProjectInfo} from '../RenderQueue/actions';
import {CodemodDiffPreview} from './DiffPreview';

const buttonStyle: React.CSSProperties = {
	backgroundColor: BLUE,
	color: 'white',
};

export const CodemodFooter: React.FC<{
	valid: boolean;
	codemod: RecastCodemod;
	loadingNotification: React.ReactNode;
	succeessNotifcation: React.ReactNode;
	errorNotification: string;
	genericSubmitLabel: string;
	submitLabel: (options: {relativeRootPath: string}) => string;
}> = ({
	codemod,
	valid,
	loadingNotification,
	succeessNotifcation,
	errorNotification,
	genericSubmitLabel,
	submitLabel,
}) => {
	const [submitting, setSubmitting] = useState(false);
	const {setSelectedModal} = useContext(ModalsContext);
	const [canApplyCodemod, setCanApplyCodemod] = useState<SimpleDiff | null>(
		null,
	);

	const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		getProjectInfo(controller.signal)
			.then((info) => {
				setProjectInfo(info.projectInfo);
			})
			.catch((err) => {
				showNotification(
					`Could not get project info: ${err.message}. Unable to duplicate composition`,
					3000,
				);
			});

		return () => {
			controller.abort();
		};
	}, []);

	const trigger = useCallback(() => {
		setSubmitting(true);
		setSelectedModal(null);
		const notification = showNotification(loadingNotification, null);

		applyCodemod({
			codemod,
			dryRun: false,
			signal: new AbortController().signal,
		})
			.then(() => {
				notification.replaceContent(succeessNotifcation, 2000);
			})
			.catch((err) => {
				notification.replaceContent(
					`${errorNotification}: ${err.message}`,
					2000,
				);
			});
	}, [
		codemod,
		errorNotification,
		loadingNotification,
		setSelectedModal,
		succeessNotifcation,
	]);

	const getCanApplyCodemod = useCallback(
		async (signal: AbortSignal) => {
			const res = await applyCodemod({
				codemod,
				dryRun: true,
				signal,
			});

			if (!res.success) {
				throw new Error(res.reason);
			}

			setCanApplyCodemod(res.diff);
		},
		[codemod],
	);

	// TODO: Don't hide modal
	useEffect(() => {
		const abortController = new AbortController();
		let aborted = false;
		getCanApplyCodemod(abortController.signal)
			.then(() => undefined)
			.catch((err) => {
				if (aborted) {
					return;
				}

				setSelectedModal(null);
				showNotification(`Cannot duplicate composition: ${err.message}`, 3000);
			});

		return () => {
			aborted = true;
			abortController.abort();
		};
	}, [canApplyCodemod, getCanApplyCodemod, setSelectedModal]);

	const disabled =
		!valid || submitting || projectInfo === null || canApplyCodemod === null;

	const {registerKeybinding} = useKeybinding();

	useEffect(() => {
		if (disabled) {
			return;
		}

		const enter = registerKeybinding({
			callback() {
				trigger();
			},
			commandCtrlKey: true,
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
		<Row align="center">
			{canApplyCodemod ? <CodemodDiffPreview diff={canApplyCodemod} /> : null}
			<Flex />
			<Button
				onClick={trigger}
				disabled={disabled}
				style={{
					...buttonStyle,
					backgroundColor: disabled ? BLUE_DISABLED : BLUE,
				}}
			>
				{projectInfo && projectInfo.relativeRootFile
					? submitLabel({relativeRootPath: projectInfo.relativeRootFile})
					: genericSubmitLabel}
				<ShortcutHint keyToPress="↵" cmdOrCtrl />
			</Button>
		</Row>
	);
};
