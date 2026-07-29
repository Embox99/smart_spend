import axiosInstance from "./axiosInstance";

/** Mirrors the backend's header; a value means the export hit its row cap. */
const TRUNCATED_HEADER = "x-export-truncated";

export interface DownloadResult {
  /** Rows written when the export was capped, otherwise null. */
  truncatedAt: number | null;
}

/**
 * Fetches a file through the authenticated axios instance and saves it.
 * A plain <a href> cannot be used because the endpoint needs a session.
 */
const downloadFile = async (
  url: string,
  fileName: string
): Promise<DownloadResult> => {
  const res = await axiosInstance.get<Blob>(url, { responseType: "blob" });

  const objectUrl = window.URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);

  const truncated = res.headers[TRUNCATED_HEADER];
  return { truncatedAt: truncated ? Number(truncated) : null };
};

export default downloadFile;
