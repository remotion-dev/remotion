import {
	addElementLibraryToStudio,
	type AddElementLibraryToStudioErrorCode,
} from '@remotion/studio-protocol';
import React, {useCallback, useId, useState} from 'react';
import {
	thirdPartyElementLibraries,
	type ThirdPartyElementLibrary,
} from './third-party-element-library-data';
import styles from './ThirdPartyElementLibraries.module.css';

type AddState =
	| {readonly type: 'idle'}
	| {readonly type: 'loading'}
	| {readonly message: string; readonly type: 'awaiting-confirmation'}
	| {
			readonly code: AddElementLibraryToStudioErrorCode | null;
			readonly message: string;
			readonly type: 'error';
	  };

const ThirdPartyElementLibraryItem: React.FC<{
	readonly library: ThirdPartyElementLibrary;
	readonly requestLibraryAddition: typeof addElementLibraryToStudio;
}> = ({library, requestLibraryAddition}) => {
	const [addState, setAddState] = useState<AddState>({type: 'idle'});
	const statusId = useId();
	const isLoading = addState.type === 'loading';

	const addToStudio = useCallback(async () => {
		setAddState({type: 'loading'});

		try {
			const result = await requestLibraryAddition({
				displayName: library.displayName,
				url: library.catalogUrl,
			});
			if (!result.success) {
				setAddState({
					code: result.code,
					message: result.message,
					type: 'error',
				});
				return;
			}

			setAddState({
				message: `Request sent to ${result.target.projectName ?? 'Remotion Studio'}. Confirm adding ${library.displayName} inside Studio.`,
				type: 'awaiting-confirmation',
			});
		} catch {
			setAddState({
				code: null,
				message:
					'Could not send the request to Remotion Studio. Check that Studio is running, then try again.',
				type: 'error',
			});
		}
	}, [library.catalogUrl, library.displayName, requestLibraryAddition]);

	let status: React.ReactNode = null;
	if (addState.type === 'awaiting-confirmation') {
		status = (
			<p
				aria-live="polite"
				className={styles.successStatus}
				id={statusId}
				role="status"
			>
				{addState.message}
			</p>
		);
	} else if (addState.type === 'error') {
		status = (
			<p className={styles.errorStatus} id={statusId} role="alert">
				{addState.message}{' '}
				{addState.code === 'no-compatible-studio' ? (
					<a href="/docs/studio">How to start Studio.</a>
				) : addState.code === 'studio-upgrade-required' ? (
					<a href="/docs/upgrading">How to upgrade Remotion.</a>
				) : null}
			</p>
		);
	} else if (isLoading) {
		status = (
			<p aria-live="polite" className={styles.loadingStatus} id={statusId}>
				Finding a compatible Remotion Studio…
			</p>
		);
	}

	return (
		<li className={styles.listItem}>
			<a href={library.browseUrl} rel="noreferrer" target="_blank">
				{library.displayName}
			</a>{' '}
			(
			<button
				aria-describedby={addState.type === 'idle' ? undefined : statusId}
				aria-label={
					isLoading
						? `Adding ${library.displayName} to Studio`
						: `Add ${library.displayName} to Studio`
				}
				className={styles.addLink}
				disabled={isLoading}
				onClick={addToStudio}
				type="button"
			>
				{isLoading ? 'Adding to Studio…' : 'Add to Studio'}
			</button>
			) - {library.description}
			{status}
		</li>
	);
};

export const ThirdPartyElementLibraryList: React.FC<{
	readonly requestLibraryAddition: typeof addElementLibraryToStudio;
}> = ({requestLibraryAddition}) => {
	return (
		<ul className={styles.list}>
			{thirdPartyElementLibraries.map((library) => (
				<ThirdPartyElementLibraryItem
					key={library.catalogUrl}
					library={library}
					requestLibraryAddition={requestLibraryAddition}
				/>
			))}
		</ul>
	);
};

export const ThirdPartyElementLibraries: React.FC = () => {
	return (
		<ThirdPartyElementLibraryList
			requestLibraryAddition={addElementLibraryToStudio}
		/>
	);
};
