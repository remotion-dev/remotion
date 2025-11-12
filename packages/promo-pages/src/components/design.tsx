import {
	Button,
	Card,
	Counter,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Switch,
} from '@remotion/design';
import {useCallback, useState} from 'react';
import {ManageTeamMembers} from './ManageTeamMembers';

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
	const [submitButtonPrimaryActive, setSubmitButtonPrimaryActive] =
		useState<boolean>(true);

	const onClick = useCallback(() => {
		setSubmitButtonActive(false);
		setTimeout(() => {
			setSubmitButtonActive(true);
		}, 1000);
	}, []);

	const onClickPrimary = useCallback(() => {
		setSubmitButtonPrimaryActive(false);
		setTimeout(() => {
			setSubmitButtonPrimaryActive(true);
		}, 1000);
	}, []);

	return (
		<div className="bg-[var(--background)] relative">
			<div className="max-w-[800px] mx-auto pt-10 pb-10 px-4">
				<h1>@remotion/design</h1>
				<a
					href="https://github.com/remotion-dev/remotion/blob/main/packages/promo-pages/src/components/design.tsx"
					className="font-brand text-brand"
					target="_blank"
				>
					View source
				</a>
				<br />
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
				<Button onClick={onClick} loading={!submitButtonActive}>
					Submit
				</Button>
				<br />
				<Explainer>Click to disable (primary)</Explainer>
				<Button
					onClick={onClickPrimary}
					className="bg-brand text-white"
					loading={!submitButtonPrimaryActive}
				>
					Submit
				</Button>
				<br />
				<Explainer>Loading state</Explainer>
				<Button onClick={onClick} loading>
					Loading
				</Button>
				<br />
				<Explainer>Loading state (primary)</Explainer>
				<Button onClick={onClick} className="bg-brand text-white" loading>
					Loading
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
					<h3 className="text-text">Card</h3>
					<div className="text-gray-500">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
						eiusmod tempor incididunt ut labore et dolore magna aliqua.
					</div>
				</Card>
				<br />
				<h2 className="text-brand">&lt;Select /&gt;</h2>
				<Select defaultValue="option1">
					<SelectTrigger style={{width: '200px'}}>
						<SelectValue placeholder="Select an option" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="option1">Option 1</SelectItem>
						<SelectItem value="option2">Option 2</SelectItem>
						<SelectItem value="option3">Option 3</SelectItem>
					</SelectContent>
				</Select>
				<br />
				<h2 className="text-brand">&lt;Input /&gt;</h2>
				<Input placeholder="Enter your email" />
				<br />
				<br />
				<br />
				<h1>Example form set</h1>
				<br />
				<h2>Change email</h2>
				<p className="font-brand">
					A email will be sent to the new email address. You will need to click
					on the link in the email to confirm the change.
				</p>
				<Input placeholder="Enter your email" className="w-full block" />
				<div className="h-2" />
				<div className="flex flex-row justify-end">
					<Button className="bg-brand text-white">Change</Button>
				</div>
				<br />
				<br />
				<ManageTeamMembers />
			</div>
		</div>
	);
};
