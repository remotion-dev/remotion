import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {LIGHT_TEXT} from '../../helpers/colors';
import {isCompositionStill} from '../../helpers/is-composition-still';
import {useKeybinding} from '../../helpers/use-keybinding';
import {
	makeSearchResults,
	useMenuStructure,
} from '../../helpers/use-menu-structure';
import {ModalsContext} from '../../state/modals';
import {compositionSelectorRef} from '../CompositionSelector';
import {useSelectComposition} from '../InitialCompositionLoader';
import {KeyboardShortcutsExplainer} from '../KeyboardShortcutsExplainer';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {RemotionInput} from '../NewComposition/RemInput';
import {Spacing} from '../layout';
import {AlgoliaCredit} from './AlgoliaCredit';
import type {QuickSwitcherMode} from './NoResults';
import {QuickSwitcherNoResults} from './NoResults';
import type {TQuickSwitcherResult} from './QuickSwitcherResult';
import {QuickSwitcherResult} from './QuickSwitcherResult';
import {algoliaSearch} from './algolia-search';
import {fuzzySearch} from './fuzzy-search';

const input: React.CSSProperties = {
	width: '100%',
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
	color: 'white',
	fontWeight: 'bold',
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

const loopIndex = (index: number, length: number) => {
	if (index < 0) {
		index += length;
	}

	return index % length;
};

const stripQuery = (query: string) => {
	if (query.startsWith('>') || query.startsWith('?')) {
		return query.substring(1).trim();
	}

	return query.trim();
};

const mapQueryToMode = (query: string): QuickSwitcherMode => {
	return query.startsWith('>')
		? 'commands'
		: query.startsWith('?')
			? 'docs'
			: 'compositions';
};

const mapModeToQuery = (mode: QuickSwitcherMode): string => {
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
}> = ({initialMode, invocationTimestamp, readOnlyStudio}) => {
	const {compositions} = useContext(Internals.CompositionManager);
	const [state, setState] = useState(() => {
		return {
			query: mapModeToQuery(initialMode),
			selectedIndex: 0,
		};
	});

	useEffect(() => {
		setState({
			query: mapModeToQuery(initialMode),
			selectedIndex: 0,
		});
	}, [initialMode, invocationTimestamp]);

	const inputRef = useRef<HTMLInputElement>(null);
	const selectComposition = useSelectComposition();

	const closeMenu = useCallback(() => undefined, []);
	const actions = useMenuStructure(closeMenu, readOnlyStudio);
	const [docResults, setDocResults] = useState<AlgoliaState>({type: 'initial'});

	const {setSelectedModal} = useContext(ModalsContext);

	const keybindings = useKeybinding();

	const mode: QuickSwitcherMode = mapQueryToMode(state.query);

	const actualQuery = useMemo(() => {
		return stripQuery(state.query);
	}, [state.query]);

	const menuActions = useMemo((): TQuickSwitcherResult[] => {
		if (mode !== 'commands') {
			return [];
		}

		return makeSearchResults(actions, setSelectedModal);
	}, [actions, mode, setSelectedModal]);

	const resultsArray = useMemo((): TQuickSwitcherResult[] => {
		if (mode === 'commands') {
			return fuzzySearch(actualQuery, menuActions);
		}

		if (mode === 'docs' && docResults.type === 'results') {
			return docResults.results;
		}

		return fuzzySearch(
			actualQuery,
			compositions.map((c) => {
				return {
					id: 'composition-' + c.id,
					title: c.id,
					type: 'composition',
					onSelected: () => {
						selectComposition(c, true);
						setSelectedModal(null);

						const selector = `.__remotion-composition[data-compname="${c.id}"]`;

						compositionSelectorRef.current?.expandComposition(c.id);
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

	const container: React.CSSProperties = useMemo(() => {
		return {
			width: showKeyboardShortcuts ? 800 : 500,
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
			<div style={content}>
				<RemotionInput
					ref={inputRef}
					type="text"
					style={input}
					autoFocus
					status="ok"
					value={state.query}
					onChange={onTextChange}
					placeholder="Search compositions..."
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
