import type {ConfigUpdate} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {BLUE, LIGHT_TEXT} from '../helpers/colors';
import {Spacing} from './layout';
import {LicenseExplanation} from './LicenseExplanation';
import {
	fetchLicenseKeyDetails,
	hasActiveCompanyLicense,
	LicenseKeyDetailsDisplay,
	validateLicenseKey,
	type LicenseKeyDetails,
} from './LicenseKeyValidation';
import {RemotionInput} from './NewComposition/RemInput';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {RadioButton} from './RadioButton';
import {useSettings} from './SettingsContext';
import {useAutoSaveConfig} from './use-auto-save-config';

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

const externalDescriptionLink: React.CSSProperties = {
	color: BLUE,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: '21px',
};

const externalLinkIndicator: React.CSSProperties = {
	display: 'inline-block',
	height: 12,
	marginLeft: 4,
	verticalAlign: -2,
	width: 12,
};

const freeLicenseMessage: React.CSSProperties = {
	...description,
	marginBottom: 5,
	marginLeft: 28,
};

const companyLicenseContent: React.CSSProperties = {
	marginLeft: 28,
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

export const LicenseSettings: React.FC = () => {
	const {error: settingsError, publicLicenseKey, revision} = useSettings();
	const initialLicenseType: LicenseType =
		publicLicenseKey === 'free-license'
			? 'free'
			: publicLicenseKey === null
				? null
				: 'company';
	const [licenseType, setLicenseType] =
		useState<LicenseType>(initialLicenseType);
	const [companyLicenseKey, setCompanyLicenseKey] = useState<string>(
		initialLicenseType === 'company' ? (publicLicenseKey ?? '') : '',
	);
	const [companyLicenseKeyToSave, setCompanyLicenseKeyToSave] =
		useState(companyLicenseKey);
	const [error, setError] = useState<string | null>(null);
	const [syncedRevision, setSyncedRevision] = useState(revision);
	const [isValidatingLicenseKey, setIsValidatingLicenseKey] = useState(false);
	const [remoteValidationMessage, setRemoteValidationMessage] = useState<
		string | null
	>(null);
	const [licenseKeyDetails, setLicenseKeyDetails] =
		useState<LicenseKeyDetails | null>(null);

	useEffect(() => {
		const nextLicenseType: LicenseType =
			publicLicenseKey === 'free-license'
				? 'free'
				: publicLicenseKey === null
					? null
					: 'company';
		const nextCompanyLicenseKey =
			nextLicenseType === 'company' ? (publicLicenseKey ?? '') : '';
		setLicenseType(nextLicenseType);
		setCompanyLicenseKey(nextCompanyLicenseKey);
		setCompanyLicenseKeyToSave(nextCompanyLicenseKey);
		setSyncedRevision(revision);
		setError(null);
	}, [publicLicenseKey, revision]);

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

	const publicLicenseKeyToSave = useMemo(() => {
		if (licenseType === 'free') {
			return 'free-license';
		}

		if (licenseType === 'company') {
			return companyLicenseKeyToSave;
		}

		return '';
	}, [companyLicenseKeyToSave, licenseType]);

	const updates = useMemo((): ConfigUpdate[] => {
		if (licenseType === null) {
			return [{setter: 'setPublicLicenseKey', type: 'delete'}];
		}

		return [
			{
				setter: 'setPublicLicenseKey',
				type: 'set',
				value: publicLicenseKeyToSave,
			},
		];
	}, [licenseType, publicLicenseKeyToSave]);
	useAutoSaveConfig({
		enabled:
			licenseType === null ||
			(publicLicenseKeyToSave.length > 0 &&
				(licenseType !== 'company' ||
					(companyLicenseKeyToSave === companyLicenseKey.trim() &&
						companyLicenseKeyIsValid))),
		onError: setError,
		ready: syncedRevision === revision,
		syncRevision: syncedRevision,
		updates,
	});
	const displayedError = error ?? settingsError;

	return (
		<div style={container}>
			<div style={content}>
				<LicenseExplanation />
				<Spacing y={2} />
				<div aria-label="License type" role="radiogroup">
					<RadioButton
						checked={licenseType === 'free'}
						onClick={toggleFreeLicense}
					>
						I am eligible for the Free License
					</RadioButton>
					{licenseType === 'free' ? (
						<p style={freeLicenseMessage}>That&apos;s it! Enjoy Remotion.</p>
					) : null}
					<RadioButton
						checked={licenseType === 'company'}
						onClick={toggleCompanyLicense}
					>
						I need a Company License
					</RadioButton>
					{licenseType === 'company' ? (
						<div style={companyLicenseContent}>
							<p style={description}>
								Visit{' '}
								<a
									style={externalDescriptionLink}
									href="https://remotion.pro/license"
									target="_blank"
									rel="noopener noreferrer"
								>
									remotion.pro/license
									<svg
										aria-hidden="true"
										viewBox="0 0 16 16"
										style={externalLinkIndicator}
									>
										<path
											d="M4 12 12 4M6 4h6v6"
											fill="none"
											stroke={BLUE}
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="1.5"
										/>
									</svg>
								</a>{' '}
								to obtain a license key. Then enter it here.
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
									onBlur={() => {
										setCompanyLicenseKeyToSave(companyLicenseKey.trim());
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
						</div>
					) : null}
				</div>
				{displayedError ? (
					<>
						<Spacing y={1.5} />
						<ValidationMessage
							message={displayedError}
							align="flex-start"
							type="error"
						/>
					</>
				) : null}
			</div>
		</div>
	);
};
