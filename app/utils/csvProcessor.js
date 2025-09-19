const fs = require("fs");
const csv = require("csv-parser");

const validateCSVStructure = (filePath) => {
  return new Promise((resolve, reject) => {
    const requiredColumns = ['name', 'role', 'company', 'industry', 'location'];
    let headerRow = null;
    let rowCount = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headers) => {
        headerRow = headers;
      })
      .on('data', (row) => {
        rowCount++;
        // Stop after first few rows for validation
        if (rowCount > 5) {
          return;
        }
      })
      .on('end', () => {
        if (!headerRow) {
          reject(new Error('CSV file appears to be empty or invalid'));
          return;
        }

        const missingColumns = requiredColumns.filter(col => 
          !headerRow.some(header => header.toLowerCase().trim() === col.toLowerCase())
        );

        if (missingColumns.length > 0) {
          reject(new Error(`Missing required columns: ${missingColumns.join(', ')}. Found columns: ${headerRow.join(', ')}`));
          return;
        }

        resolve({
          valid: true,
          columns: headerRow,
          estimatedRows: rowCount
        });
      })
      .on('error', (error) => {
        reject(new Error(`CSV validation error: ${error.message}`));
      });
  });
};

async function processCSVFile(filePath) {
  const leads = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => leads.push(row))
      .on("end", () => resolve(leads))
      .on("error", reject);
  });
}

function cleanupTempFile(filePath) {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function generateCSVFromLeads(leads) {
  const header = Object.keys(leads[0]).join(",");
  const rows = leads.map((l) => Object.values(l).join(","));
  return [header, ...rows].join("\n");
}

module.exports = { validateCSVStructure, processCSVFile, cleanupTempFile, generateCSVFromLeads };
