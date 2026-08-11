import {createContext} from 'react';

if (typeof createContext !== 'function') {
	const err = [
		'Remotion requires React.createContext, but it is "undefined".',
		'If you are in a React Server Component, turn it into a client component by adding "use client" at the top of the file.',
		'',
		'Before:',
		'  import {useCurrentFrame} from "remotion";',
		'',
		'After:',
		'  "use client";',
		'  import {useCurrentFrame} from "remotion";',
	];

	throw new Error(err.join('\n'));
}
