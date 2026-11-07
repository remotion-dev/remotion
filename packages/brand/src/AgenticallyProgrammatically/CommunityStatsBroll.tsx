import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {
	CanvasImage,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';

const RepositoryPage = ({
	view,
}: {
	readonly view: 'header' | 'stars' | 'npm';
}) => {
	const frame = useCurrentFrame();
	const stars = view === 'stars';
	const header = view === 'header';
	const width = stars ? 1518 : header ? 2600 : 3367;
	const height = stars ? 1815 : header ? 1400 : 2960;
	const focusX = stars ? 627 : header ? 880 : 1961;
	const focusY = stars ? 1161 : header ? 128 : 2261;

	return (
		<CanvasImage
			name={
				stars
					? 'GitHub stars on the repository page'
					: header
						? 'remotion-dev/remotion header'
						: 'Remotion README'
			}
			src={
				stars
					? 'https://remotion.media/agentically-programmatically/github-about-5x-b24a24a131bd.png'
					: header
						? 'https://remotion.media/agentically-programmatically/github-header-5x-2bdae6240688.png'
						: 'https://remotion.media/agentically-programmatically/github-readme-5x-b453624a551a.png'
			}
			effects={[
				linearProgressiveBlur({
					start: [0.5, (focusY + 90) / height],
					end: [0.5, (focusY + 480) / height],
					endBlur: 20,
				}),
			]}
			style={{
				position: 'absolute',
				left: '50%',
				top: '50%',
				width,
				height,
				translate: `${-focusX}px ${-focusY}px`,
				transformOrigin: `${focusX}px ${focusY}px`,
				rotate: EXPLORE_CAMERA_ANGLE,
				scale: interpolate(frame, [0, 48], [1, 1.04], {
					easing: Easing.bezier(0.42, 0, 0.58, 1),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			}}
		/>
	);
};

export const GitHubHeaderBroll = Interactive.create({
	Component: () => <RepositoryPage view="header" />,
	layout: 'absolute-fill',
	schema: {},
});

export const GitHubStarsBroll = Interactive.create({
	Component: () => <RepositoryPage view="stars" />,
	layout: 'absolute-fill',
	schema: {},
});

export const NpmDownloadsBroll = Interactive.create({
	Component: () => <RepositoryPage view="npm" />,
	layout: 'absolute-fill',
	schema: {},
});
