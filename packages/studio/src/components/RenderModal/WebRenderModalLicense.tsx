import React, {useCallback} from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {Checkbox} from '../Checkbox';
import {RemotionInput} from '../NewComposition/RemInput';
import {InlineEyeButton} from './InlineEyeIcon';
import {optionRow} from './layout';

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

export const WebRenderModalLicense: React.FC<WebRenderModalLicenseProps> = ({
	freeLicense,
	setFreeLicense,
	licenseKey,
	setLicenseKey,
}) => {
	const onFreeLicenseChange = useCallback(() => {
		setFreeLicense((prev) => !prev);
	}, [setFreeLicense]);

	const [showInPlainText, setShowInPlainText] = React.useState(false);

	const togglePlainText = useCallback(() => {
		setShowInPlainText((prev) => !prev);
	}, []);

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
			<div style={optionRow}>
				<div style={justifyCenter}>
					<Checkbox
						checked={freeLicense}
						onChange={onFreeLicenseChange}
						name="free-license"
					/>

					<div style={checkboxLabel}>
						I am eligible for the free license, {"don't"} print a warning
					</div>
				</div>
			</div>
			{freeLicense ? null : (
				<>
					<div style={descriptionStyle}>
						If you are not eligible for the free license, you need to obtain a{' '}
						<a
							style={descriptionLink}
							target="_blank"
							href="https://remotion.pro/license"
						>
							Company License
						</a>
						. <br /> If you have one, add your public license key below.
					</div>
					<div style={optionRow}>
						<div style={justifyCenter}>
							<RemotionInput
								value={licenseKey}
								onChange={onLicenseKeyChange}
								placeholder="remotion.pro public license key (starts with rm_pub_)"
								status="ok"
								rightAlign={false}
								style={inputStyle}
								disabled={freeLicense}
							/>
							<InlineEyeButton
								enabled={!showInPlainText}
								onClick={togglePlainText}
							/>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
