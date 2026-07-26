import { API_PATH } from "./apiPaths";
import axiosInstance from "./axiosInstance";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // must match the server limit

const uploadImage = async (imageFile) => {
  if (imageFile.size > MAX_FILE_SIZE) {
    throw new Error("Image must be smaller than 2 MB");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await axiosInstance.post(
    API_PATH.IMAGE.UPLOAD_IMAGE,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return response.data;
};

export default uploadImage;
