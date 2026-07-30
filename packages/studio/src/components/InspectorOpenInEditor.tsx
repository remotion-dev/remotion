import type {
	EditorPickerId,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	getBackgroundFromHoverState,
} from '../helpers/colors';
import {openOriginalPositionInEditor} from '../helpers/open-in-editor';
import {CaretDown} from '../icons/caret';
import {EditorIcon} from '../icons/editor';
import {GearIcon} from '../icons/gear';
import {ModalsContext} from '../state/modals';
import {useZIndex} from '../state/z-index';
import {callApi} from './call-api';
import type {RenderInlineAction} from './InlineAction';
import {InlineDropdown} from './InlineDropdown';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';

const splitButton: React.CSSProperties = {
	alignItems: 'center',
	display: 'inline-flex',
	flexDirection: 'row',
	flexShrink: 0,
	height: 24,
};

const mainButtonBase: React.CSSProperties = {
	alignItems: 'center',
	background: TRANSPARENT,
	border: 'none',
	borderRadius: 3,
	color: LIGHT_TEXT,
	display: 'inline-flex',
	fontFamily: 'sans-serif',
	fontSize: 11,
	gap: 5,
	height: 24,
	lineHeight: '14px',
	padding: '0 6px',
	whiteSpace: 'nowrap',
};

const label: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'inherit',
	fontSize: 'inherit',
	lineHeight: 'inherit',
};

const menuLabel: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '16px',
};

const gearStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	flexShrink: 0,
	height: 12,
	width: 12,
};

const getPreferredEditorId = (
	editorInfo: GetDefaultEditorInfoResponse | null,
) => {
	return (
		editorInfo?.installedEditors.find(
			(editor) => editor.name === window.remotion_editorName,
		)?.id ?? null
	);
};

export const InspectorOpenInEditor: React.FC<{
	readonly location: OriginalPosition | null;
}> = ({location}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {setSelectedModal} = useContext(ModalsContext);
	const {tabIndex} = useZIndex();
	const [hovered, setHovered] = useState(false);
	const [editorInfo, setEditorInfo] =
		useState<GetDefaultEditorInfoResponse | null>(null);
	const canUseEditorPicker =
		previewServerState.type === 'connected' &&
		!window.remotion_isReadOnlyStudio &&
		getBrowserStudioOperations() === null;

	useEffect(() => {
		if (!canUseEditorPicker) {
			return;
		}

		const controller = new AbortController();
		callApi('/api/default-editor-info', {}, controller.signal)
			.then(setEditorInfo)
			.catch(() => undefined);

		return () => controller.abort();
	}, [canUseEditorPicker]);

	const openWithEditor = useCallback(
		async (editorId?: EditorPickerId) => {
			if (!location) {
				return;
			}

			try {
				await openOriginalPositionInEditor(location, editorId);
			} catch (err) {
				showNotification((err as Error).message, 2000);
			}
		},
		[location],
	);

	const preferredEditorId = getPreferredEditorId(editorInfo);
	const editorName = window.remotion_editorName ?? 'default editor';
	const canOpenDefault =
		location !== null && window.remotion_editorName !== null;
	const onOpenDefault: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		(event) => {
			event.stopPropagation();
			openWithEditor().catch(() => undefined);
		},
		[openWithEditor],
	);
	const mainButtonStyle = useMemo((): React.CSSProperties => {
		return {
			...mainButtonBase,
			background: getBackgroundFromHoverState({
				hovered,
				selected: false,
			}),
			color: hovered ? WHITE : LIGHT_TEXT,
			opacity: canOpenDefault ? 1 : 0.5,
			pointerEvents: canOpenDefault ? 'auto' : 'none',
		};
	}, [canOpenDefault, hovered]);
	const renderDropdownAction: RenderInlineAction = useCallback((color) => {
		return <CaretDown color={color} small />;
	}, []);
	const menuItems = useMemo((): ComboboxValue[] => {
		const alternateEditors: ComboboxValue[] = (
			editorInfo?.installedEditors ?? []
		)
			.filter((editor) => editor.id !== preferredEditorId)
			.map((editor) => ({
				id: `open-in-${editor.id}`,
				keyHint: null,
				label: <span style={menuLabel}>{editor.name}</span>,
				leftItem: <EditorIcon editorId={editor.id} />,
				onClick: () => {
					openWithEditor(editor.id).catch(() => undefined);
				},
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item' as const,
				value: editor.id,
			}));
		const settingsItems: ComboboxValue[] = [
			...(alternateEditors.length > 0
				? [{type: 'divider' as const, id: 'editor-settings-divider'}]
				: []),
			{
				id: 'set-default-editor',
				keyHint: null,
				label: <span style={menuLabel}>Set default editor...</span>,
				leftItem: <GearIcon style={gearStyle} />,
				onClick: () => {
					setSelectedModal({type: 'configure-default-editor'});
				},
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item' as const,
				value: 'set-default-editor',
			},
		];

		return [...alternateEditors, ...settingsItems];
	}, [
		editorInfo?.installedEditors,
		openWithEditor,
		preferredEditorId,
		setSelectedModal,
	]);

	if (!canUseEditorPicker) {
		return null;
	}

	return (
		<div style={splitButton}>
			<button
				aria-label={`Open in ${editorName}`}
				disabled={!canOpenDefault}
				onClick={onOpenDefault}
				onPointerEnter={() => setHovered(true)}
				onPointerLeave={() => setHovered(false)}
				style={mainButtonStyle}
				tabIndex={tabIndex}
				title={`Open in ${editorName}`}
				type="button"
			>
				<EditorIcon editorId={preferredEditorId} />
				<span style={label}>Open in</span>
			</button>
			<InlineDropdown
				renderAction={renderDropdownAction}
				title="Open in another editor"
				values={menuItems}
			/>
		</div>
	);
};
