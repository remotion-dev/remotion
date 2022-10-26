import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {INPUT_BORDER_COLOR_UNHOVERED, LIGHT_TEXT} from '../../helpers/colors';
import {isCompositionStill} from '../../helpers/is-composition-still';
import {useKeybinding} from '../../helpers/use-keybinding';
import {
	makeSearchResults,
	useMenuStructure,
} from '../../helpers/use-menu-structure';
import {ModalsContext} from '../../state/modals';
import {useSelectComposition} from '../InitialCompositionLoader';
import {Spacing} from '../layout';
import {algoliaSearch} from './algolia-search';
import {fuzzySearch} from './fuzzy-search';
import type {Mode} from './NoResults';
import {QuickSwitcherNoResults} from './NoResults';
import type {TQuickSwitcherResult} from './QuickSwitcherResult';
import {QuickSwitcherResult} from './QuickSwitcherResult';

const input: React.CSSProperties = {
	padding: 4,
	border: '2px solid ' + INPUT_BORDER_COLOR_UNHOVERED,
	width: '100%',
};

const container: React.CSSProperties = {
	width: 500,
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
};

const results: React.CSSProperties = {
	overflowY: 'auto',
	height: 300,
};

const loopIndex = (index: number, length: number) => {
	if (index < 0) {
		index += length;
	}

	return index % length;
};

export const QuickSwitcherContent: React.FC = () => {
	const {compositions} = useContext(Internals.CompositionManager);
	const [state, setState] = useState({
		query: '',
		selectedIndex: 0,
	});
	const inputRef = useRef<HTMLInputElement>(null);
	const selectComposition = useSelectComposition();

	const closeMenu = useCallback(() => undefined, []);
	const actions = useMenuStructure(closeMenu);
	const [docResults, setDocResults] = useState<TQuickSwitcherResult[]>([]);

	const {setSelectedModal} = useContext(ModalsContext);

	const keybindings = useKeybinding();

	const mode: Mode = state.query.startsWith('>')
		? 'commands'
		: state.query.startsWith('?')
		? 'docs'
		: 'compositions';

	const actualQuery = useMemo(() => {
		if (mode === 'commands' || mode === 'docs') {
			return state.query.substring(1).trim();
		}

		return state.query.trim();
	}, [mode, state.query]);

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

		if (mode === 'docs') {
			return docResults;
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
					},
					compositionType: isCompositionStill(c) ? 'still' : 'composition',
				};
			})
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
		});

		return () => {
			binding.unregister();
		};
	}, [keybindings, onArrowDown, onArrowUp]);

	useEffect(() => {
		if (mode !== 'docs') {
			return;
		}

		let cancelled = false;

		algoliaSearch(actualQuery).then((agoliaResults) => {
			if (cancelled) {
				return;
			}

			setDocResults(agoliaResults);
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
		});

		return () => {
			binding.unregister();
		};
	}, [keybindings, onArrowDown]);

	const onTextChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setState({query: e.target.value, selectedIndex: 0});
		},
		[]
	);

	const selectedIndexRounded = loopIndex(
		state.selectedIndex,
		resultsArray.length
	);

	const onActionsSelected = useCallback(() => {
		setState({
			query: '> ',
			selectedIndex: 0,
		});
		inputRef.current?.focus();
	}, []);

	const onCompositionsSelected = useCallback(() => {
		setState({
			query: '',
			selectedIndex: 0,
		});
		inputRef.current?.focus();
	}, []);

	const onDocSearchSelected = useCallback(() => {
		setState({
			query: '? ',
			selectedIndex: 0,
		});
		setDocResults([]);
		inputRef.current?.focus();
	}, []);

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
				<input
					ref={inputRef}
					type="text"
					style={input}
					autoFocus
					value={state.query}
					onChange={onTextChange}
					placeholder="Search compositions..."
				/>
			</div>
			<div style={results}>
				{resultsArray.map((result, i) => {
					return (
						<QuickSwitcherResult
							key={result.id}
							selected={selectedIndexRounded === i}
							result={result}
						/>
					);
				})}
				{resultsArray.length === 0 ? (
					<QuickSwitcherNoResults mode={mode} query={actualQuery} />
				) : null}
			</div>
		</div>
	);
};
