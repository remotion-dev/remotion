import React from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {Spacing} from '../layout';

export const SlugPreview: React.FC<{
	readonly action: 'create' | 'rename';
	readonly currentName: string | null;
	readonly input: string;
	readonly slug: string;
}> = ({action, currentName, input, slug}) => {
	if (
		!slug ||
		slug === input ||
		slug === input.trim() ||
		slug === currentName
	) {
		return null;
	}

	return (
		<>
			<Spacing y={1} block />
			<div aria-live="polite" style={{fontSize: 12, color: LIGHT_TEXT}}>
				Will be {action === 'create' ? 'created as' : 'renamed to'} {slug}
			</div>
		</>
	);
};
