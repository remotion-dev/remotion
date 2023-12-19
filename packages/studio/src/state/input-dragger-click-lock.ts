let clickLock = false;

export const getClickLock = () => clickLock;
export const setClickLock = (lock: boolean) => {
	clickLock = lock;
};
