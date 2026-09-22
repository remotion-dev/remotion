import type {DefaultCodingAgent} from '@remotion/renderer';
import type {
	EditorPickerId,
	GetDefaultCodingAgentInfoResponse,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import type {ResolvedStackLocation, TSequence} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {formatContextForAgents} from '../../helpers/format-file-location';
import {
	getDefaultOpenInTarget,
	getGitSourceName,
	openGitSource,
} from '../../helpers/get-git-menu-item';
import {getOpenInMenuItems} from '../get-open-in-menu-items';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {openInFileExplorer} from '../RenderQueue/actions';
import {getPreferredEditorId} from '../use-default-editor-info';
import {getCopyContextForAgentsMenuItem} from './get-copy-context-for-agents-menu-item';
import type {TimelineAssetLinkInfo} from './timeline-asset-link';
import {openTimelineAssetLink} from './timeline-asset-link';

const normalizeMenuDividers = (items: ComboboxValue[]): ComboboxValue[] => {
	const normalized: ComboboxValue[] = [];

	for (const item of items) {
		if (item.type === 'divider') {
			const previousItem = normalized[normalized.length - 1];
			if (!previousItem || previousItem.type === 'divider') {
				continue;
			}
		}

		normalized.push(item);
	}

	if (normalized[normalized.length - 1]?.type === 'divider') {
		normalized.pop();
	}

	return normalized;
};

const interactiveSvgComponentIdentity = 'dev.remotion.remotion.Interactive.Svg';

export const findCopyableFrameElement = (
	element: Element | null,
): Element | null => {
	if (element?.tagName === 'CANVAS' || element?.tagName === 'VIDEO') {
		return element;
	}

	return element?.querySelector('canvas, video') ?? null;
};

const copyImageToClipboard = async (element: Element): Promise<void> => {
	let canvas: HTMLCanvasElement;

	if (element.tagName === 'CANVAS') {
		const sourceCanvas = element as HTMLCanvasElement;
		canvas = document.createElement('canvas');
		canvas.width = sourceCanvas.width;
		canvas.height = sourceCanvas.height;
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not create canvas context');
		}

		context.drawImage(sourceCanvas, 0, 0);
	} else if (element.tagName === 'IMG') {
		const image = element as HTMLImageElement;
		if (image.naturalWidth === 0 || image.naturalHeight === 0) {
			throw new Error('Image has not loaded');
		}

		canvas = document.createElement('canvas');
		canvas.width = image.naturalWidth;
		canvas.height = image.naturalHeight;
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not create canvas context');
		}

		context.drawImage(image, 0, 0);
	} else if (element.tagName === 'VIDEO') {
		const video = element as HTMLVideoElement;
		if (video.videoWidth === 0 || video.videoHeight === 0) {
			throw new Error('Video frame has not loaded');
		}

		canvas = document.createElement('canvas');
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not create canvas context');
		}

		context.drawImage(video, 0, 0);
	} else {
		throw new Error('Expected an image, video, or canvas element');
	}

	const blob = new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((result) => {
			if (result) {
				resolve(result);
			} else {
				reject(new Error('Could not convert image to PNG'));
			}
		}, 'image/png');
	});

	await navigator.clipboard.write([
		new ClipboardItem({
			'image/png': blob,
		}),
	]);
};

export const getMultiSequenceContextMenuItems = ({
	deleteDisabled,
	duplicateDisabled,
	splitDisabled,
	onDeleteSelectedSequences,
	onDuplicateSelectedSequences,
	onSplitSelectedSequences,
}: {
	readonly deleteDisabled: boolean;
	readonly duplicateDisabled: boolean;
	readonly splitDisabled: boolean;
	readonly onDeleteSelectedSequences: () => void;
	readonly onDuplicateSelectedSequences: () => void;
	readonly onSplitSelectedSequences: () => void;
}): ComboboxValue[] => {
	return [
		{
			type: 'item',
			id: 'duplicate-selected-sequences',
			keyHint: null,
			label: 'Duplicate selected',
			leftItem: null,
			disabled: duplicateDisabled,
			onClick: onDuplicateSelectedSequences,
			quickSwitcherLabel: null,
			subMenu: null,
			value: 'duplicate-selected-sequences',
		},
		{
			type: 'item',
			id: 'split-selected-sequences',
			keyHint: null,
			label: 'Split selected at playhead',
			leftItem: null,
			disabled: splitDisabled,
			onClick: onSplitSelectedSequences,
			quickSwitcherLabel: null,
			subMenu: null,
			value: 'split-selected-sequences',
		},
		{
			type: 'divider',
			id: 'duplicate-delete-selected-sequences-divider',
		},
		{
			type: 'item',
			id: 'delete-selected-sequences',
			keyHint: null,
			label: 'Delete selected',
			leftItem: null,
			disabled: deleteDisabled,
			onClick: onDeleteSelectedSequences,
			quickSwitcherLabel: null,
			subMenu: null,
			value: 'delete-selected-sequences',
		},
	];
};

