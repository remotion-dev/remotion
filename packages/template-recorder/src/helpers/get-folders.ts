const KEY = "remotionrecorder.selectedFolder";

const params = new URLSearchParams(window.location.search);
const folderFromUrl = params.get("folder");

export const loadFolderFromUrl = () => {
  if (!folderFromUrl) {
    return null;
  }

  const newUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, "", newUrl);
  return folderFromUrl;
};

export const loadSelectedFolder = () => {
  if (!window.remotionServerEnabled) {
    return null;
  }

  const projectFromLS = window.localStorage.getItem(KEY);
  if (projectFromLS === "") {
    return null;
  }

  return projectFromLS;
};

export const persistSelectedFolder = (folder: string) => {
  window.localStorage.setItem(KEY, folder);
};
