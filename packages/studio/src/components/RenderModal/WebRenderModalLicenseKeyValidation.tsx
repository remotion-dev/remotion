import React, {useEffect} from 'react';
import {BLUE, LIGHT_TEXT} from '../../helpers/colors';

const textStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 14,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
};

const linkStyle: React.CSSProperties = {
	fontSize: 14,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
	cursor: 'pointer',
};

const projectNameStyle: React.CSSProperties = {
	color: BLUE,
	fontSize: 14,
	fontFamily: 'monospace',
	lineHeight: 1.5,
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
					<span style={projectNameStyle}>{validation.projectName}</span>
					{validation.hasActiveSubscription && (
						<span style={textStyle}>
							{' '}
							- You have an active Company License.{' '}
						</span>
					)}
					<span style={textStyle}>
						Check your{' '}
						<a
							href={`${PRO_HOST}/projects/${validation.projectSlug}/usage#client-renders-usage`}
							target="_blank"
							style={linkStyle}
						>
							usage here
						</a>
					</span>
				</div>
			)}
		</div>
	);
};
