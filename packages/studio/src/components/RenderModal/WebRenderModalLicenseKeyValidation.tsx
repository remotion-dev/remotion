import React, {useEffect} from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {Checkmark} from '../../icons/Checkmark';

const textStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 14,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
	display: 'flex',
	alignItems: 'center',
	gap: 8,
};

const linkStyle: React.CSSProperties = {
	fontSize: 14,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
	cursor: 'pointer',
};

type WebRenderModalLicenseKeyValidationProps = {
	readonly licenseKey: string | null;
};

type LicenseKeyValidationResult = {
	readonly isValid: boolean;
	readonly hasActiveSubscription: boolean;
	readonly projectName: string;
	readonly projectSlug: string;
};

const PRO_HOST = 'https://remotion.pro';

export const WebRenderModalLicenseKeyValidation: React.FC<
	WebRenderModalLicenseKeyValidationProps
> = ({licenseKey}) => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [validation, setValidation] =
		React.useState<LicenseKeyValidationResult | null>(null);

	useEffect(() => {
		if (licenseKey) {
			setIsLoading(true);
			setValidation(null);
			fetch(`${PRO_HOST}/api/validate-license-key`, {
				method: 'POST',
				body: JSON.stringify({
					licenseKey,
				}),
				headers: {
					'Content-Type': 'application/json',
				},
			})
				.then((res) => res.json())
				.then((data) => {
					setValidation(data);
					setIsLoading(false);
				})
				.catch(() => {
					setValidation(null);
				});
		}
	}, [licenseKey]);

	return (
		<div style={textStyle}>
			{isLoading && 'Validating license key...'}
			{validation && !validation.isValid && '⚠️ Invalid license key'}
			{validation && validation.isValid && (
				<div>
					<div style={textStyle}>
						<Checkmark /> Belongs to{' '}
						<a
							href={`${PRO_HOST}/projects/${validation.projectSlug}`}
							target="_blank"
							style={linkStyle}
						>
							{validation.projectName}
						</a>{' '}
						- View{' '}
						<a
							href={`${PRO_HOST}/projects/${validation.projectSlug}/usage#client-renders-usage`}
							target="_blank"
							style={linkStyle}
						>
							usage
						</a>
					</div>
					{validation.hasActiveSubscription && (
						<div style={textStyle}>
							<Checkmark /> Active Company License
						</div>
					)}
				</div>
			)}
		</div>
	);
};
