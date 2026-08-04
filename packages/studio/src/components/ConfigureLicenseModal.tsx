import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {LIGHT_TEXT, WHITE} from '../helpers/colors';
import {callApi} from './call-api';
import {Checkbox} from './Checkbox';
import {Spacing} from './layout';
import {
	fetchLicenseKeyDetails,
	hasActiveCompanyLicense,
	LicenseKeyDetailsDisplay,
	type LicenseKeyDetails,
	validateLicenseKey,
} from './LicenseKeyValidation';
import {ModalButton} from './ModalButton';
import {RemotionInput} from './NewComposition/RemInput';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {SettingsModalFooter} from './SettingsModalFooter';

type LicenseType = 'free' | 'company' | null;

const container: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minWidth: 0,
};

const content: React.CSSProperties = {
	flex: 1,
	padding: 16,
};

const description: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
	margin: 0,
};

const descriptionLink: React.CSSProperties = {
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: '21px',
};

const checkboxRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	cursor: 'pointer',
	marginTop: 5,
	marginBottom: 5,
};

const checkboxLabel: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: '20px',
	cursor: 'pointer',
	userSelect: 'none',
};

const inputLabel: React.CSSProperties = {
	color: LIGHT_TEXT,
	display: 'block',
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '20px',
	marginBottom: 6,
	marginTop: 10,
};

