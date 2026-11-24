import type {Codec} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {SettingsTab} from '../helpers/settings-tab-availability';
import {
	askAIKeyboardShortcutGroup,
	keyboardShortcutGroups,
} from './keyboard-shortcuts';
import {settingsCatalog, settingsTabLabels} from './settings-catalog';

export type RenderingSettingsDisplayState = {
	readonly codec: Codec | null;
	readonly qualityMode: 'crf' | 'bitrate';
};

export type SettingsSearchResult = {
	readonly id: string;
	readonly tab: SettingsTab;
	readonly name: string;
	readonly description: string;
	readonly category: readonly string[];
	readonly keywords: string;
};

export type SettingsSearchTarget = {
	readonly id: string;
	readonly tab: SettingsTab;
	readonly focusControl: boolean;
};

const tabDescriptions: Record<SettingsTab, string> = {
	studio:
		'Configure the Studio interface, timeline, playback, and development tools.',
	rendering:
		'Configure default output, encoding, audio, and rendering performance.',
	shortcuts: 'View and configure keyboard shortcuts.',
	packages: 'Install and manage Remotion packages.',
	skills: 'Install and manage Remotion Agent Skills.',
	models: 'Manage transcription and video matting models.',
	apps: 'Choose your default editor and coding agent.',
	license: 'Configure your Remotion license and license key.',
	updates: 'Check for Remotion updates and read release notes.',
};

export const getSettingsSearchEntries = ({
	availableTabs,
	renderingState,
	shortcutsEnabled,
	askAIEnabled,
}: {
	readonly availableTabs: readonly SettingsTab[];
	readonly renderingState: RenderingSettingsDisplayState;
	readonly shortcutsEnabled: boolean;
	readonly askAIEnabled: boolean;
}): SettingsSearchResult[] => {
	const codec = renderingState.codec ?? 'h264';
	const {qualityMode} = renderingState;
	const settings = Object.entries(settingsCatalog)
		.filter(([id, entry]) => {
			if (!availableTabs.includes(entry.tab)) return false;
			if (id === 'keyboardShortcutsEnabled')
				return availableTabs.includes('studio');
			if (id === 'proResProfile') return codec === 'prores';
			if (id === 'x264Preset') return codec === 'h264';
			if (id === 'qualityControl')
				return (
					BrowserSafeApis.codecSupportsCrf(codec) &&
					BrowserSafeApis.codecSupportsVideoBitrate(codec)
				);
			if (id === 'crf')
				return (
					qualityMode === 'crf' &&
					BrowserSafeApis.codecSupportsCrf(codec) &&
					Boolean(BrowserSafeApis.getValidCrfRanges(codec))
				);
			if (id === 'videoBitrate')
				return (
					qualityMode === 'bitrate' &&
					BrowserSafeApis.codecSupportsVideoBitrate(codec)
				);
			return true;
		})
		.map(([id, entry]) => ({
			id,
			tab: entry.tab,
			name: entry.name,
			description: entry.description,
			keywords: entry.keywords,
			category: [settingsTabLabels[entry.tab], entry.section].filter(Boolean),
		}));
	const groups = askAIEnabled
		? [...keyboardShortcutGroups, askAIKeyboardShortcutGroup]
		: keyboardShortcutGroups;
	const shortcuts: SettingsSearchResult[] =
		shortcutsEnabled && availableTabs.includes('shortcuts')
			? groups.flatMap((group) =>
					group.shortcuts.map((shortcut) => ({
						id: `shortcut-${shortcut.action}`,
						tab: 'shortcuts',
						name: shortcut.action,
						description: 'View keyboard shortcut bindings.',
						category: [settingsTabLabels.shortcuts, group.name],
						keywords: 'keyboard hotkeys keybindings',
					})),
				)
			: [];
	return [
		...settings,
		...shortcuts,
		...availableTabs.map((tab) => ({
			id: `tab-${tab}`,
			tab,
			name: settingsTabLabels[tab],
			description: tabDescriptions[tab],
			category: ['Settings'],
			keywords: '',
		})),
	];
};

export const searchSettings = (
	entries: readonly SettingsSearchResult[],
	query: string,
) => {
	const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
	if (words.length === 0) {
		return [];
	}

	return entries
		.filter((entry) => {
			const text =
				`${entry.name} ${entry.description} ${entry.category.join(' ')} ${entry.keywords}`.toLowerCase();
			return words.every((word) => text.includes(word));
		})
		.sort((a, b) => {
			const aName = a.name.toLowerCase();
			const bName = b.name.toLowerCase();
			const normalizedQuery = words.join(' ');
			const rank = (name: string) =>
				name === normalizedQuery ? 0 : name.startsWith(normalizedQuery) ? 1 : 2;
			return rank(aName) - rank(bName);
		});
};
