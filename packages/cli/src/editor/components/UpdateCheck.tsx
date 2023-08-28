import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type {PackageManager} from '../../preview-server/get-package-manager';
import {BLUE, FAIL_COLOR} from '../helpers/colors';
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

export type Bug = {
	title: string;
	description: string;
	link: string;
	versions: string[];
};

export const UpdateCheck = () => {
	const [info, setInfo] = useState<UpdateInfo | null>(null);
	const {setSelectedModal} = useContext(ModalsContext);
	const {tabIndex} = useZIndex();
	const [knownBugs, setKnownBugs] = useState<Bug[] | null>(null);

	const hasKnownBugs = useMemo(() => {
		return knownBugs && knownBugs.length > 0;
	}, [knownBugs]);
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

	useEffect(() => {
		if (!info) {
			return;
		}

		fetch(
			`https://latest-stable-release.vercel.app/api/version?query=${info.currentVersion}`,
		).then(async (res) => {
			const {body} = await res.json();
			setKnownBugs(body);
		});
	}, [info]);

	const openModal = useCallback(() => {
		setSelectedModal({
			type: 'update',
			info: info as UpdateInfo,
			knownBugs: knownBugs as Bug[],
		});
	}, [info, knownBugs, setSelectedModal]);

	const dynButtonStyle: React.CSSProperties = useMemo(() => {
		return {
			...buttonStyle,
			color: hasKnownBugs ? FAIL_COLOR : BLUE,
		};
	}, [hasKnownBugs]);

	// if (!info) {
	// 	return null;
	// }

	// if (!info.updateAvailable) {
	// 	return null;
	// }

	return (
		<button
			tabIndex={tabIndex}
			style={dynButtonStyle}
			onClick={openModal}
			type="button"
		>
			{hasKnownBugs ? 'This version has known bugs!' : 'Update available!'}
		</button>
	);
};
