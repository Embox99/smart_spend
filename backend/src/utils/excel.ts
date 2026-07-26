import ExcelJS from "exceljs";
import type { Response } from "express";

const CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

interface WorkbookOptions {
  sheetName: string;
  fileName: string;
  columns: Partial<ExcelJS.Column>[];
  rows: Record<string, unknown>[];
}

/** Streams rows out as an .xlsx attachment. */
export const sendWorkbook = async (
  res: Response,
  { sheetName, fileName, columns, rows }: WorkbookOptions
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns as ExcelJS.Column[];
  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true };

  res.setHeader("Content-Type", CONTENT_TYPE);
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  await workbook.xlsx.write(res);
  res.end();
};
