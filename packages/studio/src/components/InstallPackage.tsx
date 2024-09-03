import type {PackageManager} from '@remotion/studio-shared';
import {
	listOfInstallableRemotionPackages,
	type InstallablePackage,
} from '@remotion/studio-shared';
import React, {useCallback, useContext, useEffect} from 'react';
import {VERSION} from 'remotion';
import {installPackages} from '../api/install-package';
import {restartStudio} from '../api/restart-studio';
import {ShortcutHint} from '../error-overlay/remotion-overlay/ShortcutHint';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT} from '../helpers/colors';
import {useKeybinding} from '../helpers/use-keybinding';
import {Checkbox} from './Checkbox';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {ModalButton} from './ModalButton';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';
import {Flex, Row, Spacing} from './layout';

const container: React.CSSProperties = {
	padding: 20,
	maxHeight: 400,
	overflowY: 'auto',
};

const text: React.CSSProperties = {
	fontSize: 14,
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

export const InstallPackageModal: React.FC<{
	readonly packageManager: PackageManager;
}> = ({packageManager}) => {
	const [state, setState] = React.useState<State>({type: 'idle'});
	const [map, setMap] = React.useState<{[key in InstallablePackage]: boolean}>({
		'@remotion/animated-emoji': false,
		'@remotion/gif': false,
		'@remotion/lottie': false,
		'@remotion/media-utils': false,
		'@remotion/animation-utils': false,
		'@remotion/cloudrun': false,
		'@remotion/google-fonts': false,
		'@remotion/enable-scss': false,
		'@remotion/lambda': false,
		'@remotion/layout-utils': false,
		'@remotion/media-parser': false,
		'@remotion/motion-blur': false,
		'@remotion/noise': false,
		'@remotion/paths': false,
		'@remotion/rive': false,
		'@remotion/shapes': false,
		'@remotion/skia': false,
		'@remotion/studio': false,
		'@remotion/tailwind': false,
		'@remotion/three': false,
		'@remotion/transitions': false,
		'@remotion/zod-types': false,
	});
	const {previewServerState: ctx} = useContext(StudioServerConnectionCtx);

	const selectedPackages = (Object.keys(map) as InstallablePackage[]).filter(
		(pkg) => map[pkg],
	);

	const onClick = useCallback(async () => {
		if (state.type === 'done') {
			setState({type: 'restarting'});
			restartStudio();
			return;
		}

		setState({type: 'installing'});
		try {
			await installPackages(selectedPackages);
			setState({type: 'done'});
		} catch (err) {
			setState({type: 'error', error: err as Error});
		}
	}, [selectedPackages, state.type]);

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

	return (
		<DismissableModal>
			<ModalHeader title="Install packages" />
			<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
				{state.type === 'done' ? (
					<div style={text}>
						Installed package{selectedPackages.length === 1 ? '' : 's'}{' '}
						successfully. Restart the server to complete.
					</div>
				) : state.type === 'restarting' ? (
					<div style={text}>Restarting the Studio server...</div>
				) : state.type === 'installing' ? (
					<div style={text}>
						Installing package{selectedPackages.length === 1 ? '' : 's'}. Check
						your terminal for progress.
					</div>
				) : (
					<div style={text}>
						{listOfInstallableRemotionPackages.map((pkg) => {
							const isInstalled =
								window.remotion_installedPackages?.includes(pkg) ?? false;
							return (
								<Row key={pkg} align="center">
									<Checkbox
										checked={map[pkg]}
										name={pkg}
										onChange={() => {
											setMap((prev) => ({...prev, [pkg]: !prev[pkg]}));
										}}
										disabled={!canSelectPackages || isInstalled}
									/>
									<Spacing x={1.5} />
									<div
										style={{
											color: LIGHT_TEXT,
											fontSize: 15,
											lineHeight: 1.8,
										}}
									>
										{pkg}{' '}
										{isInstalled ? (
											<span style={{opacity: 0.3, fontSize: 'inherit'}}>
												(installed)
											</span>
										) : null}
									</div>
								</Row>
							);
						})}
					</div>
				)}
			</div>
			<ModalFooterContainer>
				<Row align="center">
					{state.type === 'idle' ? (
						<span style={{color: LIGHT_TEXT, fontSize: 13, lineHeight: 1.2}}>
							This will install {selectedPackages.length} package
							{selectedPackages.length === 1 ? '' : 's'} (v{VERSION}) using{' '}
							{packageManager}
						</span>
					) : null}
					<Flex />
					<ModalButton onClick={onClick} disabled={disabled}>
						{state.type === 'restarting'
							? 'Restarting...'
							: state.type === 'installing'
								? 'Installing...'
								: state.type === 'done'
									? 'Restart Server'
									: 'Install'}
						{disabled ? null : <ShortcutHint keyToPress="↵" cmdOrCtrl />}
					</ModalButton>
				</Row>
			</ModalFooterContainer>
		</DismissableModal>
	);
};
