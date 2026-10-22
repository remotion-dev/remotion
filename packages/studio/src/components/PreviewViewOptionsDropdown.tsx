import React, {useContext, useMemo} from 'react';
import {WHITE_ALPHA_80} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {useKeyboardShortcutLabel} from '../helpers/use-keyboard-shortcut-label';
import {CaretDown} from '../icons/caret';
import {Checkmark} from '../icons/Checkmark';
import {EditorShowGuidesContext} from '../state/editor-guides';
import {EditorShowOutlinesContext} from '../state/editor-outlines';
import {EditorShowPixelGridContext} from '../state/editor-pixel-grid';
import {EditorShowRulersContext} from '../state/editor-rulers';
import {ActionTooltip} from './ActionTooltip';
import {InlineDropdown} from './InlineDropdown';
import type {ComboboxValue} from './NewComposition/ComboBox';

export const PreviewViewOptionsDropdown: React.FC<{
	readonly showCompositionControls: boolean;
}> = ({showCompositionControls}) => {
	const {editorShowOutlines, setEditorShowOutlines} = useContext(
		EditorShowOutlinesContext,
	);
	const {editorShowRulers, setEditorShowRulers} = useContext(
		EditorShowRulersContext,
	);
	const {editorShowGuides, setEditorShowGuides} = useContext(
		EditorShowGuidesContext,
	);
	const {editorShowPixelGrid, setEditorShowPixelGrid} = useContext(
		EditorShowPixelGridContext,
	);
	const shortcutsDisabled = areKeyboardShortcutsDisabled();
	const outlinesShortcut = useKeyboardShortcutLabel('toggleOutlines');
	const rulersAndGuidesShortcut = useKeyboardShortcutLabel(
		'toggleRulersAndGuides',
	);
	const pixelGridShortcut = useKeyboardShortcutLabel('togglePixelGrid');

	const values = useMemo((): ComboboxValue[] => {
		const items: ComboboxValue[] = [];
		if (showCompositionControls) {
			items.push({
				type: 'item',
				id: 'outlines',
				label: 'Outlines',
				value: 'outlines',
				onClick: () => setEditorShowOutlines((current) => !current),
				keyHint: shortcutsDisabled ? null : outlinesShortcut || null,
				leftItem: editorShowOutlines ? <Checkmark /> : null,
				subMenu: null,
				quickSwitcherLabel: null,
			});
		}

		const rulersOrGuidesAreVisible =
			editorShowRulers || (showCompositionControls && editorShowGuides);
		items.push({
			type: 'item',
			id: 'rulers-and-guides',
			label: showCompositionControls ? 'Rulers and Guides' : 'Rulers',
			value: 'rulers-and-guides',
			onClick: () => {
				setEditorShowRulers(() => !rulersOrGuidesAreVisible);
				if (showCompositionControls) {
					setEditorShowGuides(() => !rulersOrGuidesAreVisible);
				}
			},
			keyHint: shortcutsDisabled ? null : rulersAndGuidesShortcut || null,
			leftItem: rulersOrGuidesAreVisible ? <Checkmark /> : null,
			subMenu: null,
			quickSwitcherLabel: null,
		});

		items.push({
			type: 'item',
			id: 'pixel-grid',
			label: 'Pixel Grid',
			value: 'pixel-grid',
			onClick: () => setEditorShowPixelGrid((current) => !current),
			keyHint: shortcutsDisabled ? null : pixelGridShortcut || null,
			leftItem: editorShowPixelGrid ? <Checkmark /> : null,
			subMenu: null,
			quickSwitcherLabel: null,
		});

		return items;
	}, [
		editorShowGuides,
		editorShowOutlines,
		editorShowPixelGrid,
		editorShowRulers,
		outlinesShortcut,
		pixelGridShortcut,
		rulersAndGuidesShortcut,
		setEditorShowGuides,
		setEditorShowOutlines,
		setEditorShowPixelGrid,
		setEditorShowRulers,
		shortcutsDisabled,
		showCompositionControls,
	]);

	return (
		<ActionTooltip
			label="View options"
			shortcut={null}
			delay={800}
			dismissOnClick
		>
			<InlineDropdown
				variant={null}
				style={{width: 20}}
				renderAction={(color) => <CaretDown color={color} />}
				values={values}
				aria-label="View options"
				unhoveredColor={WHITE_ALPHA_80}
			/>
		</ActionTooltip>
	);
};
