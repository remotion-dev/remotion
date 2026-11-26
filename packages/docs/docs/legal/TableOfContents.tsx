import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/privacy">
					<strong>Privacy Policy</strong>
					<div>How Remotion collects, uses, and protects personal data</div>
				</TOCItem>
				<TOCItem link="/docs/dpa">
					<strong>DPA Statement</strong>
					<div>
						How Remotion handles personal data for its licensing platform
					</div>
				</TOCItem>
				<TOCItem link="/docs/dpia">
					<strong>DPIA Statement</strong>
					<div>
						Why Remotion&apos;s licensing platform does not require a formal
						DPIA
					</div>
				</TOCItem>
				<TOCItem link="/docs/vat-registration">
					<strong>VAT registration certificate</strong>
					<div>Remotion AG’s Swiss VAT number and proof of registration</div>
				</TOCItem>
				<TOCItem link="/docs/w8ben-e">
					<strong>Request W-8BEN-E</strong>
					<div>Signed tax form for U.S. vendor onboarding</div>
				</TOCItem>
				<TOCItem link="/docs/acknowledgements">
					<strong>Acknowledgements</strong>
					<div>Software and contributors that make Remotion possible</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
