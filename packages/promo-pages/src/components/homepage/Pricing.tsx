import React, {useMemo} from 'react';
import {CompanyPricing, EnterpriseLicense, FreePricing} from './FreePricing';

export const Pricing: React.FC<{
	readonly faqHref?: string;
	readonly termsHref?: string;
}> = ({
	faqHref = '/docs/license-pricing-compliance/faq',
	termsHref = 'https://www.remotion.pro/terms',
}) => {
	const faqLinkTarget = useMemo(() => {
		return faqHref.startsWith('http') ? '_blank' : undefined;
	}, [faqHref]);

	const termsLinkTarget = useMemo(() => {
		return termsHref.startsWith('http') ? '_blank' : undefined;
	}, [termsHref]);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 20,
				marginBottom: 40,
			}}
		>
			<FreePricing />
			<CompanyPricing />
			<EnterpriseLicense />
			<div
				style={{
					justifyContent: 'center',
					display: 'flex',
				}}
			>
				<div
					style={{
						fontFamily: 'GTPlanar',
					}}
				>
					See our{' '}
					<a target={faqLinkTarget} className="bluelink" href={faqHref}>
						FAQ
					</a>{' '}
					and{' '}
					<a target={termsLinkTarget} className="bluelink" href={termsHref}>
						Terms and Conditions
					</a>{' '}
					for more details.
				</div>
			</div>
		</div>
	);
};
