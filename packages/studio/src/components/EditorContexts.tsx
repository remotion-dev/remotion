import {PlayerInternals} from '@remotion/player';
import React from 'react';
import {PreviewServerConnection} from '../helpers/client-id';
import {FolderContextProvider} from '../state/folders';
import {HighestZIndexProvider} from '../state/highest-z-index';
import {KeybindingContextProvider} from '../state/keybindings';
import {PreviewSizeProvider} from '../state/preview-size';
import {SidebarContextProvider} from '../state/sidebar';
import {VisualControlsProvider} from '../visual-controls/VisualControls';
import {CheckerboardProvider} from './CheckerboardProvider';
import {ExpandedTracksProvider} from './ExpandedTracksProvider';
import {ZodProvider} from './get-zod-if-possible';
import {MediaVolumeProvider} from './MediaVolumeProvider';
import {ModalsProvider} from './ModalsProvider';
import {ClientRenderQueueProcessor} from './RenderQueue/ClientRenderQueueProcessor';
import {RenderQueueContextProvider} from './RenderQueue/context';
import {SetTimelineInOutProvider} from './SetTimelineInOutProvider';
import {ShowGuidesProvider} from './ShowGuidesProvider';
import {ShowOutlinesProvider} from './ShowOutlinesProvider';
import {ShowRulersProvider} from './ShowRulersProvider';
import {SnappingProvider} from './SnappingProvider';
import {VisualControlsUndoSync} from './VisualControls/VisualControlsUndoSync';
import {ZoomGesturesProvider} from './ZoomGesturesProvider';

export const EditorContexts: React.FC<{
	readonly children: React.ReactNode;
	readonly readOnlyStudio: boolean;
}> = ({children, readOnlyStudio}) => {
	return (
		<ZodProvider>
			<VisualControlsProvider>
				<PreviewServerConnection readOnlyStudio={readOnlyStudio}>
					<VisualControlsUndoSync />
					<RenderQueueContextProvider>
						<ClientRenderQueueProcessor />
						<KeybindingContextProvider>
							<CheckerboardProvider>
								<ZoomGesturesProvider>
									<ShowRulersProvider>
										<ShowGuidesProvider>
											<ShowOutlinesProvider>
												<SnappingProvider>
													<PreviewSizeProvider>
														<ModalsProvider>
															<MediaVolumeProvider>
																<PlayerInternals.PlayerEmitterProvider
																	currentPlaybackRate={null}
																>
																	<SidebarContextProvider>
																		<FolderContextProvider>
																			<HighestZIndexProvider>
																				<SetTimelineInOutProvider>
																					<ExpandedTracksProvider>
																						{children}
																					</ExpandedTracksProvider>
																				</SetTimelineInOutProvider>
																			</HighestZIndexProvider>
																		</FolderContextProvider>
																	</SidebarContextProvider>
																</PlayerInternals.PlayerEmitterProvider>
															</MediaVolumeProvider>
														</ModalsProvider>
													</PreviewSizeProvider>
												</SnappingProvider>
											</ShowOutlinesProvider>
										</ShowGuidesProvider>
									</ShowRulersProvider>
								</ZoomGesturesProvider>
							</CheckerboardProvider>
						</KeybindingContextProvider>
					</RenderQueueContextProvider>
				</PreviewServerConnection>
			</VisualControlsProvider>
		</ZodProvider>
	);
};
