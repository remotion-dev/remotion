import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {restartStudio} from '../api/restart-studio';
import {setPublicLicenseKey} from '../api/set-public-license-key';
import {ShortcutHint} from '../error-overlay/remotion-overlay/ShortcutHint';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT} from '../helpers/colors';
import {useKeybinding} from '../helpers/use-keybinding';
import {Flex, Row} from './layout';
import {ModalButton} from './ModalButton';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';
import {WebRenderModalLicense} from './RenderModal/WebRenderModalLicense';

const container: React.CSSProperties = {
	maxHeight: 480,
	overflowY: 'auto',
	paddingBottom: 8,
};

const text: React.CSSProperties = {
	fontSize: 14,
	padding: 20,
	color: LIGHT_TEXT,
};

const LICENSE_KEY_LENGTH = 55;
const LICENSE_KEY_PREFIX = 'rm_pub_';

const isValidCompanyLicenseKey = (key: string): boolean => {
	if (!key.startsWith(LICENSE_KEY_PREFIX)) {
		return false;
	}

	const afterPrefix = key.slice(LICENSE_KEY_PREFIX.length);
	if (!/^[a-zA-Z0-9]*$/.test(afterPrefix)) {
		return false;
	}

	return key.length === LICENSE_KEY_LENGTH;
};

type State =
	| {
			type: 'idle';
	  }
	| {
			type: 'applying';
	  }
	| {
			type: 'restarting';
	  }
	| {
			type: 'error';
			error: Error;
	  };

export const ConfigureLicenseModal: React.FC = () => {
	const initialPublicLicenseKey =
		window.remotion_renderDefaults?.publicLicenseKey ?? null;
	const [licenseKey, setLicenseKey] = React.useState<string | null>(
		initialPublicLicenseKey,
	);
	const [state, setState] = React.useState<State>({type: 'idle'});
	const {previewServerState: ctx} = useContext(StudioServerConnectionCtx);

	const canApply = useMemo(() => {
		if (licenseKey === 'free-license') {
			return true;
		}

		if (licenseKey === null) {
			return false;
		}

		return isValidCompanyLicenseKey(licenseKey);
	}, [licenseKey]);

	const disabled =
		!canApply ||
		state.type === 'applying' ||
		state.type === 'restarting' ||
		ctx.type !== 'connected';

	const onApply = useCallback(async () => {
		if (disabled || licenseKey === null) {
			return;
		}

		setState({type: 'applying'});
		try {
			await setPublicLicenseKey(licenseKey);
			setState({type: 'restarting'});
			restartStudio();
		} catch (err) {
			setState({type: 'error', error: err as Error});
		}
	}, [disabled, licenseKey]);

	const {registerKeybinding} = useKeybinding();
	useEffect(() => {
		if (disabled) {
			return;
		}

		const enter = registerKeybinding({
			callback() {
				onApply();
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
	}, [disabled, onApply, registerKeybinding]);

	return (
		<DismissableModal>
			<ModalHeader title="Configure License" />
			{state.type === 'restarting' ? (
				<div style={text}>Restarting the Studio server...</div>
			) : state.type === 'applying' ? (
				<div style={text}>Saving license key to remotion.config.ts...</div>
			) : state.type === 'error' ? (
				<div style={text}>
					Could not save license key: {state.error.message}
				</div>
			) : (
				<div style={container}>
					<WebRenderModalLicense
						licenseKey={licenseKey}
						setLicenseKey={setLicenseKey}
						initialPublicLicenseKey={initialPublicLicenseKey}
					/>
				</div>
			)}
			<ModalFooterContainer>
				<Row align="center">
					{state.type === 'idle' ? (
						<span style={{color: LIGHT_TEXT, fontSize: 13, lineHeight: 1.2}}>
							Writes Config.setPublicLicenseKey() into remotion.config.ts
							<br />
							and restarts the Studio
						</span>
					) : null}
					<Flex />
					<ModalButton onClick={onApply} disabled={disabled}>
						{state.type === 'restarting'
							? 'Restarting...'
							: state.type === 'applying'
								? 'Applying...'
								: 'Apply'}
						{disabled ? null : <ShortcutHint keyToPress="↵" cmdOrCtrl />}
					</ModalButton>
				</Row>
			</ModalFooterContainer>
		</DismissableModal>
	);
};
