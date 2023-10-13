import type {AnyRemotionOption} from './option';

export const enableMultiprocessOnLinuxOption = {
	name: 'Enable Multiprocess on Linux',
	cliFlag: 'enable-multiprocess-on-linux' as const,
	description: () => (
		<>
			Removes the <code>{'--single-process'}</code> flag that gets passed to
			Chromium on Linux by default. This will make the render faster because
			multiple processes can be used, but may cause issues with some Linux
			distributions or if window server libraries are missing.
		</>
	),
	ssrName: 'chromiumOptions.enableMultiprocessOnLinux',
	docLink: 'https://www.remotion.dev/docs/chromium-flags',
	type: false as boolean,
} satisfies AnyRemotionOption;
