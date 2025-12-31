import React, {useCallback, useMemo} from 'react';
import {
	BLUE,
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_UNHOVERED,
	LIGHT_TEXT,
} from '../../helpers/colors';
import {Checkbox} from '../Checkbox';
import {RemotionInput} from '../NewComposition/RemInput';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {Spacing} from '../layout';

type WebRenderModalLicenseProps = {
	readonly licenseKey: string | null;
	readonly setLicenseKey: React.Dispatch<React.SetStateAction<string | null>>;
	readonly initialPublicLicenseKey: string | null;
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
	overflowX: 'auto',
	maxWidth: '100%',
};

const codeLineSmall: React.CSSProperties = {
	...codeLine,
	fontSize: 11,
};

const LICENSE_KEY_LENGTH = 55;
const LICENSE_KEY_PREFIX = 'rm_pub_';

const validateLicenseKey = (
	key: string,
): {valid: boolean; message: string | null} => {
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

export const WebRenderModalLicense: React.FC<WebRenderModalLicenseProps> = ({
	licenseKey,
	setLicenseKey,
	initialPublicLicenseKey,
}) => {
	const onFreeLicenseChange = useCallback(() => {
		setLicenseKey('free-license');
	}, [setLicenseKey]);

	const onCompanyLicenseChange = useCallback(() => {
		setLicenseKey(initialPublicLicenseKey ?? '');
	}, [initialPublicLicenseKey, setLicenseKey]);

	const onLicenseKeyChange: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				setLicenseKey(e.target.value);
			},
			[setLicenseKey],
		);

	const licenseValidation = useMemo(() => {
		if (licenseKey === null || licenseKey === 'free-license') {
			return {valid: true, message: null};
		}

		return validateLicenseKey(licenseKey);
	}, [licenseKey]);

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
						checked={licenseKey === 'free-license'}
						onChange={onFreeLicenseChange}
						name="free-license"
						rounded
					/>
					<div style={checkboxLabel} onClick={onFreeLicenseChange}>
						I am eligible for the free license, {"don't"} print a warning
					</div>
				</div>
			</div>
			{licenseKey === 'free-license' ? (
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
						checked={licenseKey !== 'free-license' && licenseKey !== null}
						onChange={onCompanyLicenseChange}
						name="company-license"
						rounded
					/>

					<div style={checkboxLabel} onClick={onCompanyLicenseChange}>
						I have a company license
					</div>
				</div>
			</div>
			{licenseKey !== 'free-license' && licenseKey !== null ? (
				<div style={paddedDescriptionStyle}>
					Add your public license from{' '}
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
						status={
							licenseValidation.valid || licenseKey.length === 0
								? 'ok'
								: 'error'
						}
						rightAlign={false}
						style={inputStyle}
						autoFocus
					/>
					{licenseValidation.message ? (
						<>
							<Spacing y={1} block />
							<ValidationMessage
								message={licenseValidation.message}
								align="flex-start"
								type="error"
							/>
						</>
					) : null}
					{licenseValidation.valid && licenseKey.length > 0 ? (
						<>
							<Spacing y={1} block />
							Add the following to{' '}
							<code style={codeStyle}>remotion.config.ts</code> to persist this
							setting:
							<div style={codeLineSmall}>
								{"Config.setPublicLicenseKey('" + licenseKey + "');"}
							</div>
						</>
					) : null}
				</div>
			) : null}
			{licenseKey === null ? (
				<div style={descriptionStyle}>
					If you are not eligible for the free license, you need to obtain a{' '}
					<a
						style={descriptionLink}
						target="_blank"
						href="https://remotion.pro/license"
					>
						Company License
					</a>
					.
				</div>
			) : null}
		</div>
	);
};
