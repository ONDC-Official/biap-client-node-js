import pino from 'pino'
import pinoHttp from 'pino-http'

export const logger = pino({
  level:  'info',
})

export const expressLogger = pinoHttp({
  logger,
})
