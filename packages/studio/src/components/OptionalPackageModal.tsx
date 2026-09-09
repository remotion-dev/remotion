import React, {useCallback, useContext, useEffect, useState} from 'react';
import {installPackages} from '../api/install-package';
import {LIGHT_TEXT, WARNING_COLOR, WHITE} from '../helpers/colors';
import {withRequiredAuxiliaryPackages} from '../helpers/optional-package-dependencies';
import {SetSelectedModalContext} from '../state/modals';
import {Button} from './Button';
import {Flex, Row, Spacing} from './layout';
import {ModalButton} from './ModalButton';
import {ModalContainer} from './ModalContainer';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {Spinner} from './Spinner';

type InstallState =
	| {type: 'idle'}
	| {type: 'installing'}
	| {type: 'error'; error: Error};

const panelStyle: React.CSSProperties = {
	width: 'min(520px, calc(100vw - 40px))',
};

const contentStyle: React.CSSProperties = {
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
	padding: 16,
};

const codeStyle: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'monospace',
	fontSize: 'inherit',
};

const statusStyle: React.CSSProperties = {
	alignItems: 'center',
	color: LIGHT_TEXT,
	display: 'flex',
	fontFamily: 'sans-serif',
	fontSize: 14,
	gap: 10,
	lineHeight: 1.5,
};

const errorStyle: React.CSSProperties = {
	color: WARNING_COLOR,
	marginTop: 12,
	whiteSpace: 'pre-wrap',
};

const cancelStyle: React.CSSProperties = {minWidth: 90};

export const isOptionalPackageInstalled = (packageName: string) =>
	window.remotion_installedPackages?.includes(packageName) ?? false;

const OPTIONAL_PACKAGE_INSTALLED_EVENT = 'remotion-optional-package-installed';

export const markOptionalPackageInstalled = (packageName: string) => {
	window.remotion_installedPackages = Array.from(
		new Set([...(window.remotion_installedPackages ?? []), packageName]),
	);
	window.dispatchEvent(
		new CustomEvent(OPTIONAL_PACKAGE_INSTALLED_EVENT, {
			detail: packageName,
		}),
	);
};

export const installOptionalPackage = async (packageName: string) => {
	const dependencies = withRequiredAuxiliaryPackages([
		{name: packageName, version: null},
	]);
	await installPackages(dependencies);
	for (const dependency of dependencies) {
		markOptionalPackageInstalled(dependency.name);
	}
};

export const useOptionalPackageInstalled = (packageName: string) => {
	const [installed, setInstalled] = useState(() =>
		isOptionalPackageInstalled(packageName),
	);

	useEffect(() => {
		const onInstalled = (event: Event) => {
			if ((event as CustomEvent<string>).detail === packageName) {
				setInstalled(true);
			}
		};

		window.addEventListener(OPTIONAL_PACKAGE_INSTALLED_EVENT, onInstalled);
		return () =>
			window.removeEventListener(OPTIONAL_PACKAGE_INSTALLED_EVENT, onInstalled);
	}, [packageName]);

	return installed;
};

export const OptionalPackageModal: React.FC<{
	readonly ariaLabel: string;
	readonly children: React.ReactNode;
	readonly packageName: string;
	readonly title: string;
}> = ({ariaLabel, children, packageName, title}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const installed = useOptionalPackageInstalled(packageName);
	const [installState, setInstallState] = useState<InstallState>({
		type: 'idle',
	});
	const busy = installState.type === 'installing';
	const packageNames = withRequiredAuxiliaryPackages([
		{name: packageName, version: null},
	]).map((dependency) => dependency.name);
	const packagesLabel = packageNames.join(' and ');

	const dismiss = useCallback(() => {
		if (!busy) {
			setSelectedModal(null);
		}
	}, [busy, setSelectedModal]);

	const install = useCallback(async () => {
		setInstallState({type: 'installing'});
		try {
			await installOptionalPackage(packageName);
		} catch (error) {
			setInstallState({type: 'error', error: error as Error});
		}
	}, [packageName]);

	if (installed) {
		return children;
	}

	return (
		<ModalContainer
			ariaLabel={ariaLabel}
			onEscape={dismiss}
			onOutsideClick={dismiss}
			panelStyle={panelStyle}
		>
			<ModalHeader title={title} onClose={dismiss} />
			<div style={contentStyle}>
				{busy ? (
					<div style={statusStyle}>
						<Spinner duration={0.5} size={18} />
						{`Installing ${packagesLabel}…`}
					</div>
				) : (
					<>
						This requires installing{' '}
						{packageNames.map((name, index) => (
							<React.Fragment key={name}>
								{index > 0 ? ' and ' : null}
								<code style={codeStyle}>{name}</code>
							</React.Fragment>
						))}
						. Continue?
						{installState.type === 'error' ? (
							<div style={errorStyle}>{installState.error.message}</div>
						) : null}
					</>
				)}
			</div>
			<ModalFooterContainer>
				<Row align="center">
					<Flex />
					<Button disabled={busy} onClick={dismiss} style={cancelStyle}>
						Cancel
					</Button>
					<Spacing x={1} />
					<ModalButton disabled={busy} onClick={install} autoFocus>
						{installState.type === 'error' ? 'Retry' : 'Continue'}
					</ModalButton>
				</Row>
			</ModalFooterContainer>
		</ModalContainer>
	);
};
