import React, {useCallback, useContext, useEffect, useState} from 'react';
import type {PackageManager} from '../../preview-server/get-package-manager';
import {BLUE} from '../helpers/colors';
import {ModalsContext} from '../state/modals';
import {useZIndex} from '../state/z-index';
import {updateAvailable} from './RenderQueue/actions';

export type UpdateInfo = {
	currentVersion: string;
	latestVersion: string;
	updateAvailable: boolean;
	timedOut: boolean;
	packageManager: PackageManager | 'unknown';
};

const buttonStyle: React.CSSProperties = {
	appearance: 'none',
	color: BLUE,
	border: 'none',
	fontWeight: 'bold',
	backgroundColor: 'transparent',
	cursor: 'pointer',
	fontSize: 14,
};

export const UpdateCheck = () => {
	const [info, setInfo] = useState<UpdateInfo | null>(null);
	const {setSelectedModal} = useContext(ModalsContext);
	const {tabIndex} = useZIndex();

	const checkForUpdates = useCallback(() => {
		const controller = new AbortController();

		updateAvailable(controller.signal)
			.then((d) => {
				setInfo(d);
			})
			.catch((err: Error) => {
				if (err.message.includes('aborted')) {
					return;
				}

				console.log('Could not check for updates', err);
			});

		return controller;
	}, []);

	useEffect(() => {
		const abortController = checkForUpdates();
		return () => {
			abortController.abort();
		};
	}, [checkForUpdates]);

	const openModal = useCallback(() => {
		setSelectedModal({
			type: 'update',
			info: info as UpdateInfo,
		});
	}, [info, setSelectedModal]);

	if (!info) {
		return null;
	}

	if (!info.updateAvailable) {
		return null;
	}

	return (
		<button
			tabIndex={tabIndex}
			style={buttonStyle}
			onClick={openModal}
			type="button"
		>
			Update available!
		</button>
	);
};
