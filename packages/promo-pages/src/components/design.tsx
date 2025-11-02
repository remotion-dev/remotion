import {Button, Card, Counter, Switch} from '@remotion/design';
import {useCallback, useState} from 'react';

const Explainer: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<div>
			<div className="text-gray-500 font-brand text-sm mb-2">{children}</div>
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
				<Button>Click me</Button>
				<br />
				<Explainer>Disabled</Explainer>
				<Button disabled>{"Don't"} click me</Button>
				<br />
				<Explainer>Primary</Explainer>
				<Button className="bg-brand text-white">Primary</Button>
				<br />
				<Explainer>Click to disable</Explainer>
				<Button onClick={onClick} disabled={!submitButtonActive}>
					Submit
				</Button>
				<br />
				<Explainer>Rounded</Explainer>
				<Button className="rounded-full">Rounded</Button>
				<br />
				<Explainer>Full width</Explainer>
				<Button className="w-full">Choose a template</Button>
				<br />
				<Explainer>Full width rounded</Explainer>
				<Button className="w-full rounded-full">Fully rounded</Button>
				<div className="h-8" />
				<Explainer>Circular</Explainer>
				<Button className="rounded-full bg-brand w-12 h-12" />
				<div className="h-8" />
				<h2 className="text-brand">&lt;Counter /&gt;</h2>
				<Counter count={count} setCount={setCount} minCount={1} step={1} />
				<br /> <h2 className="text-brand">&lt;Switch /&gt;</h2>
				<Switch active={active} onToggle={() => setActive((e) => !e)} />
				<br /> <h2 className="text-brand">&lt;Card /&gt;</h2>
				<Card className="px-4 py-4">
					<h3 className="text-black">Card</h3>
					<div className="text-gray-500">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
						eiusmod tempor incididunt ut labore et dolore magna aliqua.
					</div>
				</Card>
			</div>
		</div>
	);
};
