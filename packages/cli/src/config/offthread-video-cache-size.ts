let offthreadVideoCacheSize: number | null = null;

export const getOffthreadVideoCacheSize = () => {
	return offthreadVideoCacheSize;
};

export const setOffthreadVideoCacheSize = (size: number | null) => {
	offthreadVideoCacheSize = size;
};
