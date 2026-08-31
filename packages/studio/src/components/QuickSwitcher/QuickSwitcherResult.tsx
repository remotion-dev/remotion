import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {_InternalTypes} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_06,
} from '../../helpers/colors';
import type {AssetFileType} from '../../helpers/get-preview-file-type';
import {noop} from '../../helpers/noop';
import {useKeybinding} from '../../helpers/use-keybinding';
import {ExpandedFolderIcon} from '../../icons/folder';
import {StillIcon} from '../../icons/still';
import {UploadIcon} from '../../icons/upload';
import {FilmIcon} from '../../icons/video';
import {SetSelectedModalContext} from '../../state/modals';
import {AssetFileIcon} from '../AssetFileIcon';
import {getCompositionContextMenuItems} from '../composition-menu-items';
import {ContextMenu} from '../ContextMenu';
import {Spacing} from '../layout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {useResolvedStack} from '../Timeline/use-resolved-stack';
import {useEditorOpening} from '../use-default-editor-info';
import {
	QUICK_SWITCHER_RESULT_LABEL_FONT_SIZE,
	useScrollIntoViewOnSelected,
} from './shared';

type QuickSwitcherResultDetail =
	| {
			type: 'asset';
			fileType: AssetFileType;
	  }
	| {
			type: 'composition';
			composition: _InternalTypes['AnyComposition'];
			compositionType: 'composition' | 'still';
			level: number;
	  }
	| {
			type: 'menu-item';
	  }
	| {
			type: 'select-file';
	  }
	| {
			type: 'search-result';
			titleLine: string;
			subtitleLine: string;
	  };

export type TQuickSwitcherResult =
	| ({
			title: string;
			id: string;
			onSelected: () => void;
	  } & QuickSwitcherResultDetail)
	| {
			title: string;
			id: string;
			type: 'folder';
			level: number;
	  };

export const isQuickSwitcherResultSelectable = (
	result: TQuickSwitcherResult,
): result is Exclude<TQuickSwitcherResult, {type: 'folder'}> => {
	return result.type !== 'folder';
};

const container: React.CSSProperties = {
	paddingLeft: 16,
	paddingRight: 16,

	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	cursor: 'default',
	marginBottom: 1,
	marginLeft: 4,
	marginRight: 4,
	borderRadius: 4,
};

const label: React.CSSProperties = {
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis',
};

const searchLabel: React.CSSProperties = {
	...label,
	lineHeight: 1.25,
};

const iconStyle: React.CSSProperties = {
	width: 18,
	height: 18,
	flexShrink: 0,
};

const selectFileIconStyle: React.CSSProperties = {
	...iconStyle,
	width: 20,
	height: 20,
};

const labelContainer: React.CSSProperties = {
	overflow: 'hidden',
	flex: 1,
	paddingTop: 5,
	paddingBottom: 5,
};

export const QuickSwitcherResult: React.FC<{
	readonly result: TQuickSwitcherResult;
	readonly selected: boolean;
}> = ({result, selected}) => {
	const [hovered, setIsHovered] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const keybindings = useKeybinding();
	const onSelected = result.type === 'folder' ? null : result.onSelected;
	const composition = result.type === 'composition' ? result.composition : null;
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const {defaultEditorId, defaultEditorName} = useEditorOpening(
		connectionStatus === 'connected',
	);
	const resolvedLocation = useResolvedStack(composition?.stack ?? null);
	const getContextMenuItems = useCallback((): ComboboxValue[] => {
		if (composition === null) {
			return [];
		}

		return getCompositionContextMenuItems({
			closeMenu: noop,
			composition,
			connectionStatus,
			editorId: defaultEditorId,
			editorName: defaultEditorName,
			includeCompositionManagementItems: true,
			resolvedLocation,
			setSelectedModal,
			readOnlyStudio: window.remotion_isReadOnlyStudio,
		});
	}, [
		composition,
		connectionStatus,
		defaultEditorId,
		defaultEditorName,
		resolvedLocation,
		setSelectedModal,
	]);

	useEffect(() => {
		if (result.type === 'folder') {
			return;
		}

		const {current} = ref;
		if (!current) {
			return;
		}

		const onMouseEnter = () => setIsHovered(true);
		const onMouseLeave = () => setIsHovered(false);

		current.addEventListener('mouseenter', onMouseEnter);
		current.addEventListener('mouseleave', onMouseLeave);

		return () => {
			current.removeEventListener('mouseenter', onMouseEnter);
			current.removeEventListener('mouseleave', onMouseLeave);
		};
	}, [result.type]);

	useEffect(() => {
		if (!selected || onSelected === null) {
			return;
		}

		const binding = keybindings.registerKeybinding({
			key: 'Enter',
			callback: onSelected,
			commandCtrlKey: false,
			event: 'keydown',
			preventDefault: true,
			// Input will be focused while selection
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			binding.unregister();
		};
	}, [keybindings, onSelected, selected]);

	useScrollIntoViewOnSelected(ref, selected);

	const style = useMemo(() => {
		return {
			...container,
			paddingLeft:
				result.type === 'folder' || result.type === 'composition'
					? 16 + result.level * 8
					: container.paddingLeft,
			backgroundColor:
				result.type !== 'folder' && (hovered || selected)
					? WHITE_ALPHA_06
					: TRANSPARENT,
		};
	}, [hovered, result, selected]);

	const labelStyle = useMemo(() => {
		return {
			...(result.type === 'search-result' ? searchLabel : label),
			color:
				result.type === 'search-result' || result.type === 'folder'
					? LIGHT_TEXT
					: selected || hovered
						? WHITE
						: LIGHT_TEXT,
			fontSize: QUICK_SWITCHER_RESULT_LABEL_FONT_SIZE,
		};
	}, [hovered, result.type, selected]);

	const row = (
		<div
			ref={ref}
			key={result.id}
			style={style}
			onClick={onSelected ?? undefined}
		>
			{result.type === 'composition' ? (
				result.compositionType === 'still' ? (
					<StillIcon
						color={selected || hovered ? WHITE : LIGHT_TEXT}
						style={iconStyle}
					/>
				) : (
					<FilmIcon
						color={selected || hovered ? WHITE : LIGHT_TEXT}
						style={iconStyle}
					/>
				)
			) : result.type === 'folder' ? (
				<ExpandedFolderIcon color={LIGHT_TEXT} style={iconStyle} />
			) : result.type === 'asset' ? (
				<AssetFileIcon
					fileType={result.fileType}
					color={selected || hovered ? WHITE : LIGHT_TEXT}
					style={iconStyle}
				/>
			) : result.type === 'select-file' ? (
				<UploadIcon
					color={selected || hovered ? WHITE : LIGHT_TEXT}
					style={selectFileIconStyle}
				/>
			) : null}
			<Spacing x={1} />
			<div style={labelContainer}>
				{result.type === 'search-result' ? (
					<>
						<div
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={{
								__html: result.titleLine,
							}}
							style={labelStyle}
						/>
						<div
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={{
								__html: result.subtitleLine,
							}}
							style={labelStyle}
						/>
					</>
				) : (
					<div style={labelStyle}>{result.title}</div>
				)}
			</div>
		</div>
	);

	if (composition === null) {
		return row;
	}

	return <ContextMenu getItems={getContextMenuItems}>{row}</ContextMenu>;
};
