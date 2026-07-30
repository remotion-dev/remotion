declare const BUNDLER_PLUGIN_SENTINEL: string;

console.log(
	<div>
		{typeof BUNDLER_PLUGIN_SENTINEL === 'undefined'
			? 'PLUGIN_NOT_DEFINED'
			: BUNDLER_PLUGIN_SENTINEL}
	</div>,
);
