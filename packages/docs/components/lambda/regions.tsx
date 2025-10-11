import {AWS_REGIONS} from '@remotion/lambda-client/regions';
import React from 'react';

export const LambdaRegionList: React.FC = () => {
	return (
		<ul>
			{AWS_REGIONS.map((region) => {
				return (
					<li key={region}>
						<code>{region}</code>{' '}
					</li>
				);
			})}
		</ul>
	);
};
