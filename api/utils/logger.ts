export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
const currentLevelValue = LOG_LEVELS[currentLevel];

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= currentLevelValue;
}

function formatTime(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string, data?: any): string {
  const timestamp = formatTime();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (data) {
    return `${prefix} ${message} ${JSON.stringify(data)}`;
  }
  return `${prefix} ${message}`;
}

export const logger = {
  debug: (message: string, data?: any) => {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', message, data));
    }
  },
  info: (message: string, data?: any) => {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message, data));
    }
  },
  warn: (message: string, data?: any) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, data));
    }
  },
  error: (message: string, data?: any) => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, data));
    }
  },
};
