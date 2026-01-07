import React, {useEffect} from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {CheckCircleFilled} from '../../icons/check-circle-filled';

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

export type LicenseKeyDetails = {
	readonly isValid: boolean;
	readonly hasActiveSubscription: boolean;
	readonly projectName: string;
	readonly projectSlug: string;
};

type UseLicenseKeyDetailsState = {
	readonly isLoading: boolean;
	readonly details: LicenseKeyDetails | null;
};

type WebRenderModalLicenseKeyDetailsProps = {
	readonly details: LicenseKeyDetails;
};

const PRO_HOST = 'https://remotion.pro';

export const useLicenseKeyDetails = (
	licenseKey: string | null,
): UseLicenseKeyDetailsState => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [details, setDetails] = React.useState<LicenseKeyDetails | null>(null);

	useEffect(() => {
		if (licenseKey) {
			setIsLoading(true);
			setDetails(null);
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
					setDetails(data);
					setIsLoading(false);
				})
				.catch(() => {
					setDetails(null);
				});
		}
	}, [licenseKey]);

	return {isLoading, details};
};

export const WebRenderModalLicenseKeyDetails: React.FC<
	WebRenderModalLicenseKeyDetailsProps
> = ({details}) => {
	return (
		<div>
			<div style={bulletStyle}>
				<CheckCircleFilled style={{...icon, fill: LIGHT_TEXT}} />
				<div style={textStyle}>
					Belongs to&nbsp;
					<a
						href={`${PRO_HOST}/projects/${details.projectSlug}`}
						target="_blank"
						style={linkStyle}
					>
						{details.projectName}
					</a>
					&nbsp;- View&nbsp;
					<a
						href={`${PRO_HOST}/projects/${details.projectSlug}/usage#client-renders-usage`}
						target="_blank"
						style={linkStyle}
					>
						usage
					</a>
				</div>
			</div>
			{details.hasActiveSubscription && (
				<div style={bulletStyle}>
					<CheckCircleFilled style={{...icon, fill: LIGHT_TEXT}} />
					<div style={textStyle}>Active Company License</div>
				</div>
			)}
		</div>
	);
};
