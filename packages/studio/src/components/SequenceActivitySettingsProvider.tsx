import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Internals} from 'remotion';

const enabledKey = 'remotion.experimentalSequenceActivity';
const limitKey = 'remotion.experimentalSequenceActivityLimit';

export const SequenceActivitySettingsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [settings, setSettings] = useState(() => {
		const requested = new URLSearchParams(window.location.search).get(
			'experimentalSequenceActivity',
		);
		let enabled = false;
		let limit: number = Internals.DEFAULT_SEQUENCE_ACTIVITY_LIMIT;
		try {
			enabled = localStorage.getItem(enabledKey) === 'true';
			const storedLimit = localStorage.getItem(limitKey);
			if (storedLimit !== null && storedLimit.trim() !== '') {
				const parsedLimit = Number(storedLimit);
				if (Number.isSafeInteger(parsedLimit) && parsedLimit >= 0) {
					limit = parsedLimit;
				}
			}
		} catch {
			// The experiment remains usable when browser storage is unavailable.
		}

		return {
			enabled:
				requested === 'true' ? true : requested === 'false' ? false : enabled,
			limit,
		};
	});
	const setEnabled = useCallback((enabled: boolean) => {
		try {
			localStorage.setItem(enabledKey, String(enabled));
		} catch {
			// Apply the setting for this session even if it cannot be persisted.
		}

		setSettings((current) =>
			current.enabled === enabled ? current : {...current, enabled},
		);
	}, []);
	const setLimit = useCallback((limit: number) => {
		if (!Number.isSafeInteger(limit) || limit < 0) {
			return;
		}

		try {
			localStorage.setItem(limitKey, String(limit));
		} catch {
			// Apply the setting for this session even if it cannot be persisted.
		}

		setSettings((current) =>
			current.limit === limit ? current : {...current, limit},
		);
	}, []);
	useEffect(() => {
		const onStorage = (event: StorageEvent) => {
			try {
				if (event.storageArea !== localStorage) {
					return;
				}
			} catch {
				return;
			}

			if (event.key === enabledKey || event.key === null) {
				const enabled = event.newValue === 'true';
				setSettings((current) =>
					current.enabled === enabled ? current : {...current, enabled},
				);
			}

			if (event.key === limitKey || event.key === null) {
				const parsedLimit =
					event.newValue === null || event.newValue.trim() === ''
						? Internals.DEFAULT_SEQUENCE_ACTIVITY_LIMIT
						: Number(event.newValue);
				const limit =
					Number.isSafeInteger(parsedLimit) && parsedLimit >= 0
						? parsedLimit
						: Internals.DEFAULT_SEQUENCE_ACTIVITY_LIMIT;
				setSettings((current) =>
					current.limit === limit ? current : {...current, limit},
				);
			}
		};

		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	}, []);
	const value = useMemo(
		() => ({...settings, setEnabled, setLimit}),
		[setEnabled, setLimit, settings],
	);

	return (
		<Internals.SequenceActivitySettingsContext.Provider value={value}>
			{children}
		</Internals.SequenceActivitySettingsContext.Provider>
	);
};
