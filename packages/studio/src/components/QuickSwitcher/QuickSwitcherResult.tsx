import React, {useEffect, useMemo, useRef, useState} from 'react';
import {LIGHT_TEXT, getBackgroundFromHoverState} from '../../helpers/colors';
import {useKeybinding} from '../../helpers/use-keybinding';
import {StillIcon} from '../../icons/still';
import {FilmIcon} from '../../icons/video';
import {Spacing} from '../layout';

type QuickSwitcherResultDetail =
	| {
			type: 'composition';
			compositionType: 'composition' | 'still';
	  }
	| {
			type: 'menu-item';
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
	cursor: 'pointer',
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
	width: 14,
	height: 14,
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
			// Input will be focused while sleection
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			binding.unregister();
		};
	}, [keybindings, result.onSelected, selected]);

	useEffect(() => {
		if (selected) {
			ref.current?.scrollIntoView({
				block: 'nearest',
				inline: 'center',
			});
		}
	}, [selected]);

	const style = useMemo(() => {
		return {
			...container,
			backgroundColor: getBackgroundFromHoverState({
				hovered,
				selected,
			}),
		};
	}, [hovered, selected]);

	const labelStyle = useMemo(() => {
		return {
			...(result.type === 'search-result' ? searchLabel : label),
			color:
				result.type === 'search-result'
					? LIGHT_TEXT
					: selected || hovered
						? 'white'
						: LIGHT_TEXT,
			fontSize: 15,
		};
	}, [hovered, result.type, selected]);

	return (
		<div ref={ref} key={result.id} style={style} onClick={result.onSelected}>
			{result.type === 'composition' ? (
				result.compositionType === 'still' ? (
					<StillIcon
						color={selected ? 'white' : LIGHT_TEXT}
						style={iconStyle}
					/>
				) : (
					<FilmIcon color={selected ? 'white' : LIGHT_TEXT} style={iconStyle} />
				)
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
