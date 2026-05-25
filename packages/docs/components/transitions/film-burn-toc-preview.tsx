import React from 'react';
import {filmBurn} from '@remotion/transitions/film-burn';
import {PresentationPreview} from './previews';

export const FilmBurnTocPreview: React.FC = () => {
	return (
		<PresentationPreview
			durationRestThreshold={0.001}
			effect={filmBurn({})}
		/>
	);
};
