import React from 'react';
import {CompanyPricing} from './CompanyPricing';
import {EnterpriseLicense} from './EnterpriseLicense';
import {FreePricing} from './FreePricing';

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
					<a target="_blank" href="https://remotion.pro/faq">
						FAQ
					</a>{' '}
					and{' '}
					<a target="_blank" href="https://www.remotion.pro/terms">
						Terms and Conditions
					</a>{' '}
					for more details.
				</div>
			</div>
			<div
				style={{
					justifyContent: 'center',
					display: 'flex',
				}}
			>
				<div style={{fontFamily: 'GTPlanar'}}>
					Want a 20-minute call to evaluate if Remotion is right for you?{' '}
					<a
						style={{
							color: 'var(--ifm-color-primary)',
							textDecoration: 'none',
						}}
						target="_blank"
						href="https://cal.com/remotion/evaluate"
					>
						Contact us
					</a>
				</div>
			</div>
			<div
				style={{
					justifyContent: 'center',
					display: 'flex',
				}}
			>
				<div style={{marginTop: 0, fontFamily: 'GTPlanar'}}>
					Looking for help realizing your project?{' '}
					<a
						style={{
							color: 'var(--ifm-color-primary)',
							textDecoration: 'none',
						}}
						href="/experts"
					>
						Find experts
					</a>
				</div>
			</div>
		</div>
	);
};
