import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {getBackgroundFromHoverState} from '../../helpers/colors';
import {FilmIcon} from '../../icons/film';
import {StillIcon} from '../../icons/still';
import {Spacing} from '../Spacing';

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
};

const panel: React.CSSProperties = {
	flex: 1,
	borderRadius: 8,
	padding: 16,
	cursor: 'pointer',
	fontSize: 14,
	flexDirection: 'row',
	display: 'flex',
	alignItems: 'center',
};

export type CompType = 'composition' | 'still';

const Panel: React.FC<{
	selected: boolean;
	type: CompType;
	onSelected: (type: CompType) => void;
}> = ({selected, type, onSelected}) => {
	const ref = useRef<HTMLDivElement>(null);
	const [hovered, setHovered] = useState(false);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		const onMouseEnter = () => setHovered(true);
		const onMouseLeave = () => setHovered(false);

		current.addEventListener('mouseenter', onMouseEnter);
		current.addEventListener('mouseleave', onMouseLeave);
	}, []);

	const style = useMemo((): React.CSSProperties => {
		return {
			...panel,
			backgroundColor: getBackgroundFromHoverState({
				hovered,
				selected,
			}),
		};
	}, [hovered, selected]);

	const onClick = useCallback(() => {
		onSelected(type);
	}, [onSelected, type]);

	return (
		<div ref={ref} style={style} onClick={onClick}>
			{type === 'composition' ? (
				<FilmIcon style={{height: 18, width: 18}} />
			) : (
				<StillIcon style={{height: 18, width: 18}} />
			)}
			<Spacing x={1} />
			<div>
				<strong>{type === 'composition' ? '<Composition>' : '<Still>'}</strong>
				<div>{type === 'composition' ? 'For videos' : 'For still images'}</div>
			</div>
		</div>
	);
};

export const CompositionType: React.FC<{
	type: CompType;
	onSelected: (type: CompType) => void;
}> = ({onSelected, type}) => {
	return (
		<div style={row}>
			<Panel
				onSelected={onSelected}
				type="composition"
				selected={type === 'composition'}
			/>
			<Panel onSelected={onSelected} type="still" selected={type === 'still'} />
		</div>
	);
};
