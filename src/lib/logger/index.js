import winston from 'winston';

const { combine, timestamp, colorize, align, printf } = winston.format;

// Create a custom logger instance
const logger = winston.createLogger({
    format: combine(
        colorize(), // Colorize the log messages
        timestamp(), // Add a timestamp to each log
        align(), // Align the log messages
        printf(({ timestamp, level, message }) => {
            // Custom log message format
            return `[${level}]:[${timestamp}] ---> ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console() // Log to the console
    ],
});

// Prevent logger from exiting on uncaught exceptions
logger.exitOnError = false;

// Optionally write all logs to a file in production environment only
if (process.env.NODE_ENV === 'production') {
    logger.add(
        new winston.transports.Console() // Log to actions.log file
    );
}

export default logger; // Export the logger instance
