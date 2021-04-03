import React, {useEffect, useRef, useState} from 'react';
import {Internals} from 'remotion';
import RemotionRootComponent from './RemotionRootComponent';

type Props = {
	id: string;
};

const Loading: React.FC = () => <h1>Loading…</h1>;

export const RemotionPlayer: React.FC<Props> = ({id}) => {
	const rootRef = useRef<React.FC | null>(null);
	const Root = rootRef.current;
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		const Root = Internals.getRoot();
		rootRef.current = Root;
		setIsInitialized(true);
	}, []);

	return Root && isInitialized ? (
		<Internals.RemotionRoot>
			<Root />
			<div className="App">
				<RemotionRootComponent id={id} />
			</div>
		</Internals.RemotionRoot>
	) : null;
};
