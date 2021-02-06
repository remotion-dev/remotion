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
`;

type Info = {
	currentVersion: string;
	latestVersion: string;
	updateAvailable: boolean;
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
			{info.latestVersion}. Run <code>npm run upgrade</code> to get it. <br />
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
