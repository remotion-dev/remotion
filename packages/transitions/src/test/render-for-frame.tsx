import {
	makeMockCompositionManagerContext,
	makeTimelineContext,
} from '@remotion/test-utils';
import {renderToString} from 'react-dom/server';
import {Internals} from 'remotion';

export const renderForFrame = (frame: number, markup: React.ReactNode) => {
	return renderToString(
		<Internals.RemotionEnvironmentContext
			value={{
				isRendering: false,
				isClientSideRendering: false,
				isPlayer: true,
				isStudio: true,
				isReadOnlyStudio: false,
			}}
		>
			<Internals.CanUseRemotionHooksProvider>
				<Internals.CompositionManager.Provider
					value={makeMockCompositionManagerContext()}
				>
					<Internals.TimelineContext.Provider
						value={makeTimelineContext(frame)}
					>
						{markup}
					</Internals.TimelineContext.Provider>
				</Internals.CompositionManager.Provider>
			</Internals.CanUseRemotionHooksProvider>
			,
		</Internals.RemotionEnvironmentContext>,
	);
};
