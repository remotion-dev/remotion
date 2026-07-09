import React, {useMemo} from 'react';
import {CompanyPricing, EnterpriseLicense, FreePricing} from './FreePricing';

export const Pricing: React.FC<{
	readonly faqHref?: string;
	readonly faqLabel?: string;
	readonly licenseHref?: string;
	readonly termsHref?: string;
}> = ({
	faqHref = '/docs/license/faq',
	faqLabel = 'License FAQ',
	licenseHref = 'https://github.com/remotion-dev/remotion/blob/main/LICENSE.md',
	termsHref = 'https://www.remotion.dev/docs/license/terms',
}) => {
	const faqLinkTarget = useMemo(() => {
		return faqHref.startsWith('http') ? '_blank' : undefined;
	}, [faqHref]);

	const licenseLinkTarget = useMemo(() => {
		return licenseHref.startsWith('http') ? '_blank' : undefined;
	}, [licenseHref]);

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
					<a
						target={licenseLinkTarget}
						className="bluelink"
						href={licenseHref}
					>
						LICENSE.md
					</a>
					{', '}
					<a target={faqLinkTarget} className="bluelink" href={faqHref}>
						{faqLabel}
					</a>
					{', and '}
					<a target={termsLinkTarget} className="bluelink" href={termsHref}>
						Terms and Conditions
					</a>{' '}
					for more details.
				</div>
			</div>
		</div>
	);
};
