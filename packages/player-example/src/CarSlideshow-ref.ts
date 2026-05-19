import {createRef, useCallback, useImperativeHandle, useState} from 'react';

const playerExampleComp = createRef<{
	triggerError: () => void;
}>();

