import React, {StrictMode, useCallback, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Button3D} from './components/3DEngine/ButtonDemo';
import {Switch} from './components/3DEngine/Switch';
import {Counter} from './components/homepage/Counter';
import './index.css';

const Comp: React.FC = () => {
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
		<>
			<div className="flex flex-row gap-4">
				<Button3D>Button with label</Button3D>
				<Button3D onClick={onClick} disabled={!submitButtonActive}>
					Button with label
				</Button3D>
			</div>
			<div className="h-8" />
			<Button3D className="w-full">Choose a template</Button3D>
			<div className="h-8" />
			<Button3D className="w-full rounded-full">Fully rounded</Button3D>
			<div className="h-8" />
			<Button3D className="rounded-full bg-brand w-12 h-12" />
			<div className="h-8" />
			<Counter count={count} setCount={setCount} minCount={1} step={1} />
			<div className="h-8" />
			<Switch active={active} onToggle={() => setActive((e) => !e)} />
		</>
	);
};

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<div data-theme="light">
			<div className="flex absolute h-full w-full bg-[#F9FAFC] pt-[100px]">
				<div className="w-[800px] mx-auto">
					<Comp />
				</div>
			</div>
		</div>
	</StrictMode>,
);
