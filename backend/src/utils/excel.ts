import ExcelJS from "exceljs";
import type { Response } from "express";

const CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/**
 * Tells the client the export hit its row cap. A silent truncation looks
 * identical to a complete file, which is the worst possible outcome for an
 * export someone is about to reconcile against.
 */
export const TRUNCATED_HEADER = "X-Export-Truncated";

interface WorkbookOptions {
  sheetName: string;
  fileName: string;
  columns: Partial<ExcelJS.Column>[];
  rows: Record<string, unknown>[];
  truncated?: boolean;
}

/** Streams rows out as an .xlsx attachment. */
export const sendWorkbook = async (
  res: Response,
  { sheetName, fileName, columns, rows, truncated }: WorkbookOptions
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns as ExcelJS.Column[];
  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true };

  res.setHeader("Content-Type", CONTENT_TYPE);
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  if (truncated) {
    res.setHeader(TRUNCATED_HEADER, String(rows.length));
    // Browsers only see headers a cross-origin response opts into exposing.
    res.setHeader("Access-Control-Expose-Headers", TRUNCATED_HEADER);
  }

  await workbook.xlsx.write(res);
  res.end();
};
