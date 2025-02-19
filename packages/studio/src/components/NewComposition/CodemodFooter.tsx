import type {ProjectInfo, RecastCodemod} from '@remotion/studio-shared';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {ShortcutHint} from '../../error-overlay/remotion-overlay/ShortcutHint';
import {useKeybinding} from '../../helpers/use-keybinding';
import {ModalsContext} from '../../state/modals';
import {ModalButton} from '../ModalButton';
import {showNotification} from '../Notifications/NotificationCenter';
import {applyCodemod, getProjectInfo} from '../RenderQueue/actions';
import {Flex, Row, Spacing} from '../layout';
import type {CodemodStatus} from './DiffPreview';
import {CodemodDiffPreview} from './DiffPreview';

export const CodemodFooter: React.FC<{
	readonly valid: boolean;
	readonly codemod: RecastCodemod;
	readonly loadingNotification: React.ReactNode;
	readonly succeessNotifcation: React.ReactNode;
	readonly errorNotification: string;
	readonly genericSubmitLabel: string;
	readonly submitLabel: (options: {relativeRootPath: string}) => string;
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
	const [codemodStatus, setCanApplyCodemod] = useState<CodemodStatus>({
		type: 'loading',
	});

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

			if (res.success) {
				setCanApplyCodemod({type: 'success', diff: res.diff});
			} else {
				setCanApplyCodemod({
					type: 'fail',
					error: res.reason,
				});
			}
		},
		[codemod],
	);

	useEffect(() => {
		const abortController = new AbortController();
		let aborted = false;
		getCanApplyCodemod(abortController.signal)
			.then(() => undefined)
			.catch((err) => {
				if (aborted) {
					return;
				}

				showNotification(`Cannot duplicate composition: ${err.message}`, 3000);
			});

		return () => {
			aborted = true;
			abortController.abort();
		};
	}, [codemodStatus, getCanApplyCodemod, setSelectedModal]);

	const disabled =
		!valid ||
		submitting ||
		projectInfo === null ||
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
			<CodemodDiffPreview status={codemodStatus} />
			<Flex />
			<Spacing block x={2} />
			<ModalButton onClick={trigger} disabled={disabled}>
				{projectInfo && projectInfo.relativeRootFile
					? submitLabel({relativeRootPath: projectInfo.relativeRootFile})
					: genericSubmitLabel}
				<ShortcutHint keyToPress="↵" cmdOrCtrl />
			</ModalButton>
		</Row>
	);
};
