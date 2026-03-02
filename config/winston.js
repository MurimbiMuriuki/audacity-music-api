const winston = require("winston");
const appRoot = "log/nodejs";
const { combine, splat, timestamp, printf } = winston.format;
const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message} `;
  if (metadata) {
    //returns 0 if empty or an integer > 0 if non-empty
    if (Object.keys(metadata).length) {
      msg += JSON.stringify(metadata);
    }
  }
  return msg;
});

const errorLog = winston.createLogger({
  level: winston.config.npm.levels,
  format: combine(splat(), timestamp(), myFormat),
  transports: [
    new winston.transports.File({
      filename: `${appRoot}/nodejs_api_error.log`,
      level: "error",
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

const infoLog = winston.createLogger({
  level: winston.config.npm.levels,
  format: combine(timestamp(), myFormat),
  transports: [
    new winston.transports.File({
      filename: `${appRoot}/nodejs_api_info.log`,
      level: "info",
    }),
  ],
  exitOnError: false,
});

const accessLog = winston.createLogger({
  level: "http",
  format: combine(splat(), timestamp(), myFormat),
  transports: [
    new winston.transports.File({
      filename: `${appRoot}/nodejs_api_access.log`,
      level: "http",
    }),
  ],
  exitOnError: false,
});

const logObj = {};
logObj.infoLog = infoLog;
logObj.errorLog = errorLog;
logObj.accessLog = accessLog;

module.exports = logObj;

module.exports.stream = {
  write: function (message, encoding) {
    logObj.accessLog.log("http", message);
  },
};
