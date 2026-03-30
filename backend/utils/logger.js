const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const CURRENT_LEVEL = LOG_LEVELS[LOG_LEVEL];

const timestamp = () => {
  return new Date().toISOString();
};

const format = (level, message, data = null) => {
  let logMessage = `[${timestamp()}] [${level.toUpperCase()}] ${message}`;
  if (data) {
    logMessage += ` ${JSON.stringify(data)}`;
  }
  return logMessage;
};

const write = (level, message, data = null) => {
  const formattedMessage = format(level, message, data);

  // Console output
  if (CURRENT_LEVEL >= LOG_LEVELS[level]) {
    const colors = {
      error: '\x1b[31m',
      warn: '\x1b[33m',
      info: '\x1b[36m',
      debug: '\x1b[35m',
      reset: '\x1b[0m',
    };

    const color = colors[level] || '';
    const reset = colors.reset;

    if (process.env.NODE_ENV !== 'test') {
      console.log(`${color}${formattedMessage}${reset}`);
    }
  }

  // File output (error and warn only)
  if (level === 'error' || level === 'warn') {
    const logFile = path.join(logsDir, `${level}.log`);
    fs.appendFileSync(logFile, formattedMessage + '\n', { encoding: 'utf8' });
  }

  // All logs to combined.log
  const combinedLogFile = path.join(logsDir, 'combined.log');
  fs.appendFileSync(combinedLogFile, formattedMessage + '\n', { encoding: 'utf8' });
};

const logger = {
  error: (message, data) => write('error', message, data),
  warn: (message, data) => write('warn', message, data),
  info: (message, data) => write('info', message, data),
  debug: (message, data) => write('debug', message, data),
};

module.exports = logger;
