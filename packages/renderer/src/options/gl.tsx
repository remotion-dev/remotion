import type {AnyRemotionOption} from './option';

export const validOpenGlRenderers = [
	'swangle',
	'angle',
	'egl',
	'swiftshader',
	'vulkan',
	'angle-egl',
] as const;

export type OpenGlRenderer = (typeof validOpenGlRenderers)[number];

export const DEFAULT_OPENGL_RENDERER: OpenGlRenderer | null = null;

let openGlRenderer: OpenGlRenderer | null = DEFAULT_OPENGL_RENDERER;

export const getChromiumOpenGlRenderer = () => openGlRenderer;
export const setChromiumOpenGlRenderer = (renderer: OpenGlRenderer) => {
	validateOpenGlRenderer(renderer);
	openGlRenderer = renderer;
};

const AngleChangelog: React.FC = () => {
	return (
		<details style={{fontSize: '0.9em', marginBottom: '1em'}}>
			<summary>Changelog</summary>
			<ul>
				<li>
					From Remotion v2.6.7 until v3.0.7, the default for Remotion Lambda was{' '}
					<code>swiftshader</code>, but from v3.0.8 the default is{' '}
					<code>swangle</code> (Swiftshader on Angle) since Chrome 101 added
					support for it.
				</li>
				<li>
					From Remotion v2.4.3 until v2.6.6, the default was <code>angle</code>,
					however it turns out to have a small memory leak that could crash long
					Remotion renders.
				</li>
			</ul>
		</details>
	);
};

const cliFlag = 'gl' as const;

export const glOption = {
	cliFlag,
	docLink: 'https://www.remotion.dev/docs/chromium-flags#--gl',
	name: 'OpenGL renderer',
	type: 'angle' as OpenGlRenderer | null,
	ssrName: 'gl',
	description: () => {
		return (
			<>
				<AngleChangelog />
				<p>
					Select the OpenGL renderer backend for Chromium. <br />
					Accepted values:
				</p>
				<ul>
					<li>
						<code>{'"angle"'}</code>
					</li>
					<li>
						<code>{'"egl"'}</code>
					</li>
					<li>
						<code>{'"swiftshader"'}</code>
					</li>
					<li>
						<code>{'"swangle"'}</code>
					</li>
					<li>
						<code>{'"vulkan"'}</code> (<em>from Remotion v4.0.41</em>)
					</li>
					<li>
						<code>{'"angle-egl"'}</code> (<em>from Remotion v4.0.51</em>)
					</li>
				</ul>
				<p>
					The default is <code>null</code>, letting Chrome decide, except on
					Lambda where the default is <code>{'"swangle"'}</code>
				</p>
			</>
		);
	},
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag]) {
			validateOpenGlRenderer(commandLine[cliFlag]);
			return {
				value: commandLine[cliFlag] as OpenGlRenderer,
				source: 'cli',
			};
		}

		if (openGlRenderer !== DEFAULT_OPENGL_RENDERER) {
			return {
				value: openGlRenderer,
				source: 'config',
			};
		}

		return {
			value: DEFAULT_OPENGL_RENDERER,
			source: 'default',
		};
	},
	setConfig: (value: OpenGlRenderer | null) => {
		validateOpenGlRenderer(value);
		openGlRenderer = value;
	},
} satisfies AnyRemotionOption<OpenGlRenderer | null>;

export const validateOpenGlRenderer = (
	option: unknown,
): OpenGlRenderer | null => {
	if (option === null) {
		return null;
	}

	if (!validOpenGlRenderers.includes(option as OpenGlRenderer)) {
		throw new TypeError(
			`${option} is not a valid GL backend. Accepted values: ${validOpenGlRenderers.join(
				', ',
			)}`,
		);
	}

	return option as OpenGlRenderer;
};
