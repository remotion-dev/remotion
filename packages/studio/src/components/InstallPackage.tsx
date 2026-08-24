import type {ExtraPackage, PackageManager, Pkgs} from '@remotion/studio-shared';
import {
	apiDocs,
	descriptions,
	extraPackages,
	installableMap,
} from '@remotion/studio-shared';
import React, {useCallback, useContext, useEffect} from 'react';
import ReactDOM from 'react-dom';
import {VERSION} from 'remotion';
import {installPackages} from '../api/install-package';
import {restartStudio} from '../api/restart-studio';
import {ShortcutHint} from '../error-overlay/remotion-overlay/ShortcutHint';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BORDER_WHITE_ALPHA_12, LIGHT_TEXT} from '../helpers/colors';
import {useKeybinding} from '../helpers/use-keybinding';
import {SetSelectedModalContext} from '../state/modals';
import {Checkbox} from './Checkbox';
import {InstallablePackageComp} from './InstallablePackage';
import {Flex, Row} from './layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {ModalButton} from './ModalButton';
import {ModalFooterContainer} from './ModalFooter';

const container: React.CSSProperties = {
	boxSizing: 'border-box',
	flex: 1,
	fontFamily: 'sans-serif',
	minHeight: 0,
	overflowY: 'auto',
	padding: '16px 16px 0',
};

const settingsContainer: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minHeight: 0,
	minWidth: 0,
};

const text: React.CSSProperties = {
	fontSize: 14,
};

const footer: React.CSSProperties = {
	flex: 'none',
};

const packageRow: React.CSSProperties = {
	alignItems: 'center',
	borderBottom: BORDER_WHITE_ALPHA_12,
	display: 'flex',
	gap: 10,
	minHeight: 52,
	padding: '4px 0',
};

const lastPackageRow: React.CSSProperties = {
	...packageRow,
	borderBottom: 'none',
};

type State =
	| {
			type: 'idle';
	  }
	| {
			type: 'installing';
	  }
	| {
			type: 'done';
	  }
	| {
			type: 'error';
			error: Error;
	  }
	| {
			type: 'restarting';
	  };

