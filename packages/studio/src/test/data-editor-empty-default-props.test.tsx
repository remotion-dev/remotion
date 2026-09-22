import {afterEach, beforeEach, expect, test} from 'bun:test';
import {cleanup, render, screen} from '@testing-library/react';
import type {_InternalTypes} from 'remotion';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import {z} from 'zod';
import {ZodProvider} from '../components/get-zod-if-possible';
import {DataEditor} from '../components/RenderModal/DataEditor';

const originalInputProps = window.remotion_inputProps;
const originalIsStudio = window.remotion_isStudio;
const originalStaticBase = window.remotion_staticBase;
const originalStaticFiles = window.remotion_staticFiles;

beforeEach(() => {
	window.remotion_inputProps = JSON.stringify(JSON.stringify({}));
	window.remotion_isStudio = true;
	window.remotion_staticBase = '/testbed/';
	window.remotion_staticFiles = [];
});

afterEach(() => {
	cleanup();
	window.remotion_inputProps = originalInputProps;
	window.remotion_isStudio = originalIsStudio;
	window.remotion_staticBase = originalStaticBase;
	window.remotion_staticFiles = originalStaticFiles;
});

test('shows invalid empty default props without crashing the editor', async () => {
	const schema = z.object({title: z.string()});
	const composition = {
		calculateMetadata: null,
		component: () => null,
		defaultProps: {},
		durationInFrames: 30,
		folderName: null,
		fps: 30,
		height: 1080,
		id: 'invalid-default-props',
		order: 0,
		parentFolderName: null,
		schema,
		stack: null,
		width: 1920,
	} as unknown as _InternalTypes['AnyComposition'];

	render(
		<ZodProvider>
			<DataEditor
				unresolvedComposition={composition}
				defaultProps={{}}
				setDefaultProps={() => undefined}
				propsEditType="default-props"
				canSaveDefaultProps={null}
				mode="schema"
			/>
		</ZodProvider>,
	);

	expect(await screen.findByText(/is not valid:/)).toBeTruthy();
	expect(screen.getByText('title')).toBeTruthy();
});
