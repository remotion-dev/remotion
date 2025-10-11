import React from 'react';
import {Grid} from '../Grid';
import {TOCItem} from '../TOCItem';

export const Timings: React.FC<{
	readonly apisOnly: boolean;
}> = ({apisOnly}) => {
	return (
		<Grid>
			<TOCItem link="/docs/transitions/timings/springtiming">
				<strong>
					<code>{'springTiming()'}</code>
				</strong>
				<div>
					Transition with a <code>spring()</code>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/timings/lineartiming">
				<strong>
					<code>{'linearTiming()'}</code>
				</strong>
				<div>Transition linearly with optional Easing</div>
			</TOCItem>
			{apisOnly ? null : (
				<TOCItem link="/docs/transitions/timings/custom">
					<strong>Custom timings</strong>
					<div>Implement your own timing</div>
				</TOCItem>
			)}
		</Grid>
	);
};
