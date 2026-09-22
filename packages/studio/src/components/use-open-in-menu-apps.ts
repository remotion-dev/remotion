import type {
	EditorPickerId,
	GetDefaultCodingAgentInfoResponse,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import {useContext, useMemo} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {useConfigureDefaultApps} from './use-configure-default-apps';
import {
	useDefaultCodingAgentInfo,
	useEditorOpening,
} from './use-default-editor-info';

export type OpenInMenuApps = {
	readonly canOpenDesktopApps: boolean;
	readonly canOpenInEditor: boolean;
	readonly codingAgentInfo: GetDefaultCodingAgentInfoResponse | null;
	readonly defaultEditorId: EditorPickerId | null;
	readonly defaultEditorName: string | null;
	readonly editorInfo: GetDefaultEditorInfoResponse | null;
	readonly onConfigureApps: (() => void) | null;
};

export const useOpenInMenuApps = () => {
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const {
		canConfigureApps,
		canOpenInEditor,
		defaultEditorId,
		defaultEditorName,
		editorInfo,
	} = useEditorOpening(connectionStatus === 'connected');
	const codingAgentInfo = useDefaultCodingAgentInfo(canConfigureApps);
	const onConfigureApps = useConfigureDefaultApps();
	const openInApps = useMemo(
		(): OpenInMenuApps => ({
			canOpenDesktopApps: canConfigureApps,
			canOpenInEditor,
			codingAgentInfo,
			defaultEditorId,
			defaultEditorName,
			editorInfo,
			onConfigureApps,
		}),
		[
			canOpenInEditor,
			canConfigureApps,
			codingAgentInfo,
			defaultEditorId,
			defaultEditorName,
			editorInfo,
			onConfigureApps,
		],
	);

	return {connectionStatus, openInApps};
};
