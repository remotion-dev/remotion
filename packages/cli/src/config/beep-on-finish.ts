let beepOnFinish = false;

export const setBeepOnFinish = (should: boolean) => {
	beepOnFinish = should;
};

export const getBeepOnFinish = () => beepOnFinish;
