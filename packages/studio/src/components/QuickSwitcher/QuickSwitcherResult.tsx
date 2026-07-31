import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_06,
} from '../../helpers/colors';
import type {AssetFileType} from '../../helpers/get-preview-file-type';
import {useKeybinding} from '../../helpers/use-keybinding';
import {StillIcon} from '../../icons/still';
import {UploadIcon} from '../../icons/upload';
import {FilmIcon} from '../../icons/video';
import {AssetFileIcon} from '../AssetFileIcon';
import {Spacing} from '../layout';
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
			compositionType: 'composition' | 'still';
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

export type TQuickSwitcherResult = {
	title: string;
	id: string;
	onSelected: () => void;
} & QuickSwitcherResultDetail;

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

	useEffect(() => {
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
	}, []);

	useEffect(() => {
		if (!selected) {
			return;
		}

		const binding = keybindings.registerKeybinding({
			key: 'Enter',
			callback: result.onSelected,
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
	}, [keybindings, result.onSelected, selected]);

	useScrollIntoViewOnSelected(ref, selected);

	const style = useMemo(() => {
		return {
			...container,
			backgroundColor: hovered || selected ? WHITE_ALPHA_06 : TRANSPARENT,
		};
	}, [hovered, selected]);

	const labelStyle = useMemo(() => {
		return {
			...(result.type === 'search-result' ? searchLabel : label),
			color:
				result.type === 'search-result'
					? LIGHT_TEXT
					: selected || hovered
						? WHITE
						: LIGHT_TEXT,
			fontSize: QUICK_SWITCHER_RESULT_LABEL_FONT_SIZE,
		};
	}, [hovered, result.type, selected]);

	return (
		<div ref={ref} key={result.id} style={style} onClick={result.onSelected}>
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
};
