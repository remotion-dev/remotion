import React, {useContext} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {ModalsContext} from '../state/modals';
import NewComposition from './NewComposition/NewComposition';
import QuickSwitcher from './QuickSwitcher/QuickSwitcher';
import {RenderModalWithLoader} from './RenderModal/RenderModal';
import {RenderStatusModal} from './RenderModal/RenderStatusModal';
import {UpdateModal} from './UpdateModal/UpdateModal';

export const Modals: React.FC = () => {
	const {selectedModal: modalContextType} = useContext(ModalsContext);
	const canRender = useContext(StudioServerConnectionCtx).type === 'connected';

	return (
		<>
			{modalContextType && modalContextType.type === 'new-comp' && (
				<NewComposition initialCompType={modalContextType.compType} />
			)}

			{modalContextType && canRender && modalContextType.type === 'render' && (
				<RenderModalWithLoader
					initialFrame={modalContextType.initialFrame}
					compositionId={modalContextType.compositionId}
					initialVideoImageFormat={modalContextType.initialVideoImageFormat}
					initialJpegQuality={modalContextType.initialJpegQuality}
					initialOutName={modalContextType.initialOutName}
					initialScale={modalContextType.initialScale}
					initialVerbose={modalContextType.initialVerbose}
					initialRenderType={modalContextType.initialRenderType}
					initialVideoCodecForAudioTab={
						modalContextType.initialVideoCodecForAudioTab
					}
					initialVideoCodecForVideoTab={
						modalContextType.initialVideoCodecForVideoTab
					}
					initialConcurrency={modalContextType.initialConcurrency}
					maxConcurrency={modalContextType.maxConcurrency}
					minConcurrency={modalContextType.minConcurrency}
					initialStillImageFormat={modalContextType.initialStillImageFormat}
					initialMuted={modalContextType.initialMuted}
					initialEnforceAudioTrack={modalContextType.initialEnforceAudioTrack}
					initialProResProfile={modalContextType.initialProResProfile}
					initialPixelFormat={modalContextType.initialPixelFormat}
					initialAudioBitrate={modalContextType.initialAudioBitrate}
					initialVideoBitrate={modalContextType.initialVideoBitrate}
					initialEveryNthFrame={modalContextType.initialEveryNthFrame}
					initialNumberOfGifLoops={modalContextType.initialNumberOfGifLoops}
					initialDelayRenderTimeout={modalContextType.initialDelayRenderTimeout}
					initialAudioCodec={modalContextType.initialAudioCodec}
					initialEnvVariables={modalContextType.initialEnvVariables}
					initialDisableWebSecurity={modalContextType.initialDisableWebSecurity}
					initialGl={modalContextType.initialOpenGlRenderer}
					initialHeadless={modalContextType.initialHeadless}
					initialIgnoreCertificateErrors={
						modalContextType.initialIgnoreCertificateErrors
					}
					defaultProps={modalContextType.defaultProps}
					inFrameMark={modalContextType.inFrameMark}
					outFrameMark={modalContextType.outFrameMark}
				/>
			)}

			{modalContextType &&
				canRender &&
				modalContextType.type === 'render-progress' && (
					<RenderStatusModal jobId={modalContextType.jobId} />
				)}

			{modalContextType && modalContextType.type === 'update' && (
				<UpdateModal info={modalContextType.info} />
			)}

			{modalContextType && modalContextType.type === 'quick-switcher' && (
				<QuickSwitcher
					invocationTimestamp={modalContextType.invocationTimestamp}
					initialMode={modalContextType.mode}
				/>
			)}
		</>
	);
};
