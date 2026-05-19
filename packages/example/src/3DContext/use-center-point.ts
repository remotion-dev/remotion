import {useContext} from 'react';
import {CenterPointContext} from './transformation-context-context';

export const useCenterPoint = () => {
	return useContext(CenterPointContext);
};
