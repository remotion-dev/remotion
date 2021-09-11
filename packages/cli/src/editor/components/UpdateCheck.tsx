import React, {useCallback, useContext, useEffect, useState} from 'react';
import {ModalsContext} from '../state/modals';

type PackageManager = 'npm' | 'yarn' | 'unknown';

export type UpdateInfo = {
	currentVersion: string;
	latestVersion: string;
	updateAvailable: boolean;
	timedOut: boolean;
	packageManager: PackageManager;
};

const buttonStyle: React.CSSProperties = {
	appearance: 'none',
	color: '#4290f5',
	border: 'none',
	fontWeight: 'bold',
	backgroundColor: 'transparent',
	cursor: 'pointer',
};

export const UpdateCheck = () => {
	const [info, setInfo] = useState<UpdateInfo | null>(null);
	const {setSelectedModal} = useContext(ModalsContext);

	const checkForUpdates = useCallback(() => {
		fetch('/update')
			.then((res) => res.json())
			.then((d) => setInfo(d))
			.catch((err) => {
				console.log('Could not check for updates', err);
			});
	}, []);

	useEffect(() => {
		checkForUpdates();
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
		<button style={buttonStyle} onClick={openModal} type="button">
			Update available!
		</button>
	);
};
