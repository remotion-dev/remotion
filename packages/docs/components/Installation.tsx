import React from 'react';
// @ts-expect-error
import CodeBlock from '@theme/CodeBlock';
// @ts-expect-error
import TabItem from '@theme/TabItem';
// @ts-expect-error
import Tabs from '@theme/Tabs';
import {VERSION} from 'remotion';

const VersionWarning: React.FC<{
	readonly packages: string;
}> = ({packages}) => {
	if (!packages.includes('remotion')) {
		return null;
	}

	return (
		<>
			This assumes you are currently using v{VERSION} of Remotion.
			<br />
			Also update <code>remotion</code> and all <code>`@remotion/*`</code>{' '}
			packages to the same version.
			<br />
			Remove all <code>^</code> character in front of the version numbers of
			it as it can lead to a version conflict.
		</>
	);
};

const LightAndDark: React.FC<{
	readonly text: string;
}> = ({text}) => {
	return (
		<CodeBlock
			className="shiki github-dark"
			language="bash"
			style={{
				backgroundColor: 'rgb(13, 17, 23)',
				color: 'rgb(201, 209, 217)',
			}}
		>
			<div className="code-container">
				<div className="line">{text}</div>
			</div>
		</CodeBlock>
	);
};

export const Installation: React.FC<{
	readonly pkg: string;
}> = ({pkg}) => {
	if (pkg === undefined) {
		throw new Error('pkg is undefined');
	}

	const pkgList = pkg.split(' ');

	const allRemotionOnly = pkgList.every(
		(p) => p.startsWith('@remotion/') || p === 'remotion',
	);
	const showRemotionCli =
		allRemotionOnly &&
		!pkgList.includes('remotion') &&
		!pkgList.includes('@remotion/cli');

	const packages = pkgList
		.map((p) => {
			if (p.startsWith('@remotion') || p === 'remotion') {
				return `${p}@${VERSION}`;
			}

			return p;
		})
		.join(' ');

	const remotionCliPackages = pkgList.join(' ');

	const tabs = [
		...(showRemotionCli
			? [{label: 'Remotion CLI', value: 'remotion-cli'}]
			: []),
		{label: 'npm', value: 'npm'},
		{label: 'bun', value: 'bun'},
		{label: 'pnpm', value: 'pnpm'},
		{label: 'yarn', value: 'yarn'},
	];

	return (
		<div>
			<Tabs
				defaultValue={showRemotionCli ? 'remotion-cli' : 'npm'}
				values={tabs}
			>
				{showRemotionCli ? (
					<TabItem value="remotion-cli">
						<LightAndDark text={`npx remotion add ${remotionCliPackages}`} />
					</TabItem>
				) : null}
				<TabItem value="npm">
					<LightAndDark text={`npm i --save-exact ${packages}`} />
					<VersionWarning packages={packages} />
				</TabItem>
				<TabItem value="pnpm">
					<LightAndDark text={`pnpm i ${packages}`} />
					<VersionWarning packages={packages} />
				</TabItem>
				<TabItem value="bun">
					<LightAndDark text={`bun i ${packages}`} />
					<VersionWarning packages={packages} />
				</TabItem>
				<TabItem value="yarn">
					<LightAndDark text={`yarn --exact add ${packages}`} />
					<VersionWarning packages={packages} />
				</TabItem>
			</Tabs>
		</div>
	);
};
