const ExcelJS = require("exceljs");

const CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/**
 * Streams rows out as an .xlsx attachment.
 *
 * @param {import("express").Response} res
 * @param {{ sheetName: string, fileName: string, columns: Array, rows: Array }} opts
 */
const sendWorkbook = async (res, { sheetName, fileName, columns, rows }) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns;
  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true };

  res.setHeader("Content-Type", CONTENT_TYPE);
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = { sendWorkbook };
