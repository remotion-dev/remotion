import {algora, type AlgoraOutput} from '@algora/sdk';
import {useColorMode} from '@docusaurus/theme-common';
import clsx from 'clsx';
import React, {useEffect, useState} from 'react';

import './bounties.css';

const org = 'remotion';
const limit = 100;

type RemoteData<T> =
	| {_tag: 'loading'}
	| {_tag: 'failure'; error: Error}
	| {_tag: 'success'; data: T};

type Bounty = AlgoraOutput['bounty']['list']['items'][number];

const BountyCard = (props: {readonly bounty: Bounty}) => (
	<a
		href={props.bounty.task.url}
		target="_blank"
		rel="noopener"
		className="bounty-card"
	>
		<div className="bounty-content">
			<div className="bounty-reward">{props.bounty.reward_formatted}</div>
			<div className="bounty-issue">
				{props.bounty.task.repo_name}#{props.bounty.task.number}
			</div>
			<div className="bounty-title">{props.bounty.task.title}</div>
		</div>
	</a>
);

const BountyCardSkeleton = () => (
	<div className="bounty-skeleton">
		<div className="bounty-content">
			<div className="bounty-reward" />
			<div className="bounty-issue" />
			<div className="bounty-title" />
		</div>
	</div>
);

export const Bounties = () => {
	const {colorMode} = useColorMode();

	const [bounties, setBounties] = useState<RemoteData<Bounty[]>>({
		_tag: 'loading',
	});

	useEffect(() => {
		const ac = new AbortController();

		algora.bounty.list
			.query({org, limit, status: 'active'}, {signal: ac.signal})
			.then(({items: data}) => setBounties({_tag: 'success', data}))
			.catch((error) => setBounties({_tag: 'failure', error}));

		return () => ac.abort();
	}, []);

	return (
		<div className={clsx('bounty-grid', colorMode === 'dark' && 'dark')}>
			{bounties._tag === 'success' &&
				bounties.data.map((bounty) => (
					<div key={bounty.id}>
						<BountyCard bounty={bounty} />
					</div>
				))}
			{bounties._tag === 'loading' &&
				[...Array(6).keys()].map((i) => (
					<div key={i}>
						<BountyCardSkeleton />
					</div>
				))}
		</div>
	);
};
