import {useContext, useEffect, useMemo, useRef} from 'react';
import type {TSequence} from './CompositionManager.js';
import {
	DisableSequenceRegistrationContext,
	SequenceCommitRegistrationContext,
	SequenceManagerActionsContext,
} from './SequenceManager.js';

export const useSequenceRegistration = ({
	getSequence,
	id,
	registerOnCommit,
}: {
	getSequence: (() => TSequence) | null;
	id: string;
	registerOnCommit: boolean | null;
}) => {
	const {registerSequence, unregisterSequence, updateSequence} = useContext(
		SequenceManagerActionsContext,
	);
	const registrationDisabled = useContext(DisableSequenceRegistrationContext);
	const commitRegistrationEnabled =
		useContext(SequenceCommitRegistrationContext) && registerOnCommit === true;
	const getSequenceRef = useRef(getSequence);
	getSequenceRef.current = getSequence;
	const lastRegisteredGetterRef = useRef<(() => TSequence) | null>(null);
	const registrationEnabled =
		getSequence !== null && !registrationDisabled && !commitRegistrationEnabled;
	const registration = useMemo(
		() =>
			commitRegistrationEnabled && !registrationDisabled && getSequence !== null
				? getSequence()
				: null,
		[commitRegistrationEnabled, getSequence, registrationDisabled],
	);

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
			commitRegistrationEnabled ||
			registrationDisabled ||
			getSequence === null ||
			updateSequence === null ||
			lastRegisteredGetterRef.current === getSequence
		) {
			return;
		}

		updateSequence(getSequence());
		lastRegisteredGetterRef.current = getSequence;
	}, [
		commitRegistrationEnabled,
		getSequence,
		registrationDisabled,
		updateSequence,
	]);

	return registration;
};
