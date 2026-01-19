import React from 'react';

const iconStyle: React.CSSProperties = {
	width: 16,
	height: 16,
	fill: 'currentColor',
	marginTop: 8,
};

const CheckIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 640 640"
		style={{width: 24, height: 24, fill: 'currentColor'}}
	>
		<path d="M557.5 192L534.9 214.6L278.9 470.6C266.4 483.1 246.1 483.1 233.6 470.6L105.6 342.6L83 320L128.3 274.7C129.6 276 172.3 318.7 256.3 402.7L489.7 169.3L512.3 146.7L557.6 192z" />
	</svg>
);

const ChromeIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 100 100"
		style={iconStyle}
	>
		<path d="M49.84 5a45 45 0 0 1 40.32 24.7l-37.25-1.95c-10.55-.6-20.59 5.32-24 15.26L15 21.72A45 45 0 0 1 49.85 5zM12.33 25.34l16.93 33.29C34 68 44.12 73.74 54.56 71.78L43 94.43a45 45 0 0 1-30.67-69.09M92 33.82a45 45 0 0 1-44.51 61.11l20.33-31.28c5.78-8.89 5.68-20.49-1.2-28.52zm-42 1A15.17 15.17 0 1 1 34.83 50 15.15 15.15 0 0 1 50 34.83z" />
	</svg>
);

const FirefoxIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 794 794"
		style={iconStyle}
	>
		<path d="M752.7 266.5c-16.7-40.1-50.5-83.3-77-97.1 21.7 42.3 34.2 84.9 38.8 116.5l.2.7C671.2 178.4 597.6 134.8 537.5 39.8c-3-4.8-6-9.6-9-14.7-1.6-2.6-2.9-5.2-4.3-8-2.5-4.8-4.3-9.8-5.6-15.2 0-.5-.4-.9-.9-1h-.8l-.1.1c-.2 0-.3.1-.3.1s0-.1.1-.2c-85.4 50-120.7 137.6-129.8 193.2-26.4 1.6-52.2 8.2-76 19.4a9.9 9.9 0 0 0-5 12.2c2 5.4 8 8 13.2 5.6 20.8-9.7 43.2-15.6 66.2-17.1l2.3-.3c3.1-.1 6.3-.3 9.5-.3 18.6-.1 37.2 2.5 55 7.7l3.2.9c3 .9 5.8 1.9 8.8 3 2.1.8 4.3 1.6 6.4 2.5 1.7.6 3.4 1.4 5.1 2.1 2.6 1.2 5.2 2.5 7.8 3.8l3.5 1.6c2.6 1.4 5.1 2.8 7.6 4.2 1.6.9 3.1 1.8 4.7 2.9 27.7 17.2 50.9 41 67 69.4-20.4-14.3-57.1-28.6-92.4-22.4 138 69 100.9 306.6-90.4 297.6-17-.6-33.8-3.9-49.8-9.6-3.9-1.4-7.7-3-11.4-4.6-2.1-1-4.4-2-6.5-3.1-46.9-24.2-85.5-70-90.3-125.7 0 0 17.7-66 126.8-66 11.8 0 45.6-32.9 46.2-42.4-.3-3.2-67.1-29.7-93.1-55.3-13.9-13.7-20.4-20.3-26.3-25.3a93 93 0 0 0-10-7.5c-8.7-30.6-9.1-63.1-1.1-93.8-39.4 18-70 46.4-92.3 71.4h-.2c-15.2-19.3-14.1-82.9-13.3-96.1-.1-.9-11.3 5.7-12.8 6.7-13.4 9.7-26 20.4-37.5 32.2a332 332 0 0 0-35.9 43 322.4 322.4 0 0 0-51.4 116.1c-.2.5-3.7 16.2-6.3 35.4-.5 3-.9 6-1.3 9-1 7.3-1.8 14.7-2.2 22l-.1 1.2c-.2 4.3-.5 8.5-.8 12.8v1.9c0 212 171.9 383.9 383.9 383.9 189.8 0 347.5-137.9 378.4-318.9.6-4.9 1.1-9.9 1.7-14.8 7.7-65.8-.8-135.1-25-192.9m-553-71.3c.3 0 .2 0 0 0m92.5 46.2c.3 0 .1 0 0 0" />
	</svg>
);

const SafariIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 100 100"
		style={iconStyle}
	>
		<path d="M52.66 49.85a3 3 0 0 1-2.91 3.21 3.06 3.06 0 1 1 2.64-4.37 3 3 0 0 1 .27 1.16m.75 2.91L71 23.58C68.63 25.79 46.63 46 46 47.09L28.5 76.22c2.31-2.16 24.36-22.5 24.91-23.46M85.91 50a35.8 35.8 0 0 1-5.22 18.63 24 24 0 0 0-3-1.75.66.66 0 0 0-.65.65c0 .65 2.36 1.86 3 2.21a36.1 36.1 0 0 1-21.45 15.12l-.8-3.37c-.06-.45-.36-.5-.76-.5s-.55.5-.5.75l.81 3.41c-2.41.5-4.87.76-7.34.76a36.05 36.05 0 0 1-18.68-5.28A29 29 0 0 0 33.53 77a.66.66 0 0 0-.65-.65c-.7 0-2.21 3-2.66 3.62a36.13 36.13 0 0 1-15.17-21.7l3.47-.75a.66.66 0 0 0 .5-.75c0-.35-.5-.56-.81-.5L14.8 57a35.7 35.7 0 0 1 4.77-26c1.05.76 2.15 1.42 3.31 2a.63.63 0 0 0 .66-.6c0-.71-2.66-2.06-3.27-2.46A36.18 36.18 0 0 1 42 15l.75 3.37a.66.66 0 0 0 .75.5c.35 0 .56-.5.5-.81l-.75-3.31q3.345-.645 6.75-.66a36 36 0 0 1 19 5.47 19 19 0 0 0-2 3.27.62.62 0 0 0 .6.65c.71 0 2.06-2.61 2.41-3.22a35.94 35.94 0 0 1 14.9 21.45l-2.82.6c-.45.1-.5.4-.5.8s.5.56.76.51l2.86-.62c.46 2.3.7 4.65.7 7m4.27 0a40.18 40.18 0 1 0-80.36 0 40.18 40.18 0 0 0 80.36 0M95 50a45 45 0 1 1-90 0 45 45 0 0 1 90 0" />
	</svg>
);

const NodejsIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 100 100"
		style={iconStyle}
	>
		<path d="M53.32 5.73a6.72 6.72 0 0 0-6.08 0l-34 19.2a6.7 6.7 0 0 0-3.07 5.24v38.89a6.61 6.61 0 0 0 3 5.24l34.07 20a6.57 6.57 0 0 0 6 0l33.59-19.79a6.72 6.72 0 0 0 3-5.24v-39a6.82 6.82 0 0 0-3-5.24z" />
	</svg>
);

const BunIcon: React.FC = () => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={iconStyle}>
		<path d="M11.966 22.566c6.609 0 11.966-4.326 11.966-9.661 0-3.308-2.051-6.23-5.204-7.963-1.283-.713-2.291-1.353-3.13-1.885-1.58-1.004-2.555-1.623-3.632-1.623-1.094 0-2.327.783-3.955 1.816a50 50 0 0 1-2.808 1.692C2.051 6.675 0 9.597 0 12.905c0 5.335 5.357 9.66 11.966 9.66Zm-1.397-17.83a5.9 5.9 0 0 0 .497-2.403c0-.144.201-.186.229-.028.656 2.775-.9 4.15-2.051 4.61-.124.048-.199-.12-.103-.208a5.75 5.75 0 0 0 1.428-1.971m2.052-.102a5.8 5.8 0 0 0-.78-2.3v-.015c-.068-.123.086-.263.185-.172 1.956 2.105 1.303 4.055.554 5.037-.082.102-.229-.003-.188-.126a5.8 5.8 0 0 0 .229-2.424m1.771-.559a5.7 5.7 0 0 0-1.607-1.801V2.26c-.112-.085-.024-.274.113-.218 2.588 1.084 2.766 3.171 2.452 4.395a.12.12 0 0 1-.048.071.11.11 0 0 1-.153-.026.12.12 0 0 1-.022-.083a5.9 5.9 0 0 0-.735-2.324m-5.072.559c-.616.544-1.279.758-2.058.997-.116 0-.194-.078-.155-.18 1.747-.907 2.369-1.645 2.99-2.771 0 0 .155-.117.188.085 0 .303-.348 1.325-.965 1.869m4.931 11.205a2.95 2.95 0 0 1-.935 1.549 2.16 2.16 0 0 1-1.282.618 2.17 2.17 0 0 1-1.323-.618 2.95 2.95 0 0 1-.923-1.549.24.24 0 0 1 .064-.197.23.23 0 0 1 .192-.069h3.954a.23.23 0 0 1 .19.07.24.24 0 0 1 .063.196m-5.443-2.17a1.85 1.85 0 0 1-2.377-.244 1.97 1.97 0 0 1-.233-2.44c.207-.318.502-.565.846-.711a1.84 1.84 0 0 1 1.089-.11c.365.075.701.26.964.53.264.27.443.616.515.99a2 2 0 0 1-.108 1.118 1.9 1.9 0 0 1-.696.866Zm8.471.005a1.85 1.85 0 0 1-2.374-.252 1.96 1.96 0 0 1-.546-1.362c0-.383.11-.758.319-1.076.207-.318.502-.566.847-.711a1.84 1.84 0 0 1 1.09-.108c.366.076.702.261.965.533s.44.617.512.993a2 2 0 0 1-.113 1.118 1.9 1.9 0 0 1-.7.865" />
	</svg>
);

