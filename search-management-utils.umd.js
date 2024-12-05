(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  const SearchManagementUtils = (() => {
      // Function to parse date strings into Date objects
      function parseDate(dateStr, format = 'DD-MM-YYYY') {
        if (!moment) {
          throw new Error('Moment.js is required for date parsing.');
        }
        const date = moment(dateStr, format, true);
        return date.isValid() ? date.toDate() : null;
      }
    
      // Function to validate that end date is after start date
      function validateEndDateAfterStartDate(startDateStr, endDateStr, format = 'DD-MM-YYYY') {
        const startDate = parseDate(startDateStr, format);
        const endDate = parseDate(endDateStr, format);
    
        if (!startDate || !endDate) {
          return false;
        }
    
        return endDate > startDate;
      }
    
      // Function to parse CSV content into an array of objects
      function parseCSVContent(csvContent) {
        const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(header => header.trim());
    
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(value => value.trim());
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });
    
        return data;
      }
    
      // Function to convert data to CSV format
      function convertToCSV(objArray) {
        const array = Array.isArray(objArray) ? objArray : JSON.parse(objArray);
    
        if (array.length === 0) {
          return '';
        }
    
        const keys = Object.keys(array[0]);
    
        const csv = [
          keys.join(','), // header row
          ...array.map(row =>
            keys
              .map(key => {
                const val = row[key] === null || row[key] === undefined ? '' : row[key];
                // Escape double quotes
                const escapedVal = val.toString().replace(/"/g, '""');
                // Wrap value in double quotes
                return `"${escapedVal}"`;
              })
              .join(',')
          ),
        ].join('\r\n');
    
        return csv;
      }
    
      // Function to parse boolean values from strings
      function parseBoolean(value) {
        if (typeof value === 'boolean') {
          return value;
        }
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (['yes', 'true', '1'].includes(lower)) return true;
          if (['no', 'false', '0'].includes(lower)) return false;
        }
        return null; // Invalid boolean
      }
    
      // Function to validate bulk data (generic)
      function validateBulkData(data, validationRules) {
        const errors = [];
        const validData = [];
    
        data.forEach((record, index) => {
          const rowNumber = index + 2; // Considering header is at row 1
          const errorMessages = [];
    
          // Iterate over validation rules
          validationRules.forEach(rule => {
            const { field, required, validator, errorMessage, transform } = rule;
    
            let value = record[field];
    
            if (required && (value === undefined || value === null || value.toString().trim() === '')) {
              errorMessages.push(`${field} is required.`);
            } else if (validator && !validator(value)) {
              errorMessages.push(errorMessage || `${field} is invalid.`);
            } else if (transform) {
              value = transform(value);
            }
    
            record[field] = value;
          });
    
          if (errorMessages.length > 0) {
            errors.push({
              row: rowNumber,
              errors: errorMessages,
            });
          } else {
            validData.push(record);
          }
        });
    
        return { errors, validData };
      }
    
      // Public API
      return {
        parseDate,
        validateEndDateAfterStartDate,
        parseCSVContent,
        convertToCSV,
        parseBoolean,
        validateBulkData,
        };
    })();
    
    // UMD Wrapper
    (function (root, factory) {
      if (typeof define === 'function' && define.amd) {
        define('SearchManagementUtils', [], factory);
      } else if (typeof exports === 'object') {
        module.exports = factory();
      } else {
        root.SearchManagementUtils = factory();
      }
    })(typeof self !== 'undefined' ? self : undefined, function () {
      return SearchManagementUtils;
    });

}));
