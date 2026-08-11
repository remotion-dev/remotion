declare module '*.mdx' {
	import type {ComponentType} from 'react';

	const Content: ComponentType;
	export default Content;
}

declare module '*.custom' {
	const content: string;
	export default content;
}
