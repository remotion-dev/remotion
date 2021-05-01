import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';

export const Container = styled.div`
	background: linear-gradient(to right, #4290f5, #42e9f5);
	padding: 8px;
	font-family: ---apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
		Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	color: white;
	text-align: center;
	font-weight: bold;
	font-size: 14px;
	a {
		color: white;
		text-decoration: underline;
		cursor: pointer;
	}
	code {
		background-color: rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		padding: 3px 8px;
		&:active {
			color: black;
		}
	}
`;

type PackageManager = 'npm' | 'yarn' | 'unknown';

type Info = {
	currentVersion: string;
	latestVersion: string;
	updateAvailable: boolean;
	timedOut: boolean;
	packageManager: PackageManager;
};

const makeLocalStorageKey = (version: string) => `update-dismiss-${version}`;

const dismissVersion = (version: string) => {
	window.localStorage.setItem(makeLocalStorageKey(version), 'true');
};

const isVersionDismissed = (version: string) => {
	return window.localStorage.getItem(makeLocalStorageKey(version)) === 'true';
};

export const UpdateCheck = () => {
	const [info, setInfo] = useState<Info | null>(null);

	const checkForUpdates = useCallback(() => {
		fetch('/update')
			.then((res) => res.json())
			.then((d) => setInfo(d))
			.catch((err) => {
				console.log('Could not check for updates', err);
			});
	}, []);

	const dismiss = useCallback(() => {
		if (info === null) {
			return;
		}

		dismissVersion(info.latestVersion);
		setInfo(null);
	}, [info]);

	const remindLater = useCallback(() => {
		setInfo(null);
	}, []);

	useEffect(() => {
		checkForUpdates();
	}, [checkForUpdates]);

	const copyCmd = (cmd: string) => {
		const permissionName = 'clipboard-write' as PermissionName;
		navigator.permissions
			.query({name: permissionName})
			.then((result) => {
				if (result.state === 'granted' || result.state === 'prompt') {
					navigator.clipboard.writeText(cmd);
				}
			})
			.catch((err) => {
				console.log('Could not copy command', err);
			});
	};

	if (!info) {
		return null;
	}

	if (!info.updateAvailable) {
		return null;
	}

	if (isVersionDismissed(info.latestVersion)) {
		return null;
	}

	return (
		<Container>
			A new version of Remotion is available! {info.currentVersion} ➡️{' '}
			<span style={{width: 8, display: 'inline-block'}} />
			{info.latestVersion}. Run{' '}
			{info.packageManager === 'yarn' ? (
				<code
					onClick={() => copyCmd('yarn upgrade')}
					style={{cursor: 'pointer'}}
				>
					yarn upgrade
				</code>
			) : (
				<code
					onClick={() => copyCmd('npm run upgrade')}
					style={{cursor: 'pointer'}}
				>
					npm run upgrade
				</code>
			)}{' '}
			to get it. <br />
			<a
				href="https://github.com/JonnyBurger/remotion/releases"
				target="_blank"
			>
				Release notes
			</a>
			<span style={{width: 8, display: 'inline-block'}} />
			<a onClick={remindLater}>Remind me next time</a>
			<span style={{width: 8, display: 'inline-block'}} />
			<a onClick={dismiss}>Skip this version</a>
		</Container>
	);
};
