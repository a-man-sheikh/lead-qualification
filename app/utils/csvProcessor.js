const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

/**
 * CSV Processor - Handles CSV file parsing and validation
 */

/**
 * Process uploaded CSV file and extract lead data
 */
const processCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const leads = [];
    const requiredColumns = ['name', 'role', 'company', 'industry', 'location'];
    const optionalColumns = ['linkedin_bio'];
    const allColumns = [...requiredColumns, ...optionalColumns];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Validate required columns
        const missingColumns = requiredColumns.filter(col => !row[col] || row[col].trim() === '');
        
        if (missingColumns.length > 0) {
          reject(new Error(`Missing required columns: ${missingColumns.join(', ')}`));
          return;
        }

        // Create lead object with only expected columns
        const lead = {};
        allColumns.forEach(col => {
          if (row[col]) {
            lead[col] = row[col].trim();
          }
        });

        leads.push(lead);
      })
      .on('end', () => {
        if (leads.length === 0) {
          reject(new Error('No valid leads found in CSV file'));
          return;
        }
        resolve(leads);
      })
      .on('error', (error) => {
        reject(new Error(`CSV processing error: ${error.message}`));
      });
  });
};

/**
 * Validate CSV file structure before processing
 */
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

/**
 * Generate CSV content from lead results
 */
const generateCSVFromLeads = (leads) => {
  const headers = [
    'name', 'role', 'company', 'industry', 'location', 
    'linkedin_bio', 'intent', 'score', 'reasoning'
  ];

  const csvRows = [headers.join(',')];

  leads.forEach(lead => {
    const row = headers.map(header => {
      let value = lead[header] || '';
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

/**
 * Clean up temporary files
 */
const cleanupTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
};

module.exports = {
  processCSVFile,
  validateCSVStructure,
  generateCSVFromLeads,
  cleanupTempFile
};
