import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import type {_InternalTypes} from 'remotion';
import type {StaticFile} from '../../api/get-static-files';
import {LIGHT_TEXT, WHITE} from '../../helpers/colors';
import {getPreviewFileType} from '../../helpers/get-preview-file-type';
import {isCompositionStill} from '../../helpers/is-composition-still';
import {pushUrl} from '../../helpers/url-state';
import {useKeybinding} from '../../helpers/use-keybinding';
import {
	makeSearchResults,
	useMenuStructure,
} from '../../helpers/use-menu-structure';
import {SetSelectedModalContext} from '../../state/modals';
import {useSelectComposition} from '../InitialCompositionLoader';
import {KeyboardShortcutsExplainer} from '../KeyboardShortcutsExplainer';
import {Spacing} from '../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {RemotionInput} from '../NewComposition/RemInput';
import {useSelectAsset} from '../use-select-asset';
import {useStaticFiles} from '../use-static-files';
import {algoliaSearch} from './algolia-search';
import {AlgoliaCredit} from './AlgoliaCredit';
import {filterAssetsByType} from './asset-search';
import {fuzzySearch} from './fuzzy-search';
import type {QuickSwitcherMode} from './NoResults';
import {QuickSwitcherNoResults} from './NoResults';
import type {TQuickSwitcherResult} from './QuickSwitcherResult';
import {QuickSwitcherResult} from './QuickSwitcherResult';
import {loopIndex} from './shared';

const input: React.CSSProperties = {
	width: '100%',
	borderRadius: 4,
};

const modeSelector: React.CSSProperties = {
	paddingLeft: 16,
	paddingRight: 16,
	display: 'flex',
	flexDirection: 'row',
	paddingTop: 8,
	paddingBottom: 5,
};

const modeItem: React.CSSProperties = {
	appearance: 'none',
	border: 'none',
	fontFamily: 'inherit',
	padding: 0,
	fontSize: 13,
	cursor: 'pointer',
};

const modeInactive: React.CSSProperties = {
	...modeItem,
	color: LIGHT_TEXT,
};

const modeActive: React.CSSProperties = {
	...modeItem,
	color: WHITE,
};

