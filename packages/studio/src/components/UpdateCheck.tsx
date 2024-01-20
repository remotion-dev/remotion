import type {PackageManager} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {VERSION} from 'remotion';
import {BLUE, LIGHT_TEXT, WARNING_COLOR} from '../helpers/colors';
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
	display: 'inline-flex',
	justifyContent: 'center',
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

				// eslint-disable-next-line no-console
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
				const body = await res.json();
				setKnownBugs(body.bugs);
			})
			.catch((err: Error) => {
				if (err.message.includes('aborted')) {
					return;
				}

				// eslint-disable-next-line no-console
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
			color: hasKnownBugs ? WARNING_COLOR : LIGHT_TEXT,
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
			title={hasKnownBugs ? 'Bugfixes available' : 'Update available'}
		>
			{hasKnownBugs ? (
				'Bugfixes available'
			) : (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					style={{
						height: 16,
						width: 16,
					}}
					viewBox="0 0 512 512"
				>
					<path
						fill="currentcolor"
						d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM135.1 217.4c-4.5 4.2-7.1 10.1-7.1 16.3c0 12.3 10 22.3 22.3 22.3H208v96c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V256h57.7c12.3 0 22.3-10 22.3-22.3c0-6.2-2.6-12.1-7.1-16.3L269.8 117.5c-3.8-3.5-8.7-5.5-13.8-5.5s-10.1 2-13.8 5.5L135.1 217.4z"
					/>
				</svg>
			)}
		</button>
	);
};
