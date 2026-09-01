import type {
	EditorPickerId,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo} from 'react';
import {AppLaunchButton} from '../../components/AppLaunchButton';
import type {ComboboxValue} from '../../components/NewComposition/ComboBox';
import {showNotification} from '../../components/Notifications/NotificationCenter';
import {useSettings} from '../../components/SettingsContext';
import {useConfigureDefaultApps} from '../../components/use-configure-default-apps';
import {openInEditor} from '../../helpers/open-in-editor';
import {useKeybinding} from '../../helpers/use-keybinding';
import {EditorIcon} from '../../icons/editor';
import {ShortcutHint} from './ShortcutHint';

const menuLabel: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '16px',
};

export const OpenInEditor: React.FC<{
	readonly stack: SymbolicatedStackFrame;
	readonly canHaveKeyboardShortcuts: boolean;
	readonly editorId: EditorPickerId;
	readonly editorName: string;
}> = ({stack, canHaveKeyboardShortcuts, editorId, editorName}) => {
	const {editorInfo} = useSettings();
	const configureDefaultApps = useConfigureDefaultApps();
	const {registerKeybinding} = useKeybinding();

	const openWithEditor = useCallback(
		async (selectedEditorId: EditorPickerId, selectedEditorName: string) => {
			try {
				const response = await openInEditor(stack, selectedEditorId);
				if (!response.success) {
					showNotification(`Could not open ${selectedEditorName}`, 2000);
				}
			} catch (err) {
				showNotification((err as Error).message, 2000);
			}
		},
		[stack],
	);

	const openPreferredEditor = useCallback(() => {
		openWithEditor(editorId, editorName).catch(() => undefined);
	}, [editorId, editorName, openWithEditor]);

	useEffect(() => {
		if (!canHaveKeyboardShortcuts) {
			return;
		}

		const {unregister} = registerKeybinding({
			event: 'keydown',
			key: 'o',
			callback: openPreferredEditor,
			commandCtrlKey: true,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		return () => unregister();
	}, [canHaveKeyboardShortcuts, openPreferredEditor, registerKeybinding]);

	const menuItems = useMemo((): ComboboxValue[] => {
		const alternativeEditors = (editorInfo?.installedEditors ?? []).filter(
			(editor) => editor.id !== editorId,
		);
		const editorItems: ComboboxValue[] = alternativeEditors.map((editor) => ({
			id: `open-in-${editor.id}`,
			keyHint: null,
			label: <span style={menuLabel}>{editor.nameWithType}</span>,
			leftItem: <EditorIcon editorId={editor.id} size={18} />,
			onClick: () => {
				openWithEditor(editor.id, editor.nameWithType).catch(() => undefined);
			},
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item',
			value: editor.id,
		}));

		return editorItems;
	}, [editorId, editorInfo?.installedEditors, openWithEditor]);

	return (
		<AppLaunchButton
			actionButtonId="error-overlay-open-in-editor"
			ariaLabel={`Open in ${editorName}`}
			disabled={false}
			menuAriaLabel="Open in another app"
			menuButtonId="error-overlay-open-in-another-app"
			menuItems={menuItems}
			onConfigureApps={configureDefaultApps}
			onClick={openPreferredEditor}
			size="default"
			style={null}
			title={`Open in ${editorName}`}
		>
			<EditorIcon editorId={editorId} size={14} />
			Open in {editorName}
			{canHaveKeyboardShortcuts ? (
				<ShortcutHint keyToPress="o" cmdOrCtrl />
			) : null}
		</AppLaunchButton>
	);
};