const table: React.CSSProperties = {
	borderCollapse: 'collapse',
	marginBottom: 16,
	fontFamily: 'GTPlanar',
	fontSize: 14,
};

const sectionTh: React.CSSProperties = {
	textAlign: 'center',
	padding: '8px 12px',
	border: '1px solid var(--ifm-color-emphasis-300)',
	fontWeight: 600,
	backgroundColor: 'var(--background)',
};

const labelTh: React.CSSProperties = {
	textAlign: 'center',
	padding: '8px 4px',
	border: '1px solid var(--ifm-color-emphasis-300)',
	fontWeight: 'normal',
	height: 120,
	verticalAlign: 'bottom',
	width: 50,
};

const verticalLabelContainer: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
};

const verticalLabel: React.CSSProperties = {
	writingMode: 'vertical-rl',
	transform: 'rotate(180deg)',
	whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
	textAlign: 'center',
	padding: '8px 12px',
	border: '1px solid var(--ifm-color-emphasis-300)',
	verticalAlign: 'middle',
};

const tdContent: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
};

const supportedCell: React.CSSProperties = {
	...td,
	width: 50,
};

const notSupportedCell: React.CSSProperties = {
	...td,
	width: 50,
	backgroundColor: 'var(--ifm-color-danger-contrast-background)',
};

const stringCell: React.CSSProperties = {
	...td,
};

type CompatValue = boolean | string;

type Props = {
	readonly chrome: CompatValue;
	readonly firefox: CompatValue;
	readonly safari: CompatValue;
	readonly nodejs: CompatValue;
	readonly bun: CompatValue;
	readonly serverlessFunctions: CompatValue;
	readonly clientSideRendering: CompatValue;
	readonly serverSideRendering: CompatValue;
	readonly player: CompatValue;
	readonly studio: CompatValue;
	readonly hideBrowsers?: boolean;
	readonly hideServers?: boolean;
};

type Item = {key: keyof Props; label: string; icon?: React.FC; link?: string};

const browsers: Item[] = [
	{key: 'chrome', label: 'Chrome', icon: ChromeIcon},
	{key: 'firefox', label: 'Firefox', icon: FirefoxIcon},
	{key: 'safari', label: 'Safari', icon: SafariIcon},
];

const servers: Item[] = [
	{key: 'nodejs', label: 'Node.js', icon: NodejsIcon},
	{key: 'bun', label: 'Bun', icon: BunIcon},
	{key: 'serverlessFunctions', label: 'Serverless Functions'},
];

const environments: Item[] = [
	{
		key: 'clientSideRendering',
		label: 'Client-side rendering',
		link: '/docs/client-side-rendering',
	},
	{
		key: 'serverSideRendering',
		label: 'Server-side rendering',
		link: '/docs/ssr',
	},
	{key: 'player', label: 'Player', link: '/docs/player'},
	{key: 'studio', label: 'Studio', link: '/docs/studio'},
];

export const CompatibilityTable: React.FC<Props> = (props) => {
	const {hideBrowsers, hideServers} = props;

	const visibleBrowsers = hideBrowsers ? [] : browsers;
	const visibleServers = hideServers ? [] : servers;
	const allItems = [...visibleBrowsers, ...visibleServers, ...environments];

	for (const {key, label} of allItems) {
		if (props[key] === undefined) {
			throw new Error(`CompatibilityTable: "${label}" (${key}) is required`);
		}
	}

	return (
		<table style={table}>
			<thead>
				<tr>
					{!hideBrowsers && (
						<th colSpan={browsers.length} style={sectionTh}>
							Browsers
						</th>
					)}
					{!hideServers && (
						<th colSpan={servers.length} style={sectionTh}>
							Servers
						</th>
					)}
					<th colSpan={environments.length} style={sectionTh}>
						Environments
					</th>
				</tr>
				<tr>
					{allItems.map(({key, label, icon: Icon, link}) => (
						<th key={key} style={labelTh}>
							<div style={verticalLabelContainer}>
								{link ? (
									<a href={link} style={verticalLabel}>
										{label}
									</a>
								) : (
									<span style={verticalLabel}>{label}</span>
								)}
								{Icon ? <Icon /> : null}
							</div>
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				<tr>
					{allItems.map(({key}) => {
						const value = props[key];
						const cellStyle =
							typeof value === 'string'
								? stringCell
								: value === true
									? supportedCell
									: notSupportedCell;
						return (
							<td key={key} style={cellStyle}>
								<div style={tdContent}>
									{value === true ? (
										<CheckIcon />
									) : typeof value === 'string' ? (
										value
									) : null}
								</div>
							</td>
						);
					})}
				</tr>
			</tbody>
		</table>
	);
};
