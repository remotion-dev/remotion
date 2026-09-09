import React, {useCallback, useContext} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {WARNING_COLOR, WHITE_ALPHA_80} from '../helpers/colors';
import {GearIcon} from '../icons/gear';
import {SetSelectedModalContext} from '../state/modals';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {useUpdateStatus} from './UpdateStatusContext';

export const SettingsButton: React.FC<{
	readonly showUpdates: boolean;
}> = ({showUpdates}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {info, knownBugs} = useUpdateStatus();
	const updateAvailable =
		showUpdates &&
		Boolean(info?.updateAvailable || info?.skillsUpdateAvailable);
	const hasBugfixesAvailable =
		showUpdates &&
		Boolean(info?.updateAvailable && knownBugs && knownBugs.length > 0);

	const openModal = useCallback(() => {
		setSelectedModal({
			type: 'settings',
			initialTab: updateAvailable
				? 'updates'
				: getBrowserStudioOperations() === null
					? 'rendering'
					: 'shortcuts',
			initialPublicLicenseKey:
				window.remotion_renderDefaults?.publicLicenseKey ?? null,
		});
	}, [setSelectedModal, updateAvailable]);

	const renderGearIcon: RenderInlineAction = useCallback((color) => {
		return <GearIcon color={color} width={16} height={16} />;
	}, []);

	const renderUpdateIcon: RenderInlineAction = useCallback((color) => {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				style={{
					height: 16,
					width: 16,
					color,
					flexShrink: 0,
				}}
				viewBox="0 0 512 512"
			>
				<path
					fill={color}
					d="M256 32a224 224 0 1 1 0 448 224 224 0 1 1 0-448zm0 480a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM377 231L273 127c-9.4-9.4-24.6-9.4-33.9 0L135 231c-6.9 6.9-8.9 17.2-5.2 26.2S142.3 272 152 272l40 0 0 72c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-72 40 0c9.7 0 18.5-5.8 22.2-14.8s1.7-19.3-5.2-26.2z"
				/>
			</svg>
		);
	}, []);

	return (
		<InlineAction
			variant={null}
			onClick={openModal}
			renderAction={updateAvailable ? renderUpdateIcon : renderGearIcon}
			unhoveredColor={hasBugfixesAvailable ? WARNING_COLOR : WHITE_ALPHA_80}
			title={
				hasBugfixesAvailable
					? 'Bugfixes available'
					: updateAvailable
						? 'Update available'
						: 'Settings'
			}
		/>
	);
};
