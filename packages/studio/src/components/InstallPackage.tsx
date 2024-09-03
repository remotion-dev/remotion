import type {InstallablePackage} from '@remotion/studio-shared';
import React, {useCallback, useContext, useEffect} from 'react';
import {VERSION} from 'remotion';
import {installPackage} from '../api/install-package';
import {restartStudio} from '../api/restart-studio';
import {ShortcutHint} from '../error-overlay/remotion-overlay/ShortcutHint';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {useKeybinding} from '../helpers/use-keybinding';
import {ModalButton} from './ModalButton';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';
import {Flex, Row} from './layout';

const container: React.CSSProperties = {
	padding: 20,
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
	readonly packageName: InstallablePackage;
}> = ({packageName}) => {
	const [state, setState] = React.useState<State>({type: 'idle'});
	const {previewServerState: ctx} = useContext(StudioServerConnectionCtx);

	const onClick = useCallback(async () => {
		if (state.type === 'done') {
			setState({type: 'restarting'});
			restartStudio();
			return;
		}

		setState({type: 'installing'});
		try {
			await installPackage(packageName);
			setState({type: 'done'});
		} catch (err) {
			setState({type: 'error', error: err as Error});
		}
	}, [packageName, state.type]);

	const disabled =
		(state.type !== 'idle' && state.type !== 'done') ||
		ctx.type !== 'connected';

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
			<ModalHeader title="Install package" />
			<div style={container}>
				{state.type === 'done' ? (
					<div style={text}>
						The package was installed. It is recommended to restart the server.
					</div>
				) : state.type === 'restarting' ? (
					<div style={text}>Restarting the Studio server...</div>
				) : state.type === 'installing' ? (
					<div style={text}>
						The package is installing. Check your terminal for progress.
					</div>
				) : (
					<div style={text}>
						This will install the package {packageName}@{VERSION} from npm.
					</div>
				)}
			</div>
			<ModalFooterContainer>
				<Row align="center">
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
