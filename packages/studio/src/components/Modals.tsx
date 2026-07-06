import React, {useContext} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {ModalsContext} from '../state/modals';
import {AskAiModal} from './AskAiModal';
import {ConfirmationDialog} from './ConfirmationDialog';
import {EffectPickerModal} from './EffectPickerModal';
import {InstallPackageModal} from './InstallPackage';
import {DeleteComposition} from './NewComposition/DeleteComposition';
import {DeleteFolder} from './NewComposition/DeleteFolder';
import {DuplicateComposition} from './NewComposition/DuplicateComposition';
import {NewComposition} from './NewComposition/NewComposition';
import {NewFolder} from './NewComposition/NewFolder';
import {RenameComposition} from './NewComposition/RenameComposition';
import {RenameFolder} from './NewComposition/RenameFolder';
import {RenameStaticFileModal} from './NewComposition/RenameStaticFile';
import {OverrideInputPropsModal} from './OverrideInputProps';
import QuickSwitcher from './QuickSwitcher/QuickSwitcher';
import {RenderStatusModal} from './RenderModal/RenderStatusModal';
import {RenderModalWithLoader} from './RenderModal/ServerRenderModal';
import {WebRenderModalWithLoader} from './RenderModal/WebRenderModal';
import {KeyframeSettingsModal} from './Timeline/KeyframeSettingsModal';
import {UpdateModal} from './UpdateModal/UpdateModal';

export const Modals: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {selectedModal: modalContextType} = useContext(ModalsContext);
	const canRender =
		useContext(StudioServerConnectionCtx).previewServerState.type ===
		'connected';

	return (
		<>
			{modalContextType && modalContextType.type === 'new-comp' && (
				<NewComposition
					folderName={modalContextType.folderName}
					parentName={modalContextType.parentName}
					stack={modalContextType.stack}
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
			{modalContextType && modalContextType.type === 'keyframe-settings' && (
				<KeyframeSettingsModal state={modalContextType} />
			)}

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

			{modalContextType && modalContextType.type === 'update' && (
				<UpdateModal
					info={modalContextType.info}
					knownBugs={modalContextType.knownBugs}
				/>
			)}
			{modalContextType && modalContextType.type === 'install-packages' && (
				<InstallPackageModal packageManager={modalContextType.packageManager} />
			)}

			{modalContextType && modalContextType.type === 'quick-switcher' && (
				<QuickSwitcher
					readOnlyStudio={readOnlyStudio}
					invocationTimestamp={modalContextType.invocationTimestamp}
					initialMode={modalContextType.mode}
				/>
			)}
			{modalContextType && modalContextType.type === 'add-effect' && (
				<EffectPickerModal state={modalContextType} />
			)}
			{modalContextType && modalContextType.type === 'confirmation-dialog' && (
				<ConfirmationDialog state={modalContextType} />
			)}
			{process.env.ASK_AI_ENABLED && <AskAiModal />}
		</>
	);
};
