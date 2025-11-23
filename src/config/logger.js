import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_NAME = process.env.APP_NAME || 'TravelTogether_API';
const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] ${message}`;
});

const logDir = path.join(__dirname, '../../logs');

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, `${APP_NAME}_total_%DATE%.log`),
      datePattern: 'YYYYMMDD',
      maxFiles: '14d',
      level: 'info',
      zippedArchive: false,
      auditFile: path.join(logDir, `${APP_NAME}-audit.json`)
    }),
    new DailyRotateFile({
      filename: path.join(logDir, `${APP_NAME}_error_%DATE%.log`),
      datePattern: 'YYYYMMDD',
      maxFiles: '14d',
      level: 'error',
      zippedArchive: false,
      auditFile: path.join(logDir, `${APP_NAME}-audit.json`)
    }),
    new transports.Console({
      format: combine(colorize(), logFormat)
    })
  ]
});

export default logger;