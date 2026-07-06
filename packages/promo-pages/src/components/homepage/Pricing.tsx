import React, {useMemo} from 'react';
import {CompanyPricing, EnterpriseLicense, FreePricing} from './FreePricing';

export const Pricing: React.FC<{
	readonly faqHref?: string;
}> = ({faqHref = '/pricing#faq'}) => {
	const faqLinkTarget = useMemo(() => {
		return faqHref.startsWith('http') ? '_blank' : undefined;
	}, [faqHref]);

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
					<a
						target="_blank"
						className="bluelink"
						href="https://www.remotion.pro/terms"
					>
						Terms and Conditions
					</a>{' '}
					for more details.
				</div>
			</div>
		</div>
	);
};
