type ImageFormat = "png" | "jpeg";

export const getImageType = (imageParam: string): ImageFormat => {
  if (imageParam === "png") {
    return "png";
  }
  if (imageParam === "jpeg" || imageParam === "jpg") {
    return "jpeg";
  }

  throw new TypeError(
    "Invalid image format - your URL path should end in .png or .jpeg.",
  );
};

export const getMimeType = (imageFormat: ImageFormat) => {
  if (imageFormat === "jpeg") {
    return "image/jpeg";
  }
  if (imageFormat === "png") {
    return "image/png";
  }

  throw new TypeError("Unexpected image format");
};
