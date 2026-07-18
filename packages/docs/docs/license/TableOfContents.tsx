import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/license/pricing">
					<strong>{'License & Pricing'}</strong>
					<div>Free license eligibility, company and enterprise pricing</div>
				</TOCItem>
				<TOCItem link="/docs/license/faq">
					<strong>{'License FAQ'}</strong>
					<div>Frequently asked questions about licensing and pricing</div>
				</TOCItem>
				<TOCItem link="/docs/license/terms">
					<strong>{'Terms and Conditions'}</strong>
					<div>Legal terms governing the use of Remotion</div>
				</TOCItem>
				<TOCItem link="/docs/license/privacy">
					<strong>{'Privacy Policy'}</strong>
					<div>How Remotion collects, uses, and protects personal data</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
