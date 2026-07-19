import type React from 'react';
import type {_InternalTypes} from 'remotion';
import {isCompositionStill} from '../helpers/is-composition-still';
import {StillIcon} from '../icons/still';
import {FilmIcon} from '../icons/video';

export const CompositionOrStillIcon: React.FC<{
	readonly color: string;
	readonly composition: _InternalTypes['AnyComposition'];
	readonly style: React.CSSProperties;
}> = ({color, composition, style}) => {
	return isCompositionStill(composition) ? (
		<StillIcon color={color} style={style} />
	) : (
		<FilmIcon color={color} style={style} />
	);
};
