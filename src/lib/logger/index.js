import winston from 'winston';

const { combine, timestamp, colorize, align, printf } = winston.format;

const logger = winston.createLogger({
    format: combine(
        colorize(),
        timestamp(),
        align(),
        printf((info) => {
            const { timestamp, level, message } = info;

            return `[${level}]:[${timestamp}] ---> ${message}`;
        })
    ),
    transports: [new winston.transports.Console({ colorize: true })],
});

// do not exit logger when uncaught exception occures
logger.exitOnError = false;

// write all the logs to the file in production environment only
// if (process.env.NODE_ENV === 'production') {
//     logger.add(
//         new winston.transports.File({ filename: __dirname + '/actions.log' })
//     );
// }

module.exports = logger;
