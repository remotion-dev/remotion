import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/pricing">
					<strong>{'License & Pricing'}</strong>
					<div>Free license eligibility, company and enterprise pricing</div>
				</TOCItem>
				<TOCItem link="/docs/license-pricing-compliance/faq">
					<strong>{'FAQs'}</strong>
					<div>Frequently asked questions about licensing and pricing</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
