import type React from 'react';
import {useCallback} from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {Checkbox} from '../Checkbox';
import {RemotionInput} from '../NewComposition/RemInput';
import {label, optionRow, rightRow} from './layout';

type WebRenderModalLicenseProps = {
	readonly freeLicense: boolean;
	readonly setFreeLicense: React.Dispatch<React.SetStateAction<boolean>>;
	readonly licenseKey: string;
	readonly setLicenseKey: React.Dispatch<React.SetStateAction<string>>;
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

const inputStyle: React.CSSProperties = {
	minWidth: 250,
};

export const WebRenderModalLicense: React.FC<WebRenderModalLicenseProps> = ({
	freeLicense,
	setFreeLicense,
	licenseKey,
	setLicenseKey,
}) => {
	const onFreeLicenseChange = useCallback(() => {
		setFreeLicense((prev) => !prev);
	}, [setFreeLicense]);

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
				Remotion can be used for free if you are an individual or company with a
				headcount of 3 or less people.
			</div>
			<div style={optionRow}>
				<div style={label}>I am eligible for the free license</div>
				<div style={rightRow}>
					<Checkbox
						checked={freeLicense}
						onChange={onFreeLicenseChange}
						name="free-license"
					/>
				</div>
			</div>
			<div style={descriptionStyle}>
				If you are not eligible for the free license, you need to obtain a
				company license. If you have one, add your public license key below.
			</div>
			<div style={optionRow}>
				<div style={label}>License Key</div>
				<div style={rightRow}>
					<RemotionInput
						value={licenseKey}
						onChange={onLicenseKeyChange}
						placeholder="Enter your license key"
						status="ok"
						rightAlign={false}
						style={inputStyle}
						disabled={freeLicense}
					/>
				</div>
			</div>
		</div>
	);
};
