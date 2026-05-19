import {useContext} from 'react';
import {TransformContext} from './transformation-context-context';

export const useTransformations = () => {
	return useContext(TransformContext);
};
