import {AbsoluteFill} from 'remotion';

export const styleAttributeCleanupFixture = (literal: boolean) => {
	const Component = () => (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<style>{`.cleanup-subject{display:block}.cleanup-marker{width:20px;height:20px;background:#1373ab}${literal ? '' : '.cleanup-subject:not([style])+.cleanup-marker{background:#1373ab}.cleanup-subject[style]+.cleanup-marker{background:#a72854}'}`}</style>
			<svg className="cleanup-subject" width={0} height={0} />
			<div className="cleanup-marker" />
		</AbsoluteFill>
	);
	return {
		component: Component,
		id: `style-attribute-cleanup${literal ? '-literal' : ''}`,
		width: 160,
		height: 80,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
