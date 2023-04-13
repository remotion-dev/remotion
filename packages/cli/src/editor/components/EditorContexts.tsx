import React from 'react';
import {PreviewServerConnection} from '../helpers/client-id';
import {FolderContextProvider} from '../state/folders';
import {HighestZIndexProvider} from '../state/highest-z-index';
import {KeybindingContextProvider} from '../state/keybindings';
import {PreviewSizeProvider} from '../state/preview-size';

import {SidebarContextProvider} from '../state/sidebar';
import {CheckerboardProvider} from './CheckerboardProvider';
import {MediaVolumeProvider} from './MediaVolumeProvider';
import {ModalsProvider} from './ModalsProvider';
import {PlayerEmitterContext} from './PlayerEmitterContext';
import {RenderQueueContextProvider} from './RenderQueue/context';
import {SetTimelineInOutProvider} from './SetTimelineInOutProvider';
import {ZoomGesturesProvider} from './ZoomGesturesProvider';

export const EditorContexts: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	return (
		<PreviewServerConnection>
			<RenderQueueContextProvider>
				<KeybindingContextProvider>
					<CheckerboardProvider>
						<ZoomGesturesProvider>
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
						</ZoomGesturesProvider>
					</CheckerboardProvider>
				</KeybindingContextProvider>
			</RenderQueueContextProvider>
		</PreviewServerConnection>
	);
};
