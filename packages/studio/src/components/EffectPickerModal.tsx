import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {LIGHT_TEXT, getBackgroundFromHoverState} from '../helpers/colors';
import {useKeybinding} from '../helpers/use-keybinding';
import {ModalsContext, type AddEffectModalState} from '../state/modals';
import {EFFECT_CATALOG, type EffectCatalogItem} from './effect-catalog';
import {addEffectToSequence} from './effect-drag-and-drop';
import {filterEffectCatalog} from './effect-picker-search';
import {Spacing} from './layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';
import {RemotionInput} from './NewComposition/RemInput';

const container: React.CSSProperties = {
	width: 500,
};

const content: React.CSSProperties = {
	padding: '12px 16px 10px',
};

const inputStyle: React.CSSProperties = {
	width: '100%',
};

const resultList: React.CSSProperties = {
	height: 320,
	overflowY: 'auto',
	paddingBottom: 10,
};

const noResults: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
	padding: '12px 16px',
};

const resultContainer: React.CSSProperties = {
	cursor: 'pointer',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	padding: '7px 16px',
};

const labelContainer: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
};

const label: React.CSSProperties = {
	color: 'white',
	fontSize: 14,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const detail: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 12,
	lineHeight: '16px',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const category: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 11,
	flexShrink: 0,
};

const loopIndex = (index: number, length: number) => {
	if (index < 0) {
		index += length;
	}

	return index % length;
};

const EffectPickerResult: React.FC<{
	readonly item: EffectCatalogItem;
	readonly selected: boolean;
	readonly onSelected: (item: EffectCatalogItem) => void;
}> = ({item, selected, onSelected}) => {
	const [hovered, setHovered] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (selected) {
			ref.current?.scrollIntoView({
				block: 'nearest',
				inline: 'center',
			});
		}
	}, [selected]);

	const style = useMemo((): React.CSSProperties => {
		return {
			...resultContainer,
			backgroundColor: getBackgroundFromHoverState({hovered, selected}),
		};
	}, [hovered, selected]);

	const onClick = useCallback(() => {
		onSelected(item);
	}, [item, onSelected]);

	return (
		<div
			ref={ref}
			style={style}
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<div style={labelContainer}>
				<div style={label}>{item.label}</div>
				<div style={detail}>{item.description}</div>
			</div>
			<Spacing x={1} />
			<div style={category}>{item.category}</div>
		</div>
	);
};

const EffectPickerContent: React.FC<{
	readonly state: AddEffectModalState;
}> = ({state}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const [query, setQuery] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const keybindings = useKeybinding();

	const results = useMemo(() => {
		return filterEffectCatalog({items: EFFECT_CATALOG, query});
	}, [query]);

	const selectedIndexRounded =
		results.length === 0 ? -1 : loopIndex(selectedIndex, results.length);

	const selectItem = useCallback(
		(item: EffectCatalogItem) => {
			setSelectedModal(null);
			addEffectToSequence({
				clientId: state.clientId,
				effect: item.effect,
				fileName: state.fileName,
				nodePath: state.nodePath,
			});
		},
		[setSelectedModal, state.clientId, state.fileName, state.nodePath],
	);

	const onArrowDown = useCallback(() => {
		setSelectedIndex((i) => i + 1);
	}, []);

	const onArrowUp = useCallback(() => {
		setSelectedIndex((i) => i - 1);
	}, []);

	const onEnter = useCallback(() => {
		if (selectedIndexRounded === -1) {
			return;
		}

		selectItem(results[selectedIndexRounded]);
	}, [results, selectItem, selectedIndexRounded]);

	useEffect(() => {
		const downBinding = keybindings.registerKeybinding({
			key: 'ArrowDown',
			callback: onArrowDown,
			commandCtrlKey: false,
			event: 'keydown',
			preventDefault: true,
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
		});
		const upBinding = keybindings.registerKeybinding({
			key: 'ArrowUp',
			callback: onArrowUp,
			commandCtrlKey: false,
			event: 'keydown',
			preventDefault: true,
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
		});
		const enterBinding = keybindings.registerKeybinding({
			key: 'Enter',
			callback: onEnter,
			commandCtrlKey: false,
			event: 'keydown',
			preventDefault: true,
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			downBinding.unregister();
			upBinding.unregister();
			enterBinding.unregister();
		};
	}, [keybindings, onArrowDown, onArrowUp, onEnter]);

	const onTextChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setQuery(e.target.value);
			setSelectedIndex(0);
		},
		[],
	);

	return (
		<div style={container}>
			<ModalHeader title="Add effect" />
			<div style={content}>
				<RemotionInput
					ref={inputRef}
					type="text"
					style={inputStyle}
					autoFocus
					status="ok"
					value={query}
					onChange={onTextChange}
					placeholder="Search effects..."
					rightAlign={false}
				/>
			</div>
			<div style={resultList} className={VERTICAL_SCROLLBAR_CLASSNAME}>
				{results.length === 0 ? (
					<div style={noResults}>No effects found</div>
				) : (
					results.map((item, i) => {
						return (
							<EffectPickerResult
								key={item.id}
								item={item}
								selected={selectedIndexRounded === i}
								onSelected={selectItem}
							/>
						);
					})
				)}
			</div>
		</div>
	);
};

export const EffectPickerModal: React.FC<{
	readonly state: AddEffectModalState;
}> = ({state}) => {
	return (
		<DismissableModal>
			<EffectPickerContent state={state} />
		</DismissableModal>
	);
};
