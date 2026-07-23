import React, {createContext, useCallback, useMemo, useState} from 'react';
import type {CaptionJson} from '../components/caption-json';

type CaptionTimingEditSession = {
	readonly ownerId: string;
	readonly captions: CaptionJson[];
	readonly onChange: (captions: CaptionJson[]) => void;
};

type CaptionTimingEditContextValue = {
	readonly session: CaptionTimingEditSession | null;
	readonly selectedCaptionIndex: number | null;
	readonly selectionRevision: number;
	readonly selectCaption: (ownerId: string, index: number) => void;
	readonly start: (session: CaptionTimingEditSession) => void;
	readonly stop: (ownerId: string) => void;
	readonly sync: (session: CaptionTimingEditSession) => void;
	readonly updateCaptions: (ownerId: string, captions: CaptionJson[]) => void;
};

export const CaptionTimingEditContext =
	createContext<CaptionTimingEditContextValue>({
		session: null,
		selectedCaptionIndex: null,
		selectionRevision: 0,
		selectCaption: () => undefined,
		start: () => undefined,
		stop: () => undefined,
		sync: () => undefined,
		updateCaptions: () => undefined,
	});

export const CaptionTimingEditProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [session, setSession] = useState<CaptionTimingEditSession | null>(null);
	const [selectedCaptionIndex, setSelectedCaptionIndex] = useState<
		number | null
	>(null);
	const [selectionRevision, setSelectionRevision] = useState(0);

	const start = useCallback((newSession: CaptionTimingEditSession) => {
		setSession(newSession);
		setSelectedCaptionIndex(null);
	}, []);

	const stop = useCallback((ownerId: string) => {
		setSession((current) => {
			if (current?.ownerId !== ownerId) {
				return current;
			}

			setSelectedCaptionIndex(null);
			return null;
		});
	}, []);

	const sync = useCallback((newSession: CaptionTimingEditSession) => {
		setSession((current) =>
			current?.ownerId === newSession.ownerId ? newSession : current,
		);
	}, []);

	const selectCaption = useCallback(
		(ownerId: string, index: number) => {
			if (session?.ownerId !== ownerId) {
				return;
			}

			setSelectedCaptionIndex(index);
			setSelectionRevision((revision) => revision + 1);
		},
		[session?.ownerId],
	);

	const updateCaptions = useCallback(
		(ownerId: string, captions: CaptionJson[]) => {
			if (session?.ownerId !== ownerId) {
				return;
			}

			session.onChange(captions);
			setSession({...session, captions});
		},
		[session],
	);

	const value = useMemo<CaptionTimingEditContextValue>(
		() => ({
			session,
			selectedCaptionIndex,
			selectionRevision,
			selectCaption,
			start,
			stop,
			sync,
			updateCaptions,
		}),
		[
			selectedCaptionIndex,
			selectionRevision,
			selectCaption,
			session,
			start,
			stop,
			sync,
			updateCaptions,
		],
	);

	return (
		<CaptionTimingEditContext.Provider value={value}>
			{children}
		</CaptionTimingEditContext.Provider>
	);
};
