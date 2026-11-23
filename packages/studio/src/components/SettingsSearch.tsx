import {BrowserSafeApis} from '@remotion/renderer/client';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
	BACKGROUND,
	BORDER_WHITE_ALPHA_12,
	LIGHT_TEXT,
	SELECTED_BACKGROUND,
	TRANSPARENT,
	WHITE,
} from '../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../helpers/hoverable';
import type {SettingsTab} from '../helpers/settings-tab-availability';
import {getStudioAskAIEnabled} from '../helpers/studio-runtime-config';
import {
	askAIKeyboardShortcutGroup,
	keyboardShortcutGroups,
} from './keyboard-shortcuts';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {RemotionInput} from './NewComposition/RemInput';
import {
	getSettingDomId,
	settingsCatalog,
	settingsTabLabels,
} from './settings-catalog';
import type {
	SettingsSearchResult,
	SettingsSearchTarget,
} from './settings-search';
import {searchSettings} from './settings-search';
import {useSettings} from './SettingsContext';

const container: React.CSSProperties = {
	position: 'relative',
	width: 420,
	maxWidth: '100%',
	margin: '0 8px',
};
const resultsStyle: React.CSSProperties = {
	position: 'absolute',
	top: 'calc(100% + 6px)',
	left: 0,
	right: 0,
	maxHeight: 'min(420px, 65vh)',
	overflowY: 'auto',
	backgroundColor: BACKGROUND,
	border: BORDER_WHITE_ALPHA_12,
	borderRadius: 6,
	boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
	zIndex: 1,
};
const resultStyle: React.CSSProperties = {
	display: 'block',
	width: '100%',
	padding: '10px 12px',
	border: 'none',
	textAlign: 'left',
	cursor: 'default',
};
const nameStyle: React.CSSProperties = {
	display: 'block',
	fontSize: 14,
	lineHeight: 1.5,
};
const detailStyle: React.CSSProperties = {
	display: 'block',
	fontSize: 12,
	lineHeight: 1.5,
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

export const SettingsSearch: React.FC<{
	readonly availableTabs: readonly SettingsTab[];
	readonly onSelect: (target: SettingsSearchTarget) => void;
}> = ({availableTabs, onSelect}) => {
	const {renderDefaults, studioRuntimeConfig} = useSettings();
	const [query, setQuery] = useState('');
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const list = useRef<HTMLDivElement>(null);
	const entries = useMemo((): SettingsSearchResult[] => {
		const codec = renderDefaults?.configFileRenderDefaults?.codec ?? 'h264';
		const qualityMode =
			(renderDefaults?.videoBitrate ?? null) === null ? 'crf' : 'bitrate';
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
						qualityMode === 'crf' && BrowserSafeApis.codecSupportsCrf(codec)
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
				category: [settingsTabLabels[entry.tab], entry.section]
					.filter(Boolean)
					.join(' › '),
			}));
		const groups = getStudioAskAIEnabled()
			? [...keyboardShortcutGroups, askAIKeyboardShortcutGroup]
			: keyboardShortcutGroups;
		const shortcuts: SettingsSearchResult[] =
			studioRuntimeConfig?.configFileStudioSettings
				?.keyboardShortcutsEnabled === false
				? []
				: groups.flatMap((group) =>
						group.shortcuts.map((shortcut) => ({
							id: `shortcut-${shortcut.action}`,
							tab: 'shortcuts',
							name: shortcut.action,
							description: 'View keyboard shortcut bindings.',
							category: `Shortcuts › ${group.name}`,
							keywords: 'keyboard hotkeys keybindings',
						})),
					);
		return [
			...settings,
			...shortcuts,
			...availableTabs.map((tab) => ({
				id: `tab-${tab}`,
				tab,
				name: settingsTabLabels[tab],
				description: tabDescriptions[tab],
				category: 'Settings',
				keywords: '',
			})),
		];
	}, [availableTabs, renderDefaults, studioRuntimeConfig]);
	const results = useMemo(
		() => searchSettings(entries, query),
		[entries, query],
	);
	const expanded = open && query.trim().length > 0;
	const active = results[Math.min(activeIndex, results.length - 1)] ?? null;
	const listId = 'remotion-settings-search-results';

	useEffect(() => {
		if (!expanded || active === null) return;
		list.current
			?.querySelector<HTMLElement>(
				`[id="${getSettingDomId(`result-${active.id}`)}"]`,
			)
			?.scrollIntoView({block: 'nearest'});
	}, [active, expanded]);

	return (
		<div
			style={container}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget as Node | null))
					setOpen(false);
			}}
		>
			<RemotionInput
				role="combobox"
				aria-label="Search settings"
				aria-autocomplete="list"
				aria-expanded={expanded}
				aria-controls={expanded ? listId : undefined}
				aria-activedescendant={
					expanded && active !== null
						? getSettingDomId(`result-${active.id}`)
						: undefined
				}
				placeholder="Search settings…"
				value={query}
				status="ok"
				rightAlign={false}
				small
				onFocus={() => setOpen(true)}
				onChange={(event) => {
					setQuery(event.currentTarget.value);
					setActiveIndex(0);
					setOpen(true);
				}}
				onKeyDown={(event) => {
					if (event.nativeEvent.isComposing) return;
					if (event.key === 'Escape' && expanded) {
						event.preventDefault();
						event.stopPropagation();
						setOpen(false);
						return;
					}

					if (
						(event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
						query.trim()
					) {
						event.preventDefault();
						event.stopPropagation();
						setOpen(true);
						setActiveIndex((index) =>
							results.length === 0
								? 0
								: (index +
										(event.key === 'ArrowDown' ? 1 : -1) +
										results.length) %
									results.length,
						);
					}

					if (event.key === 'Enter' && expanded && active !== null) {
						event.preventDefault();
						event.stopPropagation();
						setOpen(false);
						onSelect({id: active.id, tab: active.tab, focusControl: true});
					}
				}}
			/>
			{expanded ? (
				<div style={resultsStyle} className={VERTICAL_SCROLLBAR_CLASSNAME}>
					<div
						ref={list}
						id={listId}
						role="listbox"
						aria-label="Settings search results"
					>
						{results.map((result) => (
							<button
								key={result.id}
								id={getSettingDomId(`result-${result.id}`)}
								type="button"
								role="option"
								aria-selected={active?.id === result.id}
								tabIndex={-1}
								className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
								style={{
									...resultStyle,
									...hoverableStyle({
										idleBackground:
											active?.id === result.id
												? SELECTED_BACKGROUND
												: TRANSPARENT,
										hoverBackground: SELECTED_BACKGROUND,
										idleColor: LIGHT_TEXT,
										hoverColor: WHITE,
									}),
								}}
								onPointerDown={(event) => event.preventDefault()}
								onClick={() => {
									setOpen(false);
									onSelect({
										id: result.id,
										tab: result.tab,
										focusControl: false,
									});
								}}
							>
								<span style={nameStyle}>{result.name}</span>
								<span style={detailStyle}>{result.category}</span>
								<span style={detailStyle}>{result.description}</span>
							</button>
						))}
					</div>
					{results.length === 0 ? (
						<div
							role="status"
							style={{padding: 12, color: LIGHT_TEXT, fontSize: 13}}
						>
							No settings found.
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
};
