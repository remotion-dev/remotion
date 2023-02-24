import { exec } from "child_process";

export const validateProjectID = (projectID: unknown) => {
  if (typeof projectID === "undefined") {
    throw new TypeError(
      `The 'project-id' argument must be provided, but is missing.`
    );
  }

  if (typeof projectID !== "string") {
    throw new TypeError(
      `The 'project-id' argument must be a string, but is ${JSON.stringify(
        projectID
      )}`
    );
  }

  // TODO: Complete this with the node API instead of gcloud
  exec(`gcloud projects describe ${projectID}`, (error) => {
    if (error !== null) {
      throw new Error(
        `project-id ${projectID} not found in GCP. It either does not exist, or you do not have access to it.`
      );
    } else {
    }
  });

  if (!projectID.match(/^[a-zA-Z][a-zA-Z0-9-]{0,48}[a-zA-Z0-9]$/g)) {
    throw new Error(
      "The `project-id` must match the RegExp `/^[a-zA-Z][a-zA-Z0-9-]{0,48}[a-zA-Z0-9]$/g`. This means it may only start with a letter, end with a letter or number, and contain up to 49 lowercase letters, numbers or hyphens. You passed: " +
        projectID +
        ". Check for invalid characters."
    );
  }
};