export const InstallPackageSettings: React.FC<{
	readonly footerContainer: HTMLElement | null;
	readonly packageManager: PackageManager | null;
}> = ({footerContainer, packageManager}) => {
	const [state, setState] = React.useState<State>({type: 'idle'});

	const [map, setMap] = React.useState<Record<string, boolean>>({});
	const {previewServerState: ctx} = useContext(StudioServerConnectionCtx);
	const {setSelectedModal} = useContext(SetSelectedModalContext);

	const selectedPackages = Object.keys(map).filter((pkg) => map[pkg]);
	const selectedPackageSpecs = selectedPackages.map((name) => ({
		name,
		version: extraPackages.find((pkg) => pkg.name === name)?.version ?? null,
	}));

	const onClick = useCallback(async () => {
		if (state.type === 'done') {
			if (packageManager === null) {
				setSelectedModal(null);
				return;
			}

			setState({type: 'restarting'});
			restartStudio();
			return;
		}

		setState({type: 'installing'});
		try {
			await installPackages(selectedPackageSpecs);
			window.remotion_installedPackages = Array.from(
				new Set([
					...(window.remotion_installedPackages ?? []),
					...selectedPackages,
				]),
			);
			setState({type: 'done'});
		} catch (err) {
			setState({type: 'error', error: err as Error});
		}
	}, [
		packageManager,
		selectedPackageSpecs,
		selectedPackages,
		setSelectedModal,
		state.type,
	]);

	const canSelectPackages = state.type === 'idle' && ctx.type === 'connected';

	const disabled =
		!(canSelectPackages || state.type === 'done') ||
		selectedPackages.length === 0;

	const {registerKeybinding} = useKeybinding();
	useEffect(() => {
		if (disabled) {
			return;
		}

		const enter = registerKeybinding({
			callback() {
				onClick();
			},
			commandCtrlKey: true,
			key: 'Enter',
			event: 'keydown',
			preventDefault: true,
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: true,
		});

		return () => {
			enter.unregister();
		};
	}, [disabled, onClick, registerKeybinding]);
	const installablePackages = Object.entries(installableMap).filter(
		([, install]) => install,
	);
	const packageCount = installablePackages.length + extraPackages.length;

	return (
		<div style={settingsContainer}>
			<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
				{state.type === 'done' ? (
					<div style={text}>
						Installed package{selectedPackages.length === 1 ? '' : 's'}{' '}
						successfully.
						{packageManager === null
							? null
							: ' Restart the server to complete.'}
					</div>
				) : state.type === 'restarting' ? (
					<div style={text}>Restarting the Studio server...</div>
				) : state.type === 'installing' ? (
					<div style={text}>
						Installing package{selectedPackages.length === 1 ? '' : 's'}
						{packageManager === null
							? '.'
							: '. Check your terminal for progress.'}
					</div>
				) : (
					<div style={text} role="list" aria-label="Remotion packages">
						{installablePackages.map(([pkgShort], index) => {
							const pkg =
								pkgShort === 'core' ? 'remotion' : `@remotion/${pkgShort}`;
							const isInstalled =
								window.remotion_installedPackages?.includes(pkg) ?? false;
							const link = apiDocs[pkgShort as Pkgs];
							const description = descriptions[pkgShort as Pkgs];
							if (!link) {
								throw new Error('No link for ' + pkg);
							}

							if (!description) {
								throw new Error('No description for ' + pkg);
							}

							return (
								<Row
									key={pkg}
									align="center"
									role="listitem"
									style={
										index === packageCount - 1 ? lastPackageRow : packageRow
									}
								>
									<Checkbox
										checked={map[pkg]}
										name={pkg}
										onChange={() => {
											setMap((prev) => ({...prev, [pkg]: !prev[pkg]}));
										}}
										disabled={!canSelectPackages || isInstalled}
									/>
									<InstallablePackageComp
										description={description}
										isInstalled={isInstalled}
										link={link}
										pkg={pkg}
									/>
								</Row>
							);
						})}
						{extraPackages.map((extraPkg: ExtraPackage, index) => {
							const isInstalled =
								window.remotion_installedPackages?.includes(extraPkg.name) ??
								false;

							return (
								<Row
									key={extraPkg.name}
									align="center"
									role="listitem"
									style={
										installablePackages.length + index === packageCount - 1
											? lastPackageRow
											: packageRow
									}
								>
									<Checkbox
										checked={map[extraPkg.name]}
										name={extraPkg.name}
										onChange={() => {
											setMap((prev) => ({
												...prev,
												[extraPkg.name]: !prev[extraPkg.name],
											}));
										}}
										disabled={!canSelectPackages || isInstalled}
									/>
									<InstallablePackageComp
										description={extraPkg.description}
										isInstalled={isInstalled}
										link={extraPkg.docsUrl}
										pkg={`${extraPkg.name}@${extraPkg.version}`}
									/>
								</Row>
							);
						})}
					</div>
				)}
			</div>
			{footerContainer
				? ReactDOM.createPortal(
						<ModalFooterContainer style={footer}>
							<Row align="center">
								{state.type === 'idle' ? (
									<span
										style={{color: LIGHT_TEXT, fontSize: 13, lineHeight: 1.2}}
									>
										This will install {selectedPackages.length} package
										{selectedPackages.length === 1 ? '' : 's'}
										<br />
										{packageManager === null
											? `in this project, Remotion v${VERSION}`
											: `using ${packageManager}, Remotion v${VERSION}`}
									</span>
								) : null}
								<Flex />
								<ModalButton onClick={onClick} disabled={disabled}>
									{state.type === 'restarting'
										? 'Restarting...'
										: state.type === 'installing'
											? 'Installing...'
											: state.type === 'done'
												? packageManager === null
													? 'Done'
													: 'Restart Server'
												: 'Install'}
									{disabled ? null : <ShortcutHint keyToPress="↵" cmdOrCtrl />}
								</ModalButton>
							</Row>
						</ModalFooterContainer>,
						footerContainer,
					)
				: null}
		</div>
	);
};
