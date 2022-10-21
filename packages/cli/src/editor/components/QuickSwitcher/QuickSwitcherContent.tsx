import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {INPUT_BORDER_COLOR_UNHOVERED} from '../../helpers/colors';
import {isCompositionStill} from '../../helpers/is-composition-still';
import {useKeybinding} from '../../helpers/use-keybinding';
import {ModalsContext} from '../../state/modals';
import {useSelectComposition} from '../InitialCompositionLoader';
import {fuzzySearch} from './fuzzy-search';
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

const content: React.CSSProperties = {
	padding: 16,
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

// Separate component to correctly capture keybindings
export const QuickSwitcherContent: React.FC = () => {
	const {compositions} = useContext(Internals.CompositionManager);
	const [state, setState] = useState({
		query: '',
		selectedIndex: 0,
	});
	const selectComposition = useSelectComposition();

	const {setSelectedModal} = useContext(ModalsContext);

	const keybindings = useKeybinding();
	const resultsArray = useMemo((): TQuickSwitcherResult[] => {
		return fuzzySearch(
			state.query,
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
	}, [compositions, state.query, selectComposition, setSelectedModal]);

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

	return (
		<div style={container}>
			<div style={content}>
				<input
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
					<QuickSwitcherNoResults query={state.query} />
				) : null}
			</div>
		</div>
	);
};
