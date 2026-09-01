import React, {useContext, useEffect} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {getStudioAskAIEnabled} from '../helpers/studio-runtime-config';
import {SelectedModalContext, SetSelectedModalContext} from '../state/modals';
import {AskAiModal} from './AskAiModal';
import {callApi} from './call-api';
import {ConfirmationDialog, useConfirmationDialog} from './ConfirmationDialog';
import {EffectPickerModal} from './EffectPickerModal';
import {
	ElementInstallConfirmation,
	ElementLibraryAddConfirmation,
} from './ElementInstallConfirmation';
import {ElementLibraryModal} from './ElementLibraryModal';
import {FixComputedValueModal} from './FixComputedValueModal';
import {DeleteComposition} from './NewComposition/DeleteComposition';
import {DeleteFolder} from './NewComposition/DeleteFolder';
import {DuplicateComposition} from './NewComposition/DuplicateComposition';
import {NewComposition} from './NewComposition/NewComposition';
import {NewFolder} from './NewComposition/NewFolder';
import {RenameComposition} from './NewComposition/RenameComposition';
import {RenameFolder} from './NewComposition/RenameFolder';
import {RenameStaticFileModal} from './NewComposition/RenameStaticFile';
import {showNotification} from './Notifications/NotificationCenter';
import {OverrideInputPropsModal} from './OverrideInputProps';
import QuickSwitcher from './QuickSwitcher/QuickSwitcher';
import {RenderStatusModal} from './RenderModal/RenderStatusModal';
import {RenderModalWithLoader} from './RenderModal/ServerRenderModal';
import {WebRenderModalWithLoader} from './RenderModal/WebRenderModal';
import {SettingsModal} from './SettingsModal';
import {SvgImportDialog} from './SvgImportDialog';

