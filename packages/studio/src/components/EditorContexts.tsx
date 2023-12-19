import React from 'react';
import {PreviewServerConnection} from '../../../../studio/src/helpers/client-id';
import {FolderContextProvider} from '../state/folders';
import {HighestZIndexProvider} from '../state/highest-z-index';
import {KeybindingContextProvider} from '../state/keybindings';
import {PreviewSizeProvider} from '../state/preview-size';

import {SidebarContextProvider} from '../state/sidebar';
import {CheckerboardProvider} from './CheckerboardProvider';
import {ZodProvider} from './get-zod-if-possible';
import {MediaVolumeProvider} from './MediaVolumeProvider';
import {ModalsProvider} from './ModalsProvider';
import {PlayerEmitterContext} from './PlayerEmitterContext';
import {RenderQueueContextProvider} from './RenderQueue/context';
import {SetTimelineInOutProvider} from './SetTimelineInOutProvider';
import {ShowGuidesProvider} from './ShowGuidesProvider';
import {ShowRulersProvider} from './ShowRulersProvider';
import {ZoomGesturesProvider} from './ZoomGesturesProvider';

export const EditorContexts: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	return (
		<ZodProvider>
			<PreviewServerConnection>
				<RenderQueueContextProvider>
					<KeybindingContextProvider>
						<CheckerboardProvider>
							<ZoomGesturesProvider>
								<ShowRulersProvider>
									<ShowGuidesProvider>
										<PreviewSizeProvider>
											<ModalsProvider>
												<MediaVolumeProvider>
													<PlayerEmitterContext>
														<SidebarContextProvider>
															<FolderContextProvider>
																<HighestZIndexProvider>
																	<SetTimelineInOutProvider>
																		{children}
																	</SetTimelineInOutProvider>
																</HighestZIndexProvider>
															</FolderContextProvider>
														</SidebarContextProvider>
													</PlayerEmitterContext>
												</MediaVolumeProvider>
											</ModalsProvider>
										</PreviewSizeProvider>
									</ShowGuidesProvider>
								</ShowRulersProvider>
							</ZoomGesturesProvider>
						</CheckerboardProvider>
					</KeybindingContextProvider>
				</RenderQueueContextProvider>
			</PreviewServerConnection>
		</ZodProvider>
	);
};
