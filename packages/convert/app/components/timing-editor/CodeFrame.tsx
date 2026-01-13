import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {codeToHtml} from 'shikiji';
import {DEFAULT_DAMPING, DEFAULT_MASS, DEFAULT_STIFFNESS} from './defaults';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '~/components/ui/tabs';
import {Button} from '~/components/ui/button';
import {Spacing} from './Spacing';
import {copyText} from './copy-text';
import toast, {Toaster} from 'react-hot-toast';

type Props = {
	readonly damping: number;
	readonly mass: number;
	readonly stiffness: number;
	readonly overshotClamping: boolean;
	readonly reverse: boolean;
	readonly durationInFrames: number | null;
	readonly delay: number;
};

const CodeFrame: React.FC<
	Props & {
		readonly platform: 'remotion' | 'reanimated';
	}
> = ({
	damping,
	mass,
	stiffness,
	overshotClamping,
	reverse,
	platform,
	durationInFrames,
	delay,
}) => {
	const [h, setH] = useState<string | null>(null);

	const code = useMemo(() => {
		const isDefaultDamping = DEFAULT_DAMPING === damping;
		const isDefaultMass = DEFAULT_MASS === mass;
		const isDefaultStiffness = DEFAULT_STIFFNESS === stiffness;

		const isAllDefault =
			isDefaultDamping && isDefaultMass && isDefaultStiffness;

		const lines = [
			'const spr = spring({',
			platform === 'remotion' ? '  frame,' : null,
			platform === 'remotion' ? '  fps,' : null,
			platform === 'reanimated' ? '  toValue: 1,' : null,
			isAllDefault ? null : '  config: {',
			isDefaultDamping ? null : `    damping: ${damping},`,
			isDefaultMass ? null : `    mass: ${mass},`,
			isDefaultStiffness ? null : `    stiffness: ${stiffness},`,
			isAllDefault ? null : '  },',
			durationInFrames === null || platform === 'reanimated'
				? null
				: `  durationInFrames: ${durationInFrames},`,
			delay === 0 || platform === 'reanimated' ? null : `  delay: ${delay},`,
			overshotClamping ? '  overshootClamping: true,' : null,
			reverse ? '  reverse: true,' : null,
			'});',
		]
			.filter(Boolean)
			.join('\n');
		return lines;
	}, [
		damping,
		mass,
		stiffness,
		platform,
		durationInFrames,
		delay,
		overshotClamping,
		reverse,
	]);

	useEffect(() => {
		codeToHtml(code, {
			lang: 'javascript',
			theme: 'github-dark',
		}).then((html) => {
			setH(html);
		});
	}, [code]);

	const onClick = useCallback(async () => {
		try {
			await copyText(code);
			toast.success('Copied to clipboard!');
		} catch (err) {
			toast.error((err as Error).message);
		}
	}, [code]);

	return (
		<div>
			<div
				style={{
					backgroundColor: '#24292E',
					paddingTop: 14,
					paddingLeft: 20,
					height: 300,
					borderRadius: 8,
				}}
			>
				{h ? (
					<div
						dangerouslySetInnerHTML={{__html: h}}
					/>
				) : null}
			</div>
			<Spacing block y={1} />
			<Button style={{width: '100%'}} onClick={onClick}>
				Copy
			</Button>
			<Toaster />
		</div>
	);
};

export function CodeFrameTabs(props: Props) {
	return (
		<Tabs defaultValue="remotion">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="remotion">Remotion</TabsTrigger>
				<TabsTrigger value="reanimated">Reanimated</TabsTrigger>
			</TabsList>
			<TabsContent value="remotion">
				<CodeFrame platform="remotion" {...props} />
			</TabsContent>
			<TabsContent value="reanimated">
				<CodeFrame platform="reanimated" {...props} />
			</TabsContent>
		</Tabs>
	);
}
