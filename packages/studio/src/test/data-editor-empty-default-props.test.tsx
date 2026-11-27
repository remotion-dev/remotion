import {afterEach, beforeEach, expect, test} from 'bun:test';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import type {_InternalTypes} from 'remotion';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import {z} from 'zod';
import {ZodProvider} from '../components/get-zod-if-possible';
import {DataEditor} from '../components/RenderModal/DataEditor';
import type {ModalState} from '../state/modals';
import {SetSelectedModalContext} from '../state/modals';

const originalInputProps = window.remotion_inputProps;
const originalIsStudio = window.remotion_isStudio;
const originalStaticBase = window.remotion_staticBase;
const originalStaticFiles = window.remotion_staticFiles;

beforeEach(() => {
	window.remotion_inputProps = JSON.stringify({});
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

const makeComposition = (
	id: string,
	defaultProps: Record<string, unknown>,
	schema: unknown,
) =>
	({
		calculateMetadata: null,
		component: () => null,
		defaultProps,
		durationInFrames: 30,
		folderName: null,
		fps: 30,
		height: 1080,
		id,
		order: 0,
		parentFolderName: null,
		schema,
		stack: null,
		width: 1920,
	}) as unknown as _InternalTypes['AnyComposition'];

test('opens the Fix modal from the cannot save default props warning', async () => {
	const opened: (ModalState | null)[] = [];
	const reason =
		'Could not find or extract defaultProps for composition "Demo"';

	render(
		<SetSelectedModalContext.Provider
			value={{
				setSelectedModal: (modal) => {
					opened.push(typeof modal === 'function' ? modal(null) : modal);
				},
			}}
		>
			<ZodProvider>
				<DataEditor
					unresolvedComposition={makeComposition(
						'Demo',
						{title: 'Hello'},
						z.object({title: z.string()}),
					)}
					defaultProps={{title: 'Hello'}}
					setDefaultProps={() => undefined}
					propsEditType="default-props"
					canSaveDefaultProps={{canUpdate: false, reason, determined: true}}
					mode="schema"
				/>
			</ZodProvider>
		</SetSelectedModalContext.Provider>,
	);

	fireEvent.click(await screen.findByRole('button', {name: 'Fix'}));
	expect(opened).toEqual([
		{type: 'fix-default-props', compositionId: 'Demo', reason},
	]);
});

test('shows invalid empty default props without crashing the editor', async () => {
	const schema = z.object({title: z.string()});
	const composition = makeComposition('invalid-default-props', {}, schema);

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