export const getSequenceContextMenuItems = ({
	assetLinkInfo,
	canOpenInEditor,
	copyImageElement,
	deleteDisabled,
	disableInteractivityDisabled,
	duplicateDisabled,
	isProgrammaticallyDuplicated,
	includeSourceEditItems,
	codingAgentInfo,
	editorInfo,
	onConfigureApps,
	onDeleteSequenceFromSource,
	onDisableSequenceInteractivity,
	onDuplicateSequenceFromSource,
	openInCodingAgent,
	openInEditor,
	originalLocation,
	selectAsset,
	sequence,
	sourceActions = [],
}: {
	readonly assetLinkInfo: TimelineAssetLinkInfo | null;
	readonly canOpenInEditor: boolean;
	readonly copyImageElement: Element | null;
	readonly deleteDisabled: boolean;
	readonly disableInteractivityDisabled: boolean;
	readonly duplicateDisabled: boolean;
	readonly isProgrammaticallyDuplicated: boolean;
	readonly includeSourceEditItems: boolean;
	readonly codingAgentInfo: GetDefaultCodingAgentInfoResponse | null;
	readonly editorInfo: GetDefaultEditorInfoResponse | null;
	readonly onConfigureApps: (() => void) | null;
	readonly onDeleteSequenceFromSource: () => void;
	readonly onDisableSequenceInteractivity: () => void;
	readonly onDuplicateSequenceFromSource: () => void;
	readonly openInCodingAgent: (
		codingAgentId: DefaultCodingAgent,
		codingAgentName: string,
		contextForAgents: string | null,
	) => void;
	readonly openInEditor: (editorId: EditorPickerId | null) => void;
	readonly originalLocation: ResolvedStackLocation | null;
	readonly selectAsset: (src: string) => void;
	readonly sequence: TSequence;
	readonly sourceActions?: readonly ComboboxValue[];
}): ComboboxValue[] => {
	const isInteractiveSvg =
		sequence.controls?.componentIdentity === interactiveSvgComponentIdentity;
	const installedEditors = editorInfo?.installedEditors ?? [];
	const defaultEditorId = getPreferredEditorId(editorInfo);
	const defaultEditor = installedEditors.find(
		(editor) => editor.id === defaultEditorId,
	);
	const editorName = defaultEditor?.nameWithType ?? null;
	const defaultOpenInTarget = getDefaultOpenInTarget({canOpenInEditor});
	const gitSourceName = window.remotion_gitSource
		? getGitSourceName(window.remotion_gitSource)
		: null;
	const defaultOpenInName =
		defaultOpenInTarget === 'editor' ? editorName : gitSourceName;
	const copyImageLabel =
		copyImageElement && sequence.type === 'image' ? 'Copy image' : 'Copy frame';
	const contextForAgents = formatContextForAgents({
		location: originalLocation,
		name: sequence.displayName || sequence.controls?.componentName || null,
		root: window.remotion_cwd,
	});
	const openInCodingAgentWithContext = (
		codingAgentId: DefaultCodingAgent,
		codingAgentName: string,
	) => {
		openInCodingAgent(
			codingAgentId,
			codingAgentName,
			codingAgentId === 'copilot' ? null : contextForAgents,
		);
	};

	const openInMenuItems = getOpenInMenuItems({
		canOpenDesktopApps: onConfigureApps !== null,
		codingAgentInfo,
		editorDisabled: !canOpenInEditor || !originalLocation,
		editorInfo,
		excludeCodingAgentId: null,
		excludeEditorId: defaultEditorId,
		excludeGitSource: defaultOpenInTarget === 'git-source',
		fileManagerDisabled: !originalLocation?.source,
		folder: false,
		gitSourceDisabled: !originalLocation,
		onConfigureApps,
		onOpenInCodingAgent: openInCodingAgentWithContext,
		onOpenInEditor: openInEditor,
		onOpenInFileExplorer: () => {
			if (!originalLocation?.source) {
				return;
			}

			openInFileExplorer({directory: originalLocation.source}).catch((err) => {
				showNotification(`Could not open file: ${err.message}`, 2000);
			});
		},
		onOpenInGitClient: () => undefined,
		onOpenInGitSource: () => {
			openGitSource({folder: false, location: originalLocation});
		},
		onOpenInTerminal: null,
	});

	const items = [
		defaultOpenInTarget && defaultOpenInName
			? {
					type: 'item' as const,
					id:
						defaultOpenInTarget === 'editor'
							? 'open-in-editor'
							: 'open-in-git-source',
					keyHint: null,
					label: `Open in ${defaultOpenInName}`,
					leftItem: null,
					disabled: !originalLocation,
					onClick: () => {
						if (defaultOpenInTarget === 'editor') {
							openInEditor(null);
							return;
						}

						openGitSource({folder: false, location: originalLocation});
					},
					quickSwitcherLabel: null,
					subMenu: null,
					value:
						defaultOpenInTarget === 'editor'
							? 'open-in-editor'
							: 'open-in-git-source',
				}
			: null,
		openInMenuItems.length > 0
			? {
					type: 'item' as const,
					id: 'open-in-another-app',
					keyHint: null,
					label: 'Open in...',
					leftItem: null,
					disabled: false,
					onClick: () => undefined,
					quickSwitcherLabel: null,
					subMenu: {
						items: openInMenuItems,
						leaveLeftSpace: true,
						preselectIndex: false as const,
					},
					value: 'open-in-another-app',
				}
			: null,
		getCopyContextForAgentsMenuItem({contextForAgents}),
		assetLinkInfo
			? {
					type: 'item' as const,
					id: 'show-asset',
					keyHint: null,
					label: 'Show asset',
					leftItem: null,
					disabled: false,
					onClick: () => {
						openTimelineAssetLink(assetLinkInfo, selectAsset);
					},
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'show-asset',
				}
			: null,
		copyImageElement
			? {
					type: 'divider' as const,
					id: 'copy-image-divider',
				}
			: null,
		copyImageElement
			? {
					type: 'item' as const,
					id: copyImageLabel === 'Copy image' ? 'copy-image' : 'copy-frame',
					keyHint: null,
					label: copyImageLabel,
					leftItem: null,
					disabled: false,
					onClick: () => {
						copyImageToClipboard(copyImageElement)
							.then(() => {
								showNotification(
									`Copied ${copyImageLabel === 'Copy image' ? 'image' : 'frame'} to clipboard`,
									1000,
								);
							})
							.catch((err) => {
								showNotification(
									`Could not copy ${copyImageLabel === 'Copy image' ? 'image' : 'frame'}: ${(err as Error).message}`,
									2000,
								);
							});
					},
					quickSwitcherLabel: null,
					subMenu: null,
					value: copyImageLabel === 'Copy image' ? 'copy-image' : 'copy-frame',
				}
			: null,
		assetLinkInfo || copyImageElement
			? {
					type: 'divider' as const,
					id: 'sequence-link-divider',
				}
			: null,
		isInteractiveSvg
			? {
					type: 'item' as const,
					id: 'copy-svg',
					keyHint: null,
					label: 'Copy SVG',
					leftItem: null,
					disabled: !sequence.refForOutline?.current,
					onClick: () => {
						const svg = sequence.refForOutline?.current;
						if (!svg) {
							return;
						}

						navigator.clipboard
							.writeText(svg.outerHTML)
							.then(() => {
								showNotification('Copied SVG to clipboard', 1000);
							})
							.catch((err) => {
								showNotification(
									`Could not copy to clipboard: ${(err as Error).message}`,
									1000,
								);
							});
					},
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'copy-svg',
				}
			: null,
		isInteractiveSvg
			? {
					type: 'divider' as const,
					id: 'copy-svg-divider',
				}
			: null,
		sourceActions.length > 0
			? {
					type: 'divider' as const,
					id: 'sequence-source-actions-divider',
				}
			: null,
		...sourceActions,
		includeSourceEditItems
			? {
					type: 'item' as const,
					id: 'disable-interactivity',
					keyHint: null,
					label: 'Disable interactivity',
					leftItem: null,
					disabled: disableInteractivityDisabled,
					onClick: onDisableSequenceInteractivity,
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'disable-interactivity',
				}
			: null,
		includeSourceEditItems
			? {
					type: 'item' as const,
					id: 'duplicate-sequence',
					keyHint: null,
					label: 'Duplicate',
					leftItem: null,
					disabled: duplicateDisabled || isProgrammaticallyDuplicated,
					onClick: onDuplicateSequenceFromSource,
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'duplicate-sequence',
				}
			: null,
		includeSourceEditItems
			? {
					type: 'divider' as const,
					id: 'sequence-duplicate-delete-divider',
				}
			: null,
		includeSourceEditItems
			? {
					type: 'item' as const,
					id: 'delete-sequence',
					keyHint: null,
					label: isProgrammaticallyDuplicated ? 'Delete all' : 'Delete',
					leftItem: null,
					disabled: deleteDisabled,
					onClick: onDeleteSequenceFromSource,
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'delete-sequence',
				}
			: null,
	].filter(NoReactInternals.truthy);

	return normalizeMenuDividers(items);
};
