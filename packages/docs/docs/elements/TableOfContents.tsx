import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC<{
	readonly section: 'using' | 'creating';
}> = ({section}) => {
	if (section === 'using') {
		return (
			<div>
				<Grid>
					<TOCItem link="/docs/elements/using">
						<strong>Using Elements</strong>
						<div>Find and add Elements with Studio, an AI agent or the CLI</div>
					</TOCItem>
					<TOCItem link="/docs/elements/managing-libraries">
						<strong>Managing Element Libraries</strong>
						<div>Add, rename, reorder and remove libraries in Studio</div>
					</TOCItem>
				</Grid>
			</div>
		);
	}

	return (
		<div>
			<Grid>
				<TOCItem link="/docs/elements/creating">
					<strong>Creating an Element</strong>
					<div>Best practices for design, portability and Studio</div>
				</TOCItem>
				<TOCItem link="/docs/elements/libraries">
					<strong>Building an Element Library</strong>
					<div>Template, Studio protocol and install actions</div>
				</TOCItem>
				<TOCItem link="/docs/elements/distributing">
					<strong>Distributing Elements</strong>
					<div>Free, sponsored or paid, and the official listing</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
