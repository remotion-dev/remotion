import {
	addElementLibraryToStudio,
	isInsideStudio,
	type AddElementLibraryToStudioErrorCode,
} from '@remotion/studio-protocol';
import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {BlueButton} from '../../../components/layout/Button';
import {ElementLibraryInstallFallbackModal} from './ElementLibraryInstallFallbackModal';
import {
	thirdPartyElementLibraries,
	type ThirdPartyElementLibrary,
} from './third-party-element-library-data';
import {useStudioInstallFallback} from './use-studio-install-fallback';
import styles from './ThirdPartyElementLibraries.module.css';

type AddState =
	| {readonly type: 'idle'}
	| {readonly type: 'loading'}
	| {readonly type: 'awaiting-confirmation'}
	| {
			readonly code: AddElementLibraryToStudioErrorCode | null;
			readonly message: string;
			readonly type: 'error';
	  };

const ThirdPartyElementLibraryItem: React.FC<{
	readonly isEmbeddedInStudio: boolean;
	readonly library: ThirdPartyElementLibrary;
	readonly requestLibraryAddition: typeof addElementLibraryToStudio;
}> = ({isEmbeddedInStudio, library, requestLibraryAddition}) => {
	const [addState, setAddState] = useState<AddState>({type: 'idle'});
	const {buttonLabel, closeFallback, isFallbackOpen, showFallback} =
		useStudioInstallFallback('Add to Studio');
	const addButtonRef = useRef<HTMLButtonElement>(null);
	const isLoading = addState.type === 'loading';
	const isSent = addState.type === 'awaiting-confirmation';

	const addToStudio = useCallback(async () => {
		setAddState({type: 'loading'});

		try {
			const result = await requestLibraryAddition({
				displayName: library.displayName,
				url: library.libraryUrl,
			});
			if (!result.success) {
				setAddState({
					code: result.code,
					message: result.message,
					type: 'error',
				});
				showFallback();
				return;
			}

			closeFallback();
			setAddState({type: 'awaiting-confirmation'});
		} catch {
			setAddState({
				code: null,
				message:
					'Could not send the request to Remotion Studio. Check that Studio is running, then try again.',
				type: 'error',
			});
			showFallback();
		}
	}, [
		closeFallback,
		library.libraryUrl,
		library.displayName,
		requestLibraryAddition,
		showFallback,
	]);

	return (
		<li className={styles.card}>
			{library.bannerUrl === null ? null : (
				<div className={styles.preview}>
					<img alt="" className={styles.previewImage} src={library.bannerUrl} />
				</div>
			)}
			<div className={styles.content}>
				<div className={styles.libraryRow}>
					<h3 className={styles.libraryTitle}>
						<a
							className={styles.libraryLink}
							href={library.browseUrl}
							rel="noreferrer"
							target={isEmbeddedInStudio ? '_self' : '_blank'}
						>
							{library.displayName}
						</a>
					</h3>
					<BlueButton
						ref={addButtonRef}
						aria-busy={isLoading}
						aria-live="polite"
						aria-label={
							isLoading
								? `Adding ${library.displayName} to Studio`
								: isSent
									? `Sent ${library.displayName} to Studio`
									: `Add ${library.displayName} to Studio`
						}
						className={styles.addAction}
						fullWidth={false}
						loading={isLoading}
						onClick={addToStudio}
						size="sm"
						style={{fontSize: '0.75rem', lineHeight: 1.25, padding: '5px 8px'}}
						title={
							isLoading
								? `Adding ${library.displayName} to Studio`
								: isSent
									? `Sent ${library.displayName} to Studio`
									: `Add ${library.displayName} to Studio`
						}
					>
						{isSent ? 'Sent to Studio' : 'Add to Studio'}
					</BlueButton>
				</div>
			</div>
			{isFallbackOpen ? (
				<ElementLibraryInstallFallbackModal
					buttonLabel={buttonLabel}
					failure={addState.type === 'error' ? addState : null}
					isAdding={isLoading}
					library={library}
					onAdd={addToStudio}
					onClose={closeFallback}
					triggerRef={addButtonRef}
				/>
			) : null}
		</li>
	);
};

export const ThirdPartyElementLibraryList: React.FC<{
	readonly requestLibraryAddition: typeof addElementLibraryToStudio;
}> = ({requestLibraryAddition}) => {
	const [isEmbeddedInStudio, setIsEmbeddedInStudio] = useState(false);

	useLayoutEffect(() => {
		setIsEmbeddedInStudio(isInsideStudio());
	}, []);

	return (
		<div className={styles.library}>
			<ul className={styles.list} role="list">
				{thirdPartyElementLibraries.map((library) => (
					<ThirdPartyElementLibraryItem
						key={library.libraryUrl}
						isEmbeddedInStudio={isEmbeddedInStudio}
						library={library}
						requestLibraryAddition={requestLibraryAddition}
					/>
				))}
			</ul>
		</div>
	);
};

export const ThirdPartyElementLibraries: React.FC = () => {
	return (
		<ThirdPartyElementLibraryList
			requestLibraryAddition={addElementLibraryToStudio}
		/>
	);
};
