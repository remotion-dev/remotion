import type {EditorPickerId} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';
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
import {SetSelectedModalContext} from '../state/modals';
import {useZIndex} from '../state/z-index';
import type {RenderInlineAction} from './InlineAction';
import {InlineDropdown} from './InlineDropdown';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {
	canUseEditorPicker,
	getPreferredEditorId,
	useDefaultEditorInfo,
} from './use-default-editor-info';

const splitButton: React.CSSProperties = {
	alignItems: 'center',
	borderRadius: 3,
	display: 'inline-flex',
	flexDirection: 'row',
	flexShrink: 0,
	gap: 1,
	height: 24,
	overflow: 'hidden',
};

const mainButtonBase: React.CSSProperties = {
	alignItems: 'center',
	background: TRANSPARENT,
	border: 'none',
	borderRadius: '3px 0 0 3px',
	color: LIGHT_TEXT,
	columnGap: 4,
	display: 'inline-flex',
	fontFamily: 'sans-serif',
	fontSize: 11,
	height: 24,
	lineHeight: '14px',
	padding: '0 6px',
	whiteSpace: 'nowrap',
};

const menuLabel: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '16px',
};

const editorButtonIconSize = 18;
const editorMenuIconSize = 18;

export const InspectorOpenInEditor: React.FC<{
	readonly location: OriginalPosition | null;
	readonly label?: React.ReactNode;
}> = ({label, location}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {tabIndex} = useZIndex();
	const [hovered, setHovered] = useState(false);
	const [dropdownOpened, setDropdownOpened] = useState(false);
	const editorPickerAvailable = canUseEditorPicker(
		previewServerState.type === 'connected',
	);
	const editorInfo = useDefaultEditorInfo(editorPickerAvailable);

	const openWithEditor = useCallback(
		async (editorId: EditorPickerId | null) => {
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
			openWithEditor(null).catch(() => undefined);
		},
		[openWithEditor],
	);
	const mainHovered = hovered && !dropdownOpened;
	const mainButtonStyle = useMemo((): React.CSSProperties => {
		return {
			...mainButtonBase,
			background: getBackgroundFromHoverState({
				hovered: mainHovered,
				selected: false,
			}),
			color: mainHovered ? WHITE : LIGHT_TEXT,
			opacity: canOpenDefault ? 1 : 0.5,
			pointerEvents: canOpenDefault ? 'auto' : 'none',
		};
	}, [canOpenDefault, mainHovered]);
	const dropdownForegroundColor =
		hovered || dropdownOpened ? WHITE : LIGHT_TEXT;
	const dropdownStyle = useMemo((): React.CSSProperties => {
		return {
			background: getBackgroundFromHoverState({
				hovered,
				selected: dropdownOpened,
			}),
			borderRadius: '0 3px 3px 0',
			color: dropdownForegroundColor,
		};
	}, [dropdownForegroundColor, dropdownOpened, hovered]);
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
				leftItem: <EditorIcon editorId={editor.id} size={editorMenuIconSize} />,
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
				leftItem: null,
				onClick: () => {
					setSelectedModal({
						type: 'settings',
						initialTab: 'apps',
						initialPublicLicenseKey:
							window.remotion_renderDefaults?.publicLicenseKey ?? null,
					});
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

	if (!editorPickerAvailable) {
		return null;
	}

	return (
		<div
			style={splitButton}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
		>
			<button
				aria-label={`Open in ${editorName}`}
				disabled={!canOpenDefault}
				onClick={onOpenDefault}
				style={mainButtonStyle}
				tabIndex={tabIndex}
				title={`Open in ${editorName}`}
				type="button"
			>
				{label}
				<EditorIcon editorId={preferredEditorId} size={editorButtonIconSize} />
			</button>
			<InlineDropdown
				onOpenChange={setDropdownOpened}
				renderAction={renderDropdownAction}
				style={dropdownStyle}
				title="Open in another editor"
				unhoveredColor={dropdownForegroundColor}
				values={menuItems}
				variant="compact"
			/>
		</div>
	);
};