const content: React.CSSProperties = {
	paddingLeft: 16,
	paddingRight: 16,
	paddingTop: 4,
	paddingBottom: 10,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const contentWithoutModeSelector: React.CSSProperties = {
	...content,
	paddingTop: 16,
};

const stripQuery = (query: string) => {
	if (query.startsWith('$') || query.startsWith('>') || query.startsWith('?')) {
		return query.substring(1).trim();
	}

	return query.trim();
};

const mapQueryToMode = (query: string): QuickSwitcherMode => {
	return query.startsWith('>')
		? 'commands'
		: query.startsWith('?')
			? 'docs'
			: query.startsWith('$')
				? 'assets'
				: 'compositions';
};

const mapModeToQuery = (mode: QuickSwitcherMode): string => {
	if (mode === 'assets') {
		return '$ ';
	}

	if (mode === 'commands') {
		return '> ';
	}

	if (mode === 'compositions') {
		return '';
	}

	if (mode === 'docs') {
		return '? ';
	}

	throw new Error('no mode' + mode);
};

type AlgoliaState =
	| {
			type: 'initial';
	  }
	| {
			type: 'loading';
	  }
	| {
			type: 'results';
			results: TQuickSwitcherResult[];
	  }
	| {
			type: 'error';
			error: Error;
	  };

export const QuickSwitcherContent: React.FC<{
	readonly initialMode: QuickSwitcherMode;
	readonly invocationTimestamp: number;
	readonly readOnlyStudio: boolean;
	readonly assetSelection: {
		readonly initialQuery: string;
		readonly onSelectFile: () => void;
		readonly onSelected: (asset: StaticFile) => void;
	} | null;
	readonly compositionSelection: {
		readonly excludeCompositionId: string;
		readonly onSelected: (
			composition: _InternalTypes['AnyComposition'],
		) => void;
	} | null;
}> = ({
	initialMode,
	invocationTimestamp,
	readOnlyStudio,
	assetSelection,
	compositionSelection,
}) => {
	const {compositions} = useContext(Internals.CompositionManager);
	const staticFiles = useStaticFiles();
	const [state, setState] = useState(() => {
		return {
			query:
				assetSelection === null
					? compositionSelection === null
						? mapModeToQuery(initialMode)
						: ''
					: assetSelection.initialQuery,
			selectedIndex: 0,
		};
	});

	useEffect(() => {
		setState({
			query:
				assetSelection === null
					? compositionSelection === null
						? mapModeToQuery(initialMode)
						: ''
					: assetSelection.initialQuery,
			selectedIndex: 0,
		});
	}, [assetSelection, compositionSelection, initialMode, invocationTimestamp]);

	const inputRef = useRef<HTMLInputElement>(null);
	const selectComposition = useSelectComposition();
	const selectAsset = useSelectAsset();

	const closeMenu = useCallback(() => undefined, []);
	const actions = useMenuStructure(closeMenu, readOnlyStudio);
	const [docResults, setDocResults] = useState<AlgoliaState>({type: 'initial'});

	const {setSelectedModal} = useContext(SetSelectedModalContext);

	const keybindings = useKeybinding();

	const mode: QuickSwitcherMode =
		assetSelection !== null
			? 'assets'
			: compositionSelection !== null
				? 'compositions'
				: mapQueryToMode(state.query);

	const actualQuery = useMemo(() => {
		return stripQuery(state.query);
	}, [state.query]);

	const menuActions = useMemo((): TQuickSwitcherResult[] => {
		if (mode !== 'commands') {
			return [];
		}

		return makeSearchResults(actions, setSelectedModal);
	}, [actions, mode, setSelectedModal]);

	const assetSearch = useMemo(() => {
		return filterAssetsByType({
			assets: staticFiles,
			query: actualQuery,
		});
	}, [actualQuery, staticFiles]);

	const resultsArray = useMemo((): TQuickSwitcherResult[] => {
		if (mode === 'commands') {
			return fuzzySearch(actualQuery, menuActions);
		}

		if (mode === 'docs' && docResults.type === 'results') {
			return docResults.results;
		}

		if (mode === 'assets') {
			const assetResults = fuzzySearch(
				assetSearch.query,
				assetSearch.assets.map((asset) => {
					return {
						id: 'asset-' + asset.name,
						title: asset.name,
						type: 'asset',
						fileType: getPreviewFileType(asset.name),
						onSelected: () => {
							if (assetSelection !== null) {
								assetSelection.onSelected(asset);
							} else {
								selectAsset(asset.name);
								pushUrl(`/assets/${asset.name}`);
							}

							setSelectedModal(null);
						},
					};
				}),
			);

			if (assetSelection === null) {
				return assetResults;
			}

			return [
				{
					id: 'select-file',
					title: 'Select file...',
					type: 'select-file',
					onSelected: () => {
						assetSelection.onSelectFile();
						setSelectedModal(null);
					},
				},
				...assetResults,
			];
		}

		return fuzzySearch(
			actualQuery,
			compositions
				.filter((c) => c.id !== compositionSelection?.excludeCompositionId)
				.map((c) => {
					return {
						id: 'composition-' + c.id,
						title: c.id,
						type: 'composition',
						onSelected: () => {
							if (compositionSelection !== null) {
								compositionSelection.onSelected(c);
								setSelectedModal(null);
								return;
							}

							selectComposition(c, true);
							setSelectedModal(null);

							const selector = `.__remotion-composition[data-compname="${c.id}"]`;

							Internals.compositionSelectorRef.current?.expandComposition(c.id);
							waitForElm(selector).then(() => {
								document
									.querySelector(selector)
									?.scrollIntoView({block: 'center'});
							});
						},
						compositionType: isCompositionStill(c) ? 'still' : 'composition',
					};
				}),
		);
	}, [
		mode,
		actualQuery,
		compositions,
		menuActions,
		docResults,
		assetSearch,
		assetSelection,
		compositionSelection,
		selectAsset,
		selectComposition,
		setSelectedModal,
	]);

	const onArrowDown = useCallback(() => {
		setState((s) => {
			return {
				...s,
				selectedIndex: s.selectedIndex + 1,
			};
		});
	}, []);

	const onArrowUp = useCallback(() => {
		setState((s) => {
			return {
				...s,
				selectedIndex: s.selectedIndex - 1,
			};
		});
	}, []);

	// Arrow up
	useEffect(() => {
		const binding = keybindings.registerKeybinding({
			key: 'ArrowUp',
			callback: onArrowUp,
			commandCtrlKey: false,
			event: 'keydown',
			preventDefault: true,
			// Will be using the input field while selecting
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			binding.unregister();
		};
	}, [keybindings, onArrowDown, onArrowUp]);

	useEffect(() => {
		if (mode !== 'docs') {
			return;
		}

		if (actualQuery.trim() === '') {
			setDocResults({type: 'initial'});
			return;
		}

		let cancelled = false;
		setDocResults({type: 'loading'});
		algoliaSearch(actualQuery)
			.then((agoliaResults) => {
				if (cancelled) {
					return;
				}

				setDocResults({type: 'results', results: agoliaResults});
			})
			.catch((err) => {
				if (cancelled) {
					return;
				}

				setDocResults({type: 'error', error: err});
			});

		return () => {
			cancelled = true;
		};
	}, [actualQuery, mode]);

	// Arrow down
	useEffect(() => {
		const binding = keybindings.registerKeybinding({
			key: 'ArrowDown',
			callback: onArrowDown,
			commandCtrlKey: false,
			event: 'keydown',
			preventDefault: true,
			// Will be using the input field while selecting
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			binding.unregister();
		};
	}, [keybindings, onArrowDown]);

	const onTextChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setState({query: e.target.value, selectedIndex: 0});
		},
		[],
	);

	const selectedIndexRounded = loopIndex(
		state.selectedIndex,
		resultsArray.length,
	);

	const onActionsSelected = useCallback(() => {
		setState((s) => ({
			query: `> ${stripQuery(s.query)}`,
			selectedIndex: 0,
		}));
		inputRef.current?.focus();
	}, []);

	const onCompositionsSelected = useCallback(() => {
		setState((s) => ({
			query: stripQuery(s.query),
			selectedIndex: 0,
		}));
		inputRef.current?.focus();
	}, []);

	const onAssetsSelected = useCallback(() => {
		setState((s) => ({
			query: `$ ${stripQuery(s.query)}`,
			selectedIndex: 0,
		}));
		inputRef.current?.focus();
	}, []);

	const onDocSearchSelected = useCallback(() => {
		setState((s) => ({
			query: `? ${stripQuery(s.query)}`,
			selectedIndex: 0,
		}));
		setDocResults({type: 'initial'});
		inputRef.current?.focus();
	}, []);

	const showKeyboardShortcuts = mode === 'docs' && actualQuery.trim() === '';
	const showSearchLoadingState =
		mode === 'docs' && docResults.type === 'loading';
	const placeholder =
		mode === 'assets'
			? 'Search assets...'
			: mode === 'commands'
				? 'Search actions...'
				: mode === 'docs'
					? 'Search documentation...'
					: 'Search compositions...';

	const container: React.CSSProperties = useMemo(() => {
		return {
			width: showKeyboardShortcuts ? 800 : 400,
		};
	}, [showKeyboardShortcuts]);

	const results: React.CSSProperties = useMemo(() => {
		if (showKeyboardShortcuts) {
			return {
				maxHeight: 600,
				overflowY: 'auto',
			};
		}

		return {
			overflowY: 'auto',
			height: 300,
		};
	}, [showKeyboardShortcuts]);

	return (
		<div style={container}>
			{assetSelection === null && compositionSelection === null && (
				<div style={modeSelector}>
					<button
						onClick={onCompositionsSelected}
						style={mode === 'compositions' ? modeActive : modeInactive}
						type="button"
					>
						Compositions
					</button>
					<Spacing x={1} />
					<button
						onClick={onAssetsSelected}
						style={mode === 'assets' ? modeActive : modeInactive}
						type="button"
					>
						Assets
					</button>
					<Spacing x={1} />
					<button
						onClick={onActionsSelected}
						style={mode === 'commands' ? modeActive : modeInactive}
						type="button"
					>
						Actions
					</button>
					<Spacing x={1} />
					<button
						onClick={onDocSearchSelected}
						style={mode === 'docs' ? modeActive : modeInactive}
						type="button"
					>
						Documentation
					</button>
				</div>
			)}
			<div
				style={
					assetSelection === null && compositionSelection === null
						? content
						: contentWithoutModeSelector
				}
			>
				<RemotionInput
					ref={inputRef}
					type="text"
					style={input}
					autoFocus
					status="ok"
					value={state.query}
					onChange={onTextChange}
					placeholder={placeholder}
					rightAlign={false}
				/>
				{showKeyboardShortcuts ? (
					<>
						<Spacing x={2} /> <AlgoliaCredit />
					</>
				) : null}
			</div>
			<div style={results} className={VERTICAL_SCROLLBAR_CLASSNAME}>
				{showKeyboardShortcuts ? (
					<KeyboardShortcutsExplainer />
				) : showSearchLoadingState ? null : resultsArray.length === 0 ? (
					<QuickSwitcherNoResults mode={mode} query={actualQuery} />
				) : (
					resultsArray.map((result, i) => {
						return (
							<QuickSwitcherResult
								key={result.id}
								selected={selectedIndexRounded === i}
								result={result}
							/>
						);
					})
				)}
			</div>
		</div>
	);
};

function waitForElm(selector: string) {
	return new Promise((resolve) => {
		if (document.querySelector(selector)) {
			resolve(document.querySelector(selector));
			return;
		}

		const observer = new MutationObserver(() => {
			if (document.querySelector(selector)) {
				resolve(document.querySelector(selector));
				observer.disconnect();
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}
