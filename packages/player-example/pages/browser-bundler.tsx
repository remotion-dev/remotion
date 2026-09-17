import dynamic from 'next/dynamic';

const BrowserBundlerPage = dynamic(
	() =>
		import('../src/BrowserBundlerExample').then(
			(module) => module.BrowserBundlerExample,
		),
	{
		ssr: false,
		loading: () => <p role="status">Loading the browser compiler example…</p>,
	},
);

export default BrowserBundlerPage;
