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
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {RemotionInput} from './NewComposition/RemInput';
import {getSettingDomId} from './settings-catalog';
import type {
	SettingsSearchResult,
	SettingsSearchTarget,
} from './settings-search';
import {searchSettings} from './settings-search';

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

export const SettingsSearch: React.FC<{
	readonly entries: readonly SettingsSearchResult[];
	readonly onSelect: (target: SettingsSearchTarget) => void;
}> = ({entries, onSelect}) => {
	const [query, setQuery] = useState('');
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const list = useRef<HTMLDivElement>(null);
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
