import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {getBackgroundFromHoverState} from '../../helpers/colors';
import {FilmIcon} from '../../icons/film';
import {StillIcon} from '../../icons/still';
import {Row, Spacing} from '../layout';

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
	const ref = useRef<HTMLButtonElement>(null);
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
			color: 'white',
			appearance: 'none',
			border: 'none',
		};
	}, [hovered, selected]);

	const onClick = useCallback(() => {
		onSelected(type);
	}, [onSelected, type]);

	return (
		<button ref={ref} type="button" style={style} onClick={onClick}>
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
		</button>
	);
};

export const CompositionType: React.FC<{
	type: CompType;
	onSelected: (type: CompType) => void;
}> = ({onSelected, type}) => {
	return (
		<Row>
			<Panel
				onSelected={onSelected}
				type="composition"
				selected={type === 'composition'}
			/>
			<Panel onSelected={onSelected} type="still" selected={type === 'still'} />
		</Row>
	);
};
