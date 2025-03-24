import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/timeline/demo">
					<strong>Demo</strong>
					<div>
						<p>Video walkthrough of the timeline component</p>
					</div>
				</TOCItem>
				<TOCItem link="/docs/timeline/setup">
					<strong>Setup</strong>
					<div>Installation and configuration guide</div>
				</TOCItem>
				<TOCItem link="/docs/timeline/usage">
					<strong>Usage</strong>
					<div>Component integration and state management</div>
				</TOCItem>
				<TOCItem link="/docs/timeline/faq">
					<strong>FAQ</strong>
					<div>Frequently asked questions</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
