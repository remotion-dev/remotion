import React, {useLayoutEffect, useState} from 'react';
import {Internals} from 'remotion';
import {MENU_TOOLBAR_HEIGHT} from '../../components/menu-toolbar-height';
import {SettingsProvider} from '../../components/SettingsContext';
import {PreviewServerConnection} from '../../helpers/client-id';
import {BACKGROUND_HEX, WHITE} from '../../helpers/colors';
import {KeybindingContextProvider} from '../../state/keybindings';
import {
	getRuntimeErrors,
	subscribeToRuntimeErrors,
} from '../runtime-error-store';
import {ErrorLoader} from './ErrorLoader';

const BACKGROUND_COLOR = BACKGROUND_HEX;
export const Overlay: React.FC = () => {
	const [errors, setErrors] = useState(getRuntimeErrors);

	useLayoutEffect(() => {
		return subscribeToRuntimeErrors(() => setErrors(getRuntimeErrors()));
	}, []);

	useLayoutEffect(() => {
		if (errors.length > 0) {
			window.remotion_studioStartup?.dismiss();
		}
	}, [errors]);

	if (errors.length === 0) {
		return null;
	}

	return (
		<PreviewServerConnection>
			<SettingsProvider>
				<KeybindingContextProvider>
					<Internals.AbsoluteFillElement
						style={{
							backgroundColor: BACKGROUND_COLOR,
							overflow: 'auto',
							color: WHITE,
							top: MENU_TOOLBAR_HEIGHT,
							height: `calc(100% - ${MENU_TOOLBAR_HEIGHT}px)`,
						}}
					>
						{errors.map(({error: err}, i) => {
							return (
								<ErrorLoader
									// eslint-disable-next-line react/no-array-index-key
									key={(err.stack ?? '') + i}
									keyboardShortcuts={i === 0}
									error={err}
									onRetry={null}
									canHaveDismissButton
									calculateMetadata={false}
								/>
							);
						})}
					</Internals.AbsoluteFillElement>
				</KeybindingContextProvider>
			</SettingsProvider>
		</PreviewServerConnection>
	);
};
