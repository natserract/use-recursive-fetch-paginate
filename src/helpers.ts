import { ErrorResponse } from "./types"

export const promiseExtractor = async <T = unknown>(
  process: Promise<T> | Promise<[T | undefined, ErrorResponse]>
): Promise<[T | undefined, ErrorResponse]> => {
  if (Array.isArray(await process)) {
    return await (process as Promise<[T | undefined, ErrorResponse]>)
  }

  return await handle(process as Promise<T>)
}

export const handle = <T>(
  promise: Promise<T>
): Promise<[T | undefined, ErrorResponse]> => {
  return promise
    .then((data: T) => [data, undefined] as [T, undefined])
    .catch(
      (error: any) => [undefined, error?.response] as [undefined, ErrorResponse]
    )
}
