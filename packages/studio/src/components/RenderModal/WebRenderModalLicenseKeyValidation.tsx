import React, {useEffect} from 'react';
import {LIGHT_TEXT, WARNING_COLOR} from '../../helpers/colors';
import {CheckCircleFilled} from '../../icons/check-circle-filled';
import {WarningTriangle} from '../NewComposition/ValidationMessage';

const textStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 14,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
	display: 'flex',
	alignItems: 'center',
};

const linkStyle: React.CSSProperties = {
	fontSize: 14,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
	cursor: 'pointer',
};

const bulletStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 6,
};

const icon: React.CSSProperties = {
	width: 14,
	height: 14,
	flexShrink: 0,
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
			{validation && !validation.isValid && (
				<div style={bulletStyle}>
					<WarningTriangle
						type="warning"
						style={{...icon, fill: WARNING_COLOR}}
					/>
					<div style={textStyle}>Invalid license key</div>
				</div>
			)}
			{validation && validation.isValid && (
				<div>
					<div style={bulletStyle}>
						<CheckCircleFilled style={{...icon, fill: LIGHT_TEXT}} />
						<div style={textStyle}>
							Belongs to&nbsp;
							<a
								href={`${PRO_HOST}/projects/${validation.projectSlug}`}
								target="_blank"
								style={linkStyle}
							>
								{validation.projectName}
							</a>
							&nbsp;- View&nbsp;
							<a
								href={`${PRO_HOST}/projects/${validation.projectSlug}/usage#client-renders-usage`}
								target="_blank"
								style={linkStyle}
							>
								usage
							</a>
						</div>
					</div>
					{validation.hasActiveSubscription && (
						<div style={bulletStyle}>
							<CheckCircleFilled style={{...icon, fill: LIGHT_TEXT}} />
							<div style={textStyle}>Active Company License</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
