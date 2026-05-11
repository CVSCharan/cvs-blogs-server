import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ─── Log directory ─────────────────────────────────────────────────────────────
const LOG_DIR = path.join(process.cwd(), 'logs');

// ─── Custom console format (human-readable for dev) ────────────────────────────
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${stack || message}${metaStr}`;
  })
);

// ─── JSON format (structured for production / log aggregators) ─────────────────
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// ─── Daily Rotate: combined logs ───────────────────────────────────────────────
const combinedTransport = new winston.transports.DailyRotateFile({
  dirname: LOG_DIR,
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
  level: 'info',
});

// ─── Daily Rotate: error-only logs ────────────────────────────────────────────
const errorTransport = new winston.transports.DailyRotateFile({
  dirname: LOG_DIR,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: fileFormat,
  level: 'error',
});

// ─── Logger instance ───────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
  transports: [combinedTransport, errorTransport],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
  exitOnError: false,
});

// ─── Dev: pretty-print to console as well ──────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// ─── Morgan-compatible HTTP stream ─────────────────────────────────────────────
export const httpLogStream = {
  write: (message: string) => {
    logger.http(message.trimEnd());
  },
};

export default logger;