export const LicenseSettings: React.FC<{
	readonly initialPublicLicenseKey: string | null;
	readonly onSaved: () => void;
}> = ({initialPublicLicenseKey, onSaved}) => {
	const initialLicenseType: LicenseType =
		initialPublicLicenseKey === 'free-license'
			? 'free'
			: initialPublicLicenseKey === null
				? null
				: 'company';
	const [licenseType, setLicenseType] =
		useState<LicenseType>(initialLicenseType);
	const [companyLicenseKey, setCompanyLicenseKey] = useState<string>(
		initialLicenseType === 'company' ? (initialPublicLicenseKey ?? '') : '',
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isValidatingLicenseKey, setIsValidatingLicenseKey] = useState(false);
	const [remoteValidationMessage, setRemoteValidationMessage] = useState<
		string | null
	>(null);
	const [licenseKeyDetails, setLicenseKeyDetails] =
		useState<LicenseKeyDetails | null>(null);

	const toggleLicenseType = useCallback(
		(newLicenseType: Exclude<LicenseType, null>) => {
			setLicenseType((currentLicenseType) =>
				currentLicenseType === newLicenseType ? null : newLicenseType,
			);
			setError(null);
		},
		[],
	);

	const toggleFreeLicense = useCallback(() => {
		toggleLicenseType('free');
	}, [toggleLicenseType]);

	const toggleCompanyLicense = useCallback(() => {
		toggleLicenseType('company');
	}, [toggleLicenseType]);

	const publicLicenseKey = useMemo(() => {
		if (licenseType === 'free') {
			return 'free-license';
		}

		if (licenseType === 'company') {
			return companyLicenseKey.trim();
		}

		return '';
	}, [companyLicenseKey, licenseType]);

	const localLicenseKeyValidation = useMemo(
		() => validateLicenseKey(companyLicenseKey.trim()),
		[companyLicenseKey],
	);

	useEffect(() => {
		let cancelled = false;

		setLicenseKeyDetails(null);
		setRemoteValidationMessage(null);

		if (licenseType !== 'company' || !localLicenseKeyValidation.valid) {
			setIsValidatingLicenseKey(false);
			return () => {
				cancelled = true;
			};
		}

		setIsValidatingLicenseKey(true);
		fetchLicenseKeyDetails(companyLicenseKey.trim())
			.then((details) => {
				if (cancelled) {
					return;
				}

				setIsValidatingLicenseKey(false);
				if (details.isValid) {
					setLicenseKeyDetails(details);
				} else {
					setRemoteValidationMessage(
						'License key is invalid or has been reset',
					);
				}
			})
			.catch(() => {
				if (cancelled) {
					return;
				}

				setIsValidatingLicenseKey(false);
				setRemoteValidationMessage('Failed to fetch license key details');
			});

		return () => {
			cancelled = true;
		};
	}, [companyLicenseKey, licenseType, localLicenseKeyValidation.valid]);

	const companyLicenseKeyIsValid =
		localLicenseKeyValidation.valid &&
		licenseKeyDetails?.isValid === true &&
		!isValidatingLicenseKey;

	const submit = useCallback(async () => {
		if (publicLicenseKey.length === 0) {
			setError(
				licenseType === null
					? 'Select a license type.'
					: 'Enter your public license key.',
			);
			return;
		}

		if (licenseType === 'company' && !companyLicenseKeyIsValid) {
			return;
		}

		setIsSubmitting(true);
		setError(null);
		try {
			const response = await callApi('/api/update-public-license', {
				publicLicenseKey,
			});
			if (!response.success) {
				setError(response.reason);
				setIsSubmitting(false);
				return;
			}

			onSaved();
		} catch (err) {
			setError((err as Error).message);
			setIsSubmitting(false);
		}
	}, [companyLicenseKeyIsValid, licenseType, onSaved, publicLicenseKey]);

	return (
		<div style={container}>
			<div style={content}>
				<p style={description}>
					Remotion is free to use if you are an individual or company with a
					headcount of 3 or less.
					<br />
					If used in an organization with 4 people or more, a{' '}
					<a style={descriptionLink} href="https://remotion.pro/license">
						Company License
					</a>
					{' needs to be obtained.'}
				</p>
				<Spacing y={2} />
				<div
					style={checkboxRow}
					onClick={(event) => {
						if (!(event.target instanceof HTMLInputElement)) {
							toggleFreeLicense();
						}
					}}
				>
					<Checkbox
						checked={licenseType === 'free'}
						onChange={toggleFreeLicense}
						name="free-license"
						rounded
					/>
					<Spacing x={1} />
					<div style={checkboxLabel}>I am eligible for the Free License</div>
				</div>
				<div
					style={checkboxRow}
					onClick={(event) => {
						if (!(event.target instanceof HTMLInputElement)) {
							toggleCompanyLicense();
						}
					}}
				>
					<Checkbox
						checked={licenseType === 'company'}
						onChange={toggleCompanyLicense}
						name="company-license"
						rounded
					/>
					<Spacing x={1} />
					<div style={checkboxLabel}>I need a Company License</div>
				</div>
				{licenseType === 'company' ? (
					<>
						<p style={description}>
							Visit{' '}
							<a style={descriptionLink} href="https://remotion.pro/license">
								remotion.pro/license
							</a>{' '}
							to obtain a license key. Enter the public license key from
							{' "License Keys".'}
						</p>
						<label style={inputLabel}>
							Public license key
							<RemotionInput
								status={
									localLicenseKeyValidation.message ||
									remoteValidationMessage ||
									(licenseKeyDetails !== null &&
										!hasActiveCompanyLicense(licenseKeyDetails))
										? 'error'
										: 'ok'
								}
								rightAlign={false}
								value={companyLicenseKey}
								onChange={(event) => {
									setCompanyLicenseKey(event.target.value);
									setError(null);
								}}
								placeholder="rm_pub_..."
								autoFocus
							/>
						</label>
						{localLicenseKeyValidation.message ? (
							<>
								<Spacing y={1} />
								<ValidationMessage
									message={localLicenseKeyValidation.message}
									align="flex-start"
									type="error"
								/>
							</>
						) : null}
						{remoteValidationMessage ? (
							<>
								<Spacing y={1} />
								<ValidationMessage
									message={remoteValidationMessage}
									align="flex-start"
									type="error"
								/>
							</>
						) : null}
						{isValidatingLicenseKey ? (
							<>
								<Spacing y={1} />
								<p style={description}>Loading license key details...</p>
							</>
						) : null}
						{licenseKeyDetails ? (
							<LicenseKeyDetailsDisplay details={licenseKeyDetails} />
						) : null}
					</>
				) : null}
				{error ? (
					<>
						<Spacing y={1.5} />
						<ValidationMessage
							message={error}
							align="flex-start"
							type="error"
						/>
					</>
				) : null}
			</div>
			<SettingsModalFooter>
				<ModalButton
					onClick={submit}
					disabled={
						isSubmitting ||
						publicLicenseKey.length === 0 ||
						(licenseType === 'company' && !companyLicenseKeyIsValid)
					}
					autoFocus={licenseType !== 'company'}
				>
					{isSubmitting ? 'Submitting...' : 'Submit and reload'}
				</ModalButton>
			</SettingsModalFooter>
		</div>
	);
};
