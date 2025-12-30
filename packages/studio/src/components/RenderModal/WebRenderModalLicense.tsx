import React, {useCallback, useState} from 'react';
import {
	BLUE,
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_UNHOVERED,
	LIGHT_TEXT,
} from '../../helpers/colors';
import {Checkbox} from '../Checkbox';
import {RemotionInput} from '../NewComposition/RemInput';
import {Spacing} from '../layout';

type WebRenderModalLicenseProps = {
	readonly freeLicense: boolean;
	readonly setFreeLicense: React.Dispatch<React.SetStateAction<boolean>>;
	readonly licenseKey: string;
	readonly setLicenseKey: React.Dispatch<React.SetStateAction<string>>;
};

export const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	paddingLeft: 16,
	paddingRight: 16,
};

const tabContainer: React.CSSProperties = {
	flex: 1,
};

const descriptionStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 14,
	fontFamily: 'sans-serif',
	paddingLeft: 16,
	paddingRight: 16,
	paddingTop: 16,
	paddingBottom: 8,
	lineHeight: 1.5,
};

const paddedDescriptionStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 14,
	fontFamily: 'sans-serif',
	padding: 9,
	border: '1px solid ' + INPUT_BORDER_COLOR_UNHOVERED,
	borderRadius: 8,
	lineHeight: 1.5,
	marginLeft: 16,
	marginRight: 16,
};

const descriptionLink: React.CSSProperties = {
	color: 'white',
	fontSize: 14,
};

const checkboxLabel: React.CSSProperties = {
	fontSize: 14,
	lineHeight: '40px',
	color: LIGHT_TEXT,
	flex: 1,
	fontFamily: 'sans-serif',
	cursor: 'pointer',
	userSelect: 'none',
};

const inputStyle: React.CSSProperties = {
	minWidth: 250,
};

const justifyCenter: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 10,
	flex: 1,
};

const codeStyle: React.CSSProperties = {
	fontSize: 14,
	fontFamily: 'monospace',
	color: BLUE,
};

const codeLine: React.CSSProperties = {
	fontSize: 14,
	fontFamily: 'monospace',
	color: LIGHT_TEXT,
	backgroundColor: INPUT_BACKGROUND,
	padding: 6,
	borderRadius: 3,
	marginTop: 6,
};

export const WebRenderModalLicense: React.FC<WebRenderModalLicenseProps> = ({
	freeLicense,
	setFreeLicense,
	licenseKey,
	setLicenseKey,
}) => {
	const [companyLicense, setCompanyLicense] = useState(false);

	const onFreeLicenseChange = useCallback(() => {
		if (freeLicense) {
			// Deselect free license
			setFreeLicense(false);
		} else {
			// Select free license, deselect company license
			setFreeLicense(true);
			setCompanyLicense(false);
		}
	}, [freeLicense, setFreeLicense]);

	const onCompanyLicenseChange = useCallback(() => {
		if (companyLicense) {
			// Deselect company license
			setCompanyLicense(false);
		} else {
			// Select company license, deselect free license
			setCompanyLicense(true);
			setFreeLicense(false);
		}
	}, [companyLicense, setFreeLicense]);

	const onLicenseKeyChange: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				setLicenseKey(e.target.value);
			},
			[setLicenseKey],
		);

	return (
		<div style={tabContainer}>
			<div style={descriptionStyle}>
				Remotion is free if you are an individual or company with a headcount of
				3 or less. See{' '}
				<a style={descriptionLink} href="https://remotion.dev/license">
					LICENSE.md
				</a>
				.
			</div>
			<div style={row}>
				<div style={justifyCenter}>
					<Checkbox
						checked={freeLicense}
						onChange={onFreeLicenseChange}
						name="free-license"
						rounded
					/>
					<div style={checkboxLabel} onClick={onFreeLicenseChange}>
						I am eligible for the free license, {"don't"} print a warning
					</div>
				</div>
			</div>
			{freeLicense ? (
				<div style={paddedDescriptionStyle}>
					Enjoy Remotion! Add the following to{' '}
					<code style={codeStyle}>remotion.config.ts</code> to persist this
					setting:
					<div style={codeLine}>
						{"Config.setPublicLicenseKey('free-license');"}
					</div>
				</div>
			) : null}
			<div style={row}>
				<div style={justifyCenter}>
					<Checkbox
						checked={companyLicense}
						onChange={onCompanyLicenseChange}
						name="company-license"
						rounded
					/>

					<div style={checkboxLabel} onClick={onCompanyLicenseChange}>
						I have a company license
					</div>
				</div>
			</div>
			{freeLicense ? null : (
				<div style={paddedDescriptionStyle}>
					If you are not eligible for the free license, you need to obtain a{' '}
					<a
						style={descriptionLink}
						target="_blank"
						href="https://remotion.pro/license"
					>
						Company License
					</a>
					. <br /> If you have one, add your public license from{' '}
					<a
						href="https://remotion.pro/dashboard"
						target="_blank"
						style={descriptionLink}
					>
						remotion.pro
					</a>{' '}
					key below.
					<Spacing y={1} block />
					<RemotionInput
						value={licenseKey}
						onChange={onLicenseKeyChange}
						placeholder="remotion.pro public license key (starts with rm_pub_)"
						status="ok"
						rightAlign={false}
						style={inputStyle}
						disabled={freeLicense}
					/>
				</div>
			)}
		</div>
	);
};
