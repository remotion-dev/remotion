import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/gsap/use-gsap-timeline">
					<strong>
						<code>useGsapTimeline()</code>
					</strong>
					<div>Build a GSAP timeline that is driven by the Remotion frame</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
