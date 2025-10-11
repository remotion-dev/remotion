import React from 'react';
import {CompanyPricing, EnterpriseLicense, FreePricing} from './FreePricing';

export const Pricing: React.FC = () => {
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
						target="_blank"
						className="bluelink"
						href="https://remotion.pro/faq"
					>
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
