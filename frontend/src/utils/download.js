import axiosInstance from "./axiosInstance";

/**
 * Fetches a file through the authenticated axios instance and saves it.
 * A plain <a href> cannot be used because the endpoint needs a bearer token.
 */
const downloadFile = async (url, fileName) => {
  const res = await axiosInstance.get(url, { responseType: "blob" });

  const objectUrl = window.URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
};

export default downloadFile;
