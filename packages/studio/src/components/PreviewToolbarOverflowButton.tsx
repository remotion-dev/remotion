import type {SVGProps} from 'react';
import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {WHITE} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {Checkmark} from '../icons/Checkmark';
import {EllipsisIcon} from '../icons/ellipsis';
import {CheckerboardContext} from '../state/checkerboard';
import {EditorShowOutlinesContext} from '../state/editor-outlines';
import type {RenderInlineAction} from './InlineAction';
import {InlineDropdown} from './InlineDropdown';
import {toggleLoop} from './LoopToggle';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {usePlaybackRateMenuItems} from './PlaybackRateSelector';
import {usePreviewSizeMenuItems} from './SizeSelector';

const clickButton = (id: string) => {
	(document.getElementById(id) as HTMLButtonElement | null)?.click();
};

export const PreviewToolbarOverflowButton: React.FC<{
	readonly readOnlyStudio: boolean;
	readonly showFullscreen: boolean;
	readonly showPlaybackRate: boolean;
	readonly showLoop: boolean;
	readonly showCompositionControls: boolean;
	readonly playbackRate: number;
	readonly setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
	readonly loop: boolean;
	readonly setLoop: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
	readOnlyStudio,
	showFullscreen,
	showPlaybackRate,
	showLoop,
	showCompositionControls,
	playbackRate,
	setPlaybackRate,
	loop,
	setLoop,
}) => {
	const video = Internals.useVideo();
	const {checkerboard, setCheckerboard} = useContext(CheckerboardContext);
	const {editorShowOutlines, setEditorShowOutlines} = useContext(
		EditorShowOutlinesContext,
	);
	const {
		items: previewSizeItems,
		selectedId: selectedPreviewSize,
		zoomable,
	} = usePreviewSizeMenuItems();
	const {items: playbackRateItems, selectedId: selectedPlaybackRate} =
		usePlaybackRateMenuItems({playbackRate, setPlaybackRate});

	const iconStyle: SVGProps<SVGSVGElement> = useMemo(() => {
		return {
			style: {
				width: 14,
				height: 14,
				flexShrink: 0,
			},
		};
	}, []);

	const renderAction: RenderInlineAction = useCallback(
		(color) => <EllipsisIcon fill={color} svgProps={iconStyle} />,
		[iconStyle],
	);

	const renderItems = useMemo((): ComboboxValue[] => {
		if (readOnlyStudio) {
			return [
				{
					type: 'item',
					id: 'client-render',
					label: 'Render on web',
					value: 'client-render',
					onClick: () => clickButton('render-modal-button-client'),
					keyHint: null,
					leftItem: null,
					subMenu: null,
					quickSwitcherLabel: null,
				},
				{
					type: 'item',
					id: 'render-command',
					label: 'Render via CLI',
					value: 'render-command',
					onClick: () => clickButton('render-modal-button-command'),
					keyHint: null,
					leftItem: null,
					subMenu: null,
					quickSwitcherLabel: null,
				},
			];
		}

		return [
			{
				type: 'item',
				id: 'server-render',
				label: 'Server-side render',
				value: 'server-render',
				onClick: () => clickButton('render-modal-button-server'),
				keyHint: null,
				leftItem: null,
				subMenu: null,
				quickSwitcherLabel: null,
			},
			{
				type: 'item',
				id: 'client-render',
				label: 'Client-side render',
				value: 'client-render',
				onClick: () => clickButton('render-modal-button-client'),
				keyHint: null,
				leftItem: null,
				subMenu: null,
				quickSwitcherLabel: null,
			},
		];
	}, [readOnlyStudio]);

	const values = useMemo((): ComboboxValue[] => {
		const items: ComboboxValue[] = [];

		if (zoomable) {
			items.push({
				type: 'item',
				id: 'preview-size',
				label: 'Preview Size',
				value: 'preview-size',
				onClick: () => undefined,
				keyHint: null,
				leftItem: null,
				subMenu: {
					items: previewSizeItems,
					leaveLeftSpace: true,
					preselectIndex: previewSizeItems.findIndex(
						(item) => item.id === selectedPreviewSize,
					),
				},
				quickSwitcherLabel: null,
			});
		}

		if (showPlaybackRate) {
			items.push({
				type: 'item',
				id: 'playback-rate',
				label: 'Playback Rate',
				value: 'playback-rate',
				onClick: () => undefined,
				keyHint: null,
				leftItem: null,
				subMenu: {
					items: playbackRateItems,
					leaveLeftSpace: true,
					preselectIndex: playbackRateItems.findIndex(
						(item) => item.id === selectedPlaybackRate,
					),
				},
				quickSwitcherLabel: null,
			});
		}

		if (showLoop) {
			items.push({
				type: 'item',
				id: 'loop',
				label: 'Loop',
				value: 'loop',
				onClick: () => toggleLoop(setLoop),
				keyHint: null,
				leftItem: loop ? <Checkmark /> : null,
				subMenu: null,
				quickSwitcherLabel: null,
			});
		}

		if (showCompositionControls) {
			items.push({
				type: 'item',
				id: 'checkerboard',
				label: 'Transparency as checkerboard',
				value: 'checkerboard',
				onClick: () => setCheckerboard((current) => !current),
				keyHint: areKeyboardShortcutsDisabled() ? null : 'T',
				leftItem: checkerboard ? <Checkmark /> : null,
				subMenu: null,
				quickSwitcherLabel: null,
			});
			items.push({
				type: 'item',
				id: 'outlines',
				label: 'Outlines',
				value: 'outlines',
				onClick: () => setEditorShowOutlines((current) => !current),
				keyHint: null,
				leftItem: editorShowOutlines ? <Checkmark /> : null,
				subMenu: null,
				quickSwitcherLabel: null,
			});
		}

		if (showFullscreen) {
			items.push({
				type: 'item',
				id: 'fullscreen',
				label: 'Fullscreen',
				value: 'fullscreen',
				onClick: () => clickButton('fullscreen-toggle'),
				keyHint: areKeyboardShortcutsDisabled() ? null : 'F',
				leftItem: null,
				subMenu: null,
				quickSwitcherLabel: null,
			});
		}

		if (video) {
			items.push({
				type: 'item',
				id: 'render',
				label: 'Render',
				value: 'render',
				onClick: () => undefined,
				keyHint: null,
				leftItem: null,
				subMenu: {
					items: renderItems,
					leaveLeftSpace: false,
					preselectIndex: 0,
				},
				quickSwitcherLabel: null,
			});
		}

		return items;
	}, [
		previewSizeItems,
		playbackRateItems,
		renderItems,
		selectedPlaybackRate,
		selectedPreviewSize,
		showFullscreen,
		showLoop,
		showPlaybackRate,
		showCompositionControls,
		loop,
		checkerboard,
		editorShowOutlines,
		setCheckerboard,
		setEditorShowOutlines,
		setLoop,
		video,
		zoomable,
	]);

	if (values.length === 0) {
		return null;
	}

	return (
		<InlineDropdown
			variant={null}
			renderAction={renderAction}
			values={values}
			title="More actions"
			unhoveredColor={WHITE}
		/>
	);
};
