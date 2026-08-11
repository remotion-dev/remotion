import {
	EFFECT_CATALOG,
	getEffectDocumentationLink,
	type EffectCatalogItem,
} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_06,
} from '../helpers/colors';
import {useKeybinding} from '../helpers/use-keybinding';
import {EffectsIcon} from '../icons/effects';
import {ExternalLinkIcon} from '../icons/external-link';
import {
	type AddEffectModalState,
	SetSelectedModalContext,
} from '../state/modals';
import {ContextMenu} from './ContextMenu';
import {addEffectToSequence} from './effect-drag-and-drop';
import {filterEffectCatalog} from './effect-picker-search';
import {Spacing} from './layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {DismissableModal} from './NewComposition/DismissableModal';
import {RemotionInput} from './NewComposition/RemInput';
import {
	QUICK_SWITCHER_RESULT_LABEL_FONT_SIZE,
	loopIndex,
	useScrollIntoViewOnSelected,
} from './QuickSwitcher/shared';

const container: React.CSSProperties = {
	width: 400,
};

const panelStyle: React.CSSProperties = {
	borderRadius: 6,
	overflow: 'hidden',
};

const content: React.CSSProperties = {
	padding: '12px 16px 10px',
};

const inputStyle: React.CSSProperties = {
	width: '100%',
	borderRadius: 4,
};

const aboutEffectsRow: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'flex-end',
	marginBottom: 8,
};

const aboutEffectsLink: React.CSSProperties = {
	alignItems: 'center',
	color: LIGHT_TEXT,
	cursor: 'default',
	display: 'inline-flex',
	fontFamily: 'sans-serif',
	fontSize: 12,
	gap: 4,
	lineHeight: '14px',
	minWidth: 0,
	textDecoration: 'none',
};

const aboutEffectsLinkHovered: React.CSSProperties = {
	...aboutEffectsLink,
	color: WHITE,
};

const aboutEffectsLabel: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'sans-serif',
	fontSize: 12,
	lineHeight: '14px',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const aboutEffectsIcon: React.CSSProperties = {
	flexShrink: 0,
	height: 12,
	width: 12,
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
	cursor: 'default',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	paddingLeft: 16,
	paddingRight: 16,
	marginBottom: 1,
	marginLeft: 4,
	marginRight: 4,
	borderRadius: 4,
};

const iconStyle: React.CSSProperties = {
	width: 18,
	height: 18,
	flexShrink: 0,
};

const labelContainer: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
	overflow: 'hidden',
	paddingTop: 5,
	paddingBottom: 5,
};

const label: React.CSSProperties = {
	fontSize: QUICK_SWITCHER_RESULT_LABEL_FONT_SIZE,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const category: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 11,
	flexShrink: 0,
};

const EffectPickerResult: React.FC<{
	readonly item: EffectCatalogItem;
	readonly selected: boolean;
	readonly onSelected: (item: EffectCatalogItem) => void;
}> = ({item, selected, onSelected}) => {
	const [hovered, setHovered] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useScrollIntoViewOnSelected(ref, selected);

	const style = useMemo((): React.CSSProperties => {
		return {
			...resultContainer,
			backgroundColor: hovered || selected ? WHITE_ALPHA_06 : TRANSPARENT,
		};
	}, [hovered, selected]);

	const labelStyle = useMemo((): React.CSSProperties => {
		return {
			...label,
			color: selected || hovered ? WHITE : LIGHT_TEXT,
		};
	}, [hovered, selected]);

	const onClick = useCallback(() => {
		onSelected(item);
	}, [item, onSelected]);

	const getContextMenuItems = useCallback((): ComboboxValue[] => {
		const documentationLink = getEffectDocumentationLink(item);

		return [
			{
				type: 'item',
				id: `open-${item.id}-docs`,
				keyHint: null,
				label: 'Open effect docs',
				leftItem: null,
				disabled: false,
				onClick: () => {
					window.open(documentationLink, '_blank', 'noopener,noreferrer');
				},
				quickSwitcherLabel: null,
				subMenu: null,
				value: `open-${item.id}-docs`,
			},
		];
	}, [item]);

	return (
		<ContextMenu getItems={getContextMenuItems}>
			<div
				ref={ref}
				style={style}
				onClick={onClick}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
			>
				<EffectsIcon
					color={selected || hovered ? WHITE : LIGHT_TEXT}
					style={iconStyle}
				/>
				<Spacing x={1} />
				<div style={labelContainer}>
					<div style={labelStyle}>{item.label}</div>
				</div>
				<Spacing x={1} />
				<div style={category}>{item.category}</div>
			</div>
		</ContextMenu>
	);
};

const EffectPickerContent: React.FC<{
	readonly state: AddEffectModalState;
}> = ({state}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const [aboutEffectsHovered, setAboutEffectsHovered] = useState(false);
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
			<div style={content}>
				<div style={aboutEffectsRow}>
					<a
						href="https://remotion.dev/effects"
						target="_blank"
						rel="noopener noreferrer"
						style={
							aboutEffectsHovered ? aboutEffectsLinkHovered : aboutEffectsLink
						}
						onMouseEnter={() => setAboutEffectsHovered(true)}
						onMouseLeave={() => setAboutEffectsHovered(false)}
					>
						<span style={aboutEffectsLabel}>About effects</span>
						<ExternalLinkIcon
							aria-hidden="true"
							color={aboutEffectsHovered ? WHITE : LIGHT_TEXT}
							style={aboutEffectsIcon}
						/>
					</a>
				</div>
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
		<DismissableModal panelStyle={panelStyle}>
			<EffectPickerContent state={state} />
		</DismissableModal>
	);
};
