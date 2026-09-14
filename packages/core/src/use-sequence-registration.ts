import {useContext, useEffect, useRef} from 'react';
import type {TSequence} from './CompositionManager.js';
import {SequenceManager} from './SequenceManager.js';

export const useSequenceRegistration = ({
	getSequence,
	id,
}: {
	getSequence: (() => TSequence) | null;
	id: string;
}) => {
	const {registerSequence, unregisterSequence, updateSequence} =
		useContext(SequenceManager);
	const getSequenceRef = useRef(getSequence);
	getSequenceRef.current = getSequence;
	const lastRegisteredGetterRef = useRef<(() => TSequence) | null>(null);
	const registrationEnabled = getSequence !== null;

	useEffect(() => {
		if (!registrationEnabled) {
			return;
		}

		const currentGetter = getSequenceRef.current;
		if (currentGetter === null) {
			throw new Error('Expected a sequence registration getter');
		}

		registerSequence(currentGetter());
		lastRegisteredGetterRef.current = currentGetter;

		return () => {
			lastRegisteredGetterRef.current = null;
			unregisterSequence(id);
		};
	}, [id, registerSequence, registrationEnabled, unregisterSequence]);

	useEffect(() => {
		if (
			getSequence === null ||
			updateSequence === null ||
			lastRegisteredGetterRef.current === getSequence
		) {
			return;
		}

		updateSequence(getSequence());
		lastRegisteredGetterRef.current = getSequence;
	}, [getSequence, updateSequence]);
};
