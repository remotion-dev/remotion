import {Button, Counter, Switch} from '@remotion/design';
import {useCallback, useState} from 'react';

const Explainer: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<div>
			<div className="text-gray-500">{children}</div>
		</div>
	);
};

export const DesignPage: React.FC = () => {
	const [count, setCount] = useState<number>(10);
	const [active, setActive] = useState<boolean>(false);

	const [submitButtonActive, setSubmitButtonActive] = useState<boolean>(true);

	const onClick = useCallback(() => {
		setSubmitButtonActive(false);
		setTimeout(() => {
			setSubmitButtonActive(true);
		}, 1000);
	}, []);

	return (
		<div className="bg-[var(--background)] relative">
			<div className="w-[800px] mx-auto pt-10 pb-10">
				<h1>@remotion/design</h1>
				<br />
				<h2 className="text-brand">&lt;Button /&gt;</h2>
				<Explainer>Button with label</Explainer>
				<Button>Button with label</Button>
				<Button disabled>Disabled</Button>
				<Button className="bg-brand text-white">Primary</Button>
				<Button onClick={onClick} disabled={!submitButtonActive}>
					Click to disable
				</Button>
				<Button className="rounded-full">Rounded</Button>
				<div className="h-8" />
				<Button className="w-full">Choose a template</Button>
				<div className="h-8" />
				<Button className="w-full rounded-full">Fully rounded</Button>
				<div className="h-8" />
				<Button className="rounded-full bg-brand w-12 h-12" />
				<div className="h-8" />
				<Counter count={count} setCount={setCount} minCount={1} step={1} />
				<div className="h-8" />
				<Switch active={active} onToggle={() => setActive((e) => !e)} />
			</div>
		</div>
	);
};