export const Modals: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const modalContextType = useContext(SelectedModalContext);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {previewServerState, subscribeToEvent} = useContext(
		StudioServerConnectionCtx,
	);
	const canRender = previewServerState.type === 'connected';
	const isBrowserStudio = getBrowserStudioOperations() !== null;
	const confirm = useConfirmationDialog();

	useEffect(() => {
		if (isBrowserStudio) {
			return;
		}

		return subscribeToEvent('license-key-install-request', (event) => {
			if (event.type !== 'license-key-install-request') {
				return;
			}

			setSelectedModal({
				type: 'settings',
				initialTab: 'license',
				initialPublicLicenseKey: event.licenseKey,
			});
		});
	}, [isBrowserStudio, setSelectedModal, subscribeToEvent]);

	useEffect(() => {
		if (isBrowserStudio) {
			return;
		}

		return subscribeToEvent('element-library-add-request', (event) => {
			if (event.type !== 'element-library-add-request') {
				return;
			}

			(async () => {
				const confirmed = await confirm({
					title: 'Add Element catalog',
					message: (
						<ElementLibraryAddConfirmation
							displayName={event.displayName}
							origin={event.origin}
							url={event.url}
						/>
					),
					confirmLabel: 'Add catalog',
					cancelLabel: 'Cancel',
				});
				if (!confirmed) {
					return;
				}

				if (previewServerState.type !== 'connected') {
					showNotification('Could not add catalog: Studio disconnected', 4000);
					return;
				}

				try {
					const result = await callApi('/api/update-config', {
						clientId: previewServerState.clientId,
						updates: [
							{
								setter: 'addElementLibrary',
								type: 'set',
								value:
									event.displayName === null
										? {url: event.url}
										: {url: event.url, displayName: event.displayName},
							},
						],
					});
					if (!result.success) {
						showNotification(`Could not add catalog: ${result.reason}`, 4000);
					}
				} catch (error) {
					showNotification(
						`Could not add catalog: ${(error as Error).message}`,
						4000,
					);
				}
			})();
		});
	}, [confirm, isBrowserStudio, previewServerState, subscribeToEvent]);

	return (
		<>
			{modalContextType && modalContextType.type === 'new-comp' && (
				<NewComposition
					folderName={modalContextType.folderName}
					parentName={modalContextType.parentName}
					stack={modalContextType.stack}
					canvasCapture={modalContextType.canvasCapture}
				/>
			)}
			{modalContextType && modalContextType.type === 'new-folder' && (
				<NewFolder
					parentName={modalContextType.parentName}
					stack={modalContextType.stack}
				/>
			)}
			{modalContextType && modalContextType.type === 'duplicate-comp' && (
				<DuplicateComposition
					compositionType={modalContextType.compositionType}
					compositionId={modalContextType.compositionId}
				/>
			)}
			{modalContextType && modalContextType.type === 'delete-comp' && (
				<DeleteComposition compositionId={modalContextType.compositionId} />
			)}
			{modalContextType && modalContextType.type === 'rename-comp' && (
				<RenameComposition compositionId={modalContextType.compositionId} />
			)}
			{modalContextType && modalContextType.type === 'delete-folder' && (
				<DeleteFolder
					folderName={modalContextType.folderName}
					parentName={modalContextType.parentName}
					stack={modalContextType.stack}
				/>
			)}
			{modalContextType && modalContextType.type === 'rename-folder' && (
				<RenameFolder
					folderName={modalContextType.folderName}
					parentName={modalContextType.parentName}
					stack={modalContextType.stack}
				/>
			)}
			{modalContextType && modalContextType.type === 'rename-static-file' && (
				<RenameStaticFileModal relativePath={modalContextType.relativePath} />
			)}
			{modalContextType && modalContextType.type === 'input-props-override' && (
				<OverrideInputPropsModal />
			)}
			{modalContextType &&
			modalContextType.type === 'settings' &&
			(!isBrowserStudio ||
				modalContextType.initialTab === 'packages' ||
				modalContextType.initialTab === 'shortcuts') ? (
				<SettingsModal
					key={`${modalContextType.initialTab}-${modalContextType.initialPublicLicenseKey}`}
					initialTab={modalContextType.initialTab}
					initialPublicLicenseKey={modalContextType.initialPublicLicenseKey}
				/>
			) : null}
			{modalContextType && modalContextType.type === 'web-render' && (
				<WebRenderModalWithLoader {...modalContextType} />
			)}
			{modalContextType &&
			modalContextType.type === 'server-render' &&
			(canRender || modalContextType.readOnlyStudio) ? (
				<RenderModalWithLoader
					readOnlyStudio={modalContextType.readOnlyStudio ?? false}
					initialFrame={modalContextType.initialFrame}
					initialDarkMode={modalContextType.initialDarkMode}
					compositionId={modalContextType.compositionId}
					initialVideoImageFormat={modalContextType.initialVideoImageFormat}
					initialJpegQuality={modalContextType.initialJpegQuality}
					initialScale={modalContextType.initialScale}
					initialLogLevel={modalContextType.initialLogLevel}
					initialOffthreadVideoCacheSizeInBytes={
						modalContextType.initialOffthreadVideoCacheSizeInBytes
					}
					initialOffthreadVideoThreads={
						modalContextType.initialOffthreadVideoThreads
					}
					initialMediaCacheSizeInBytes={
						modalContextType.initialMediaCacheSizeInBytes
					}
					initialConcurrency={modalContextType.initialConcurrency}
					maxConcurrency={modalContextType.maxConcurrency}
					minConcurrency={modalContextType.minConcurrency}
					initialStillImageFormat={modalContextType.initialStillImageFormat}
					initialMuted={modalContextType.initialMuted}
					initialEnforceAudioTrack={modalContextType.initialEnforceAudioTrack}
					initialProResProfile={modalContextType.initialProResProfile}
					initialx264Preset={modalContextType.initialx264Preset}
					initialGopSize={modalContextType.initialGopSize}
					initialPixelFormat={modalContextType.initialPixelFormat}
					initialAudioBitrate={modalContextType.initialAudioBitrate}
					initialVideoBitrate={modalContextType.initialVideoBitrate}
					initialEveryNthFrame={modalContextType.initialEveryNthFrame}
					initialNumberOfGifLoops={modalContextType.initialNumberOfGifLoops}
					initialDelayRenderTimeout={modalContextType.initialDelayRenderTimeout}
					initialEnvVariables={modalContextType.initialEnvVariables}
					initialDisableWebSecurity={modalContextType.initialDisableWebSecurity}
					initialGl={modalContextType.initialOpenGlRenderer}
					initialHeadless={modalContextType.initialHeadless}
					initialIgnoreCertificateErrors={
						modalContextType.initialIgnoreCertificateErrors
					}
					initialEncodingBufferSize={modalContextType.initialEncodingBufferSize}
					initialEncodingMaxRate={modalContextType.initialEncodingMaxRate}
					initialUserAgent={modalContextType.initialUserAgent}
					initialColorSpace={modalContextType.initialColorSpace}
					initialMultiProcessOnLinux={
						modalContextType.initialMultiProcessOnLinux
					}
					initialRepro={modalContextType.initialRepro}
					initialBeep={modalContextType.initialBeep}
					initialForSeamlessAacConcatenation={
						modalContextType.initialForSeamlessAacConcatenation
					}
					defaultProps={modalContextType.defaultProps}
					inFrameMark={modalContextType.inFrameMark}
					outFrameMark={modalContextType.outFrameMark}
					defaultConfigurationAudioCodec={
						modalContextType.defaultConfigurationAudioCodec
					}
					defaultConfigurationVideoCodec={
						modalContextType.defaultConfigurationVideoCodec
					}
					renderTypeOfLastRender={modalContextType.renderTypeOfLastRender}
					defaultMetadata={modalContextType.defaulMetadata}
					initialHardwareAcceleration={
						modalContextType.initialHardwareAcceleration
					}
					initialSampleRate={modalContextType.initialSampleRate}
					initialChromeMode={modalContextType.initialChromeMode}
					renderDefaults={modalContextType.renderDefaults}
				/>
			) : null}

			{modalContextType && modalContextType.type === 'render-progress' && (
				<RenderStatusModal jobId={modalContextType.jobId} />
			)}

			{modalContextType && modalContextType.type === 'fix-computed-value' && (
				<FixComputedValueModal state={modalContextType} />
			)}
			{modalContextType && modalContextType.type === 'quick-switcher' && (
				<QuickSwitcher
					readOnlyStudio={readOnlyStudio}
					invocationTimestamp={modalContextType.invocationTimestamp}
					initialMode={modalContextType.mode}
					assetSelection={modalContextType.assetSelection}
					compositionSelection={modalContextType.compositionSelection}
				/>
			)}
			{modalContextType && modalContextType.type === 'element-library' && (
				<ElementLibraryModal
					name={modalContextType.name}
					url={modalContextType.url}
				/>
			)}
			{modalContextType && modalContextType.type === 'element-install' && (
				<ElementInstallConfirmation state={modalContextType} />
			)}
			{modalContextType && modalContextType.type === 'add-effect' && (
				<EffectPickerModal state={modalContextType} />
			)}
			{modalContextType && modalContextType.type === 'confirmation-dialog' && (
				<ConfirmationDialog state={modalContextType} />
			)}
			{modalContextType && modalContextType.type === 'svg-import-dialog' && (
				<SvgImportDialog state={modalContextType} />
			)}
			{getStudioAskAIEnabled() && <AskAiModal />}
		</>
	);
};
