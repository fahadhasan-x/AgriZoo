const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Console logging
    new winston.transports.Console(),
    // Error log file
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    }),
    // Combined log file
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log')
    })
  ]
});

module.exports = logger; 