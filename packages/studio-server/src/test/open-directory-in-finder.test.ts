import {expect, test} from 'bun:test';
import {getWindowsExplorerSelectArgs} from '../windows-explorer-select';

test('Windows explorer /select uses a single combined argv entry', () => {
	const resolved = 'C:\\Users\\demo\\project\\src\\Root.tsx';
	const args = getWindowsExplorerSelectArgs(resolved);

	expect(args).toEqual([`/select,${resolved}`]);
	expect(args).toHaveLength(1);
	// Regression guard: must not be the broken two-arg form
	expect(args).not.toEqual(['/select,', resolved]);
});

test('Windows explorer /select keeps spaces inside the path portion', () => {
	const resolved = 'C:\\Users\\demo\\My Project\\file.tsx';
	const args = getWindowsExplorerSelectArgs(resolved);

	expect(args).toEqual(['/select,C:\\Users\\demo\\My Project\\file.tsx']);
	expect(args).toHaveLength(1);
});
