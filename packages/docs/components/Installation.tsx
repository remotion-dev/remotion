import React from 'react';
// @ts-expect-error
import CodeBlock from '@theme/CodeBlock';
// @ts-expect-error
import TabItem from '@theme/TabItem';
// @ts-expect-error
import Tabs from '@theme/Tabs';
import {VERSION} from 'remotion';

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

	const packages = pkg
		.split(' ')
		.map((p) => {
			if (p.startsWith('@remotion') || p === 'remotion') {
				return `${p}@${VERSION}`;
			}

			return p;
		})
		.join(' ');

	const isRemotionPackage = packages.includes('remotion');

	return (
		<div>
			<Tabs
				defaultValue="npm"
				values={[
					{label: 'npm', value: 'npm'},
					{label: 'yarn', value: 'yarn'},
					{label: 'pnpm', value: 'pnpm'},
					{label: 'bun', value: 'bun'},
				]}
			>
				<TabItem value="npm">
					<LightAndDark text={`npm i --save-exact ${packages}`} />
				</TabItem>
				<TabItem value="pnpm">
					<LightAndDark text={`pnpm i ${packages}`} />
				</TabItem>
				<TabItem value="bun">
					<LightAndDark text={`bun i ${packages}`} />
				</TabItem>
				<TabItem value="yarn">
					<LightAndDark text={`yarn --exact add ${packages}`} />
				</TabItem>
			</Tabs>
			{isRemotionPackage ? (
				<>
					This assumes you are currently using v{VERSION} of Remotion.
					<br />
					Also update <code>remotion</code> and all <code>`@remotion/*`</code>{' '}
					packages to the same version.
					<br />
					Remove all <code>^</code> character in front of the version numbers of
					it as it can lead to a version conflict.
				</>
			) : null}
		</div>
	);
};
