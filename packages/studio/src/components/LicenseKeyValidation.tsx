import React from 'react';
import {FAIL_COLOR} from '../helpers/colors';
import {CheckCircleFilled} from '../icons/check-circle-filled';
import {InspectorInlineAction} from './InspectorPanel/common';

const LICENSE_KEY_LENGTH = 55;
const LICENSE_KEY_PREFIX = 'rm_pub_';
const PRO_HOST = 'https://www.remotion.pro';

export type LicenseKeyDetails = {
	readonly isValid: boolean;
	readonly hasActiveSubscription: boolean | null;
	readonly projectName: string;
	readonly projectSlug: string;
};

export const hasActiveCompanyLicense = (details: LicenseKeyDetails) => {
	return details.hasActiveSubscription === true;
};

export type LicenseKeyValidationResult = {
	readonly valid: boolean;
	readonly message: string | null;
};

export const validateLicenseKey = (key: string): LicenseKeyValidationResult => {
	if (key.length === 0) {
		return {valid: false, message: null};
	}

	if (!key.startsWith(LICENSE_KEY_PREFIX)) {
		return {
			valid: false,
			message: `License key must start with "${LICENSE_KEY_PREFIX}"`,
		};
	}

	const afterPrefix = key.slice(LICENSE_KEY_PREFIX.length);
	if (!/^[a-zA-Z0-9]*$/.test(afterPrefix)) {
		return {
			valid: false,
			message:
				'License key must contain only alphanumeric characters after the prefix',
		};
	}

	if (key.length !== LICENSE_KEY_LENGTH) {
		return {
			valid: false,
			message: `License key must be ${LICENSE_KEY_LENGTH} characters long`,
		};
	}

	return {valid: true, message: null};
};

export const fetchLicenseKeyDetails = async (
	licenseKey: string,
): Promise<LicenseKeyDetails> => {
	const response = await fetch(`${PRO_HOST}/api/validate-license-key`, {
		method: 'POST',
		body: JSON.stringify({
			licenseKey,
		}),
		headers: {
			'Content-Type': 'application/json',
		},
	});

	return response.json();
};

const actionStyle: React.CSSProperties = {
	cursor: 'pointer',
	marginLeft: 0,
	marginRight: 0,
	width: '100%',
};

const actionContent: React.CSSProperties = {
	alignItems: 'center',
	color: 'inherit',
	display: 'flex',
	fontFamily: 'sans-serif',
	fontSize: 13,
	gap: 8,
	lineHeight: '18px',
	minWidth: 0,
	width: '100%',
};

const actionText: React.CSSProperties = {
	color: 'inherit',
	flex: 1,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '18px',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const actionLabel: React.CSSProperties = {
	color: 'inherit',
	flexShrink: 0,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '18px',
};

const inactiveLicenseText: React.CSSProperties = {
	...actionText,
	color: FAIL_COLOR,
};

const iconStyle: React.CSSProperties = {
	width: 14,
	height: 14,
	flexShrink: 0,
};

const ErrorIcon: React.FC = () => {
	return (
		<svg style={iconStyle} viewBox="0 0 512 512">
			<path
				fill={FAIL_COLOR}
				d="M0 160V352L160 512H352L512 352V160L352 0H160L0 160zm353.9 32l-17 17-47 47 47 47 17 17L320 353.9l-17-17-47-47-47 47-17 17L158.1 320l17-17 47-47-47-47-17-17L192 158.1l17 17 47 47 47-47 17-17L353.9 192z"
			/>
		</svg>
	);
};

export const LicenseKeyDetailsDisplay: React.FC<{
	readonly details: LicenseKeyDetails;
}> = ({details}) => {
	const projectUrl = `${PRO_HOST}/projects/${details.projectSlug}`;
	const usageUrl = `${projectUrl}/usage#client-renders-usage`;
	const hasActiveLicense = hasActiveCompanyLicense(details);

	return (
		<div>
			<InspectorInlineAction
				disabled={false}
				onClick={() => window.open(usageUrl, '_blank', 'noopener,noreferrer')}
				renderIcon={(color) => (
					<CheckCircleFilled style={{...iconStyle, fill: color}} />
				)}
				style={actionStyle}
				title="View license usage"
			>
				<span style={actionContent}>
					<span style={actionText}>Belongs to {details.projectName}</span>
					<span style={actionLabel}>View usage</span>
				</span>
			</InspectorInlineAction>
			<InspectorInlineAction
				disabled={false}
				onClick={() => window.open(projectUrl, '_blank', 'noopener,noreferrer')}
				renderIcon={(color) =>
					hasActiveLicense ? (
						<CheckCircleFilled style={{...iconStyle, fill: color}} />
					) : (
						<ErrorIcon />
					)
				}
				style={actionStyle}
				title="Manage Company License"
			>
				<span style={actionContent}>
					<span style={hasActiveLicense ? actionText : inactiveLicenseText}>
						{hasActiveLicense
							? 'Active Company License'
							: 'No active Company License'}
					</span>
					<span style={actionLabel}>Manage</span>
				</span>
			</InspectorInlineAction>
		</div>
	);
};
