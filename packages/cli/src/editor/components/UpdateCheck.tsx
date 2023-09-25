import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {VERSION} from 'remotion';
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

// Keep in sync with packages/bugs/api/[v].ts
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

	const checkForBugs = useCallback(() => {
		const controller = new AbortController();

		fetch(`https://bugs.remotion.dev/api/${VERSION}`, {
			signal: controller.signal,
		})
			.then(async (res) => {
				const {body} = await res.json();
				setKnownBugs(body.bugs);
			})
			.catch((err: Error) => {
				if (err.message.includes('aborted')) {
					return;
				}

				console.log('Could not check for bugs in this version', err);
			});

		return controller;
	}, []);

	useEffect(() => {
		const abortUpdate = checkForUpdates();
		const abortBugs = checkForBugs();
		return () => {
			abortUpdate.abort();
			abortBugs.abort();
		};
	}, [checkForBugs, checkForUpdates]);

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

	if (!info) {
		return null;
	}

	if (!info.updateAvailable) {
		return null;
	}

	return (
		<button
			tabIndex={tabIndex}
			style={dynButtonStyle}
			onClick={openModal}
			type="button"
		>
			{hasKnownBugs ? 'Bugfixes available!' : 'Update available!'}
		</button>
	);
};
