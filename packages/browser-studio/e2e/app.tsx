import {
	BrowserStudio,
	createBlankTemplateProject,
	loadGitHubRepository,
	type VirtualProject,
} from '@remotion/browser-studio';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {createRoot} from 'react-dom/client';
import {VERSION} from 'remotion/version';

const initialElementPayload = StudioProtocolInternals.parseBrowserStudioHash(
	window.location.hash,
);
(
	window as typeof window & {__browserStudioRemotionVersion: string}
).__browserStudioRemotionVersion = VERSION;
const render = async () => {
	const project = new URLSearchParams(window.location.search).has('github')
		? await loadGitHubRepository({
				repoUrl: 'https://github.com/remotion-dev/opfs-fixture',
			})
		: createBlankTemplateProject();
	(
		window as typeof window & {
			__browserStudioProject: VirtualProject;
			__browserStudioRemotionVersion: string;
		}
	).__browserStudioProject = project;
	if (!new URLSearchParams(window.location.search).has('github')) {
		project.files['/project/src/index.ts'] =
			`import {fade} from '@remotion/transitions/fade';
import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';

void fade;
registerRoot(RemotionRoot);
`;
	}

	if (new URLSearchParams(window.location.search).has('composition-drop')) {
		project.files['/project/src/Root.tsx'] =
			`import {Composition} from 'remotion';
import {Parent} from './Parent';
import {Child} from './Child';
export const RemotionRoot = () => <>
  <Composition id="Parent" component={Parent} width={1280} height={720} fps={30} durationInFrames={120} />
  <Composition id="Child" component={Child} width={320} height={180} fps={30} durationInFrames={30} defaultProps={{text: 'Nested composition'}} />
</>;
`;
		project.files['/project/src/Parent.tsx'] =
			`import {AbsoluteFill} from 'remotion';
export const Parent = () => <AbsoluteFill style={{backgroundColor: 'white'}} />;
`;
		project.files['/project/src/Child.tsx'] =
			`export const Child = ({text}: {text: string}) => <div style={{backgroundColor: 'red', width: '100%', height: '100%'}}>{text}</div>;
`;
	}

	const root = document.getElementById('root');
	if (!root) {
		throw new Error('Could not find root element');
	}

	const source = new URLSearchParams(window.location.search).get('source');

	createRoot(root).render(
		<BrowserStudio
			dependencyResolver={
				source === 'fallback'
					? ({name, version}) => (name === 'react' ? version : null)
					: undefined
			}
			initialElement={
				initialElementPayload === null
					? null
					: {payload: initialElementPayload, sourceOrigin: null}
			}
			project={project}
			readOnly={false}
			onProjectChange={(nextProject) => {
				(
					window as typeof window & {__browserStudioProject: VirtualProject}
				).__browserStudioProject = nextProject;
			}}
			remotionPackageSource={
				source === 'release'
					? {
							baseUrl: new URL(
								`/__remotion_browser_studio_release__/${VERSION}/`,
								window.location.href,
							).href,
							type: 'release',
							version: VERSION,
						}
					: {
							baseUrl: new URL(
								'/__remotion_browser_studio_workspace__/commits/e2e/',
								window.location.href,
							).href,
							commit: 'e2e',
							type: 'workspace',
						}
			}
		/>,
	);
};

render().catch((error) => {
	setTimeout(() => {
		throw error;
	}, 0);
});
