import { NextFunction, Request, RequestHandler, Response } from 'express'
import { timingSafeEqual } from 'node:crypto'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '../errors/AppError'

const hasValidApiKey = (providedKey: string, configuredKey: string): boolean => {
  const providedBuffer = Buffer.from(providedKey)
  const configuredBuffer = Buffer.from(configuredKey)

  return (
    providedBuffer.length === configuredBuffer.length &&
    timingSafeEqual(providedBuffer, configuredBuffer)
  )
}

const getApiKey = (req: Request): string | undefined => {
  const headerApiKey = req.get('x-api-key')
  if (headerApiKey) {
    return headerApiKey
  }

  const authorization = req.get('authorization')
  if (authorization?.startsWith('ApiKey ')) {
    return authorization.slice('ApiKey '.length).trim()
  }

  return undefined
}

const runFallbackMiddlewares = (
  middlewares: RequestHandler[],
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let currentMiddleware = 0

  const runNext = (error?: unknown): void => {
    if (error) {
      return next(error)
    }

    const middleware = middlewares[currentMiddleware++]
    if (!middleware) {
      return next()
    }

    middleware(req, res, runNext)
  }

  runNext()
}

export const apiKeyOr = (
  apiKeyEnvironmentVariable: string,
  ...fallbackMiddlewares: RequestHandler[]
): RequestHandler => {
  return (req, res, next): void => {
    const apiKey = getApiKey(req)

    if (apiKey !== undefined) {
      const configuredApiKey = process.env[apiKeyEnvironmentVariable]
      if (!configuredApiKey) {
        return next(
          new AppError(
            `${apiKeyEnvironmentVariable} not configured`,
            StatusCodes.INTERNAL_SERVER_ERROR,
          ),
        )
      }

      if (!hasValidApiKey(apiKey, configuredApiKey)) {
        return next(new AppError('Invalid API key.', StatusCodes.UNAUTHORIZED))
      }

      return next()
    }

    runFallbackMiddlewares(fallbackMiddlewares, req, res, next)
  }
}
