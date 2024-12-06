import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/licensing/register-usage-point">
					<strong>{'registerUsagePoint()'}</strong>
					<div>Register a cloud render or WebCodecs conversion</div>
				</TOCItem>
				<TOCItem link="/docs/licensing/get-usage">
					<strong>{'getUsage()'}</strong>
					<div>Query usage of company license</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
