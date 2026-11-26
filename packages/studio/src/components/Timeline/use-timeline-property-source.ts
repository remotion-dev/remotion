import {useCallback} from 'react';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {formatContextForAgents} from '../../helpers/format-file-location';
import {
	openSourceInEditor,
	resolveSourceLocation,
} from '../../helpers/open-in-editor';
import {getSourceDoubleClickHandler} from '../get-source-double-click-handler';
import {useSettings} from '../SettingsContext';
import {
	useDefaultCodingAgentInfo,
	useEditorOpening,
} from '../use-default-editor-info';

export const useTimelinePropertySource = ({
	effectIndex,
	location,
	previewServerConnected,
	property,
}: {
	readonly effectIndex: number | null;
	readonly location: CodePosition;
	readonly previewServerConnected: boolean;
	readonly property: string;
}) => {
	const {canConfigureApps, defaultEditorId} = useEditorOpening(
		previewServerConnected,
	);
	const codingAgentInfo = useDefaultCodingAgentInfo(canConfigureApps);
	const {doubleClickAction} = useSettings();
	const getContextForAgents = useCallback(async () => {
		const sourceLocation =
			previewServerConnected || window.remotion_isReadOnlyStudio
				? await resolveSourceLocation({
						originalPosition: location,
						property,
						effectIndex,
					}).catch(() => location)
				: location;
		return formatContextForAgents({
			location: sourceLocation,
			name:
				effectIndex === null
					? `Property "${property}"`
					: `Effect property "${property}"`,
			root: window.remotion_cwd,
		});
	}, [effectIndex, location, previewServerConnected, property]);

	const onPropertyDoubleClick = useCallback<
		React.MouseEventHandler<HTMLDivElement>
	>(
		(event) => {
			const handle = getSourceDoubleClickHandler({
				codingAgentInfo,
				doubleClickAction,
				getContextForAgents,
				openSource:
					defaultEditorId === null
						? null
						: () =>
								openSourceInEditor({
									editorId: defaultEditorId,
									originalPosition: location,
									property,
									effectIndex,
								}),
			});
			if (handle) {
				event.stopPropagation();
				handle();
			}
		},
		[
			codingAgentInfo,
			defaultEditorId,
			doubleClickAction,
			effectIndex,
			getContextForAgents,
			location,
			property,
		],
	);

	return {getContextForAgents, onPropertyDoubleClick};
};
