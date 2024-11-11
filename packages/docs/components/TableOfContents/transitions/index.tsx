import React from 'react';
import {Grid} from '../Grid';
import {TOCItem} from '../TOCItem';
import {Presentations} from './presentations';
import {Timings} from './timings';

export const TableOfContents: React.FC<{
	readonly apisOnly?: boolean;
}> = ({apisOnly}) => {
	return (
		<div>
			<h3>Components</h3>
			<Grid>
				<TOCItem link="/docs/transitions/transitionseries">
					<strong>
						<code>{'<TransitionSeries>'}</code>
					</strong>
					<div>
						A <code>{'<Series>'}</code> with transitions inbetween
					</div>
				</TOCItem>
			</Grid>
			<h3>Timings</h3>
			<Timings apisOnly={Boolean(apisOnly)} />
			<h3>Presentations</h3>
			<p>Hover over an effect to see the preview.</p>
			<Presentations apisOnly={Boolean(apisOnly)} />
		</div>
	);
};
