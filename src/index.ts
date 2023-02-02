import { useCallback, useEffect, useRef, useState } from 'react'
import { promiseExtractor } from './helpers'

import { ErrorResponse, Void, ApiResponse } from './types'

type PromiseFnArg = {
  offset: string | number | any
  limit: string | number | any
  [k: string]: any
}

type PromiseFn<T> = Void<
  (
    ...args: PromiseFnArg[]
  ) => Promise<T> | Promise<[T | undefined, ErrorResponse]>
>

type UseRecursiveFetchParams<R = any> = {
  offset?: string | number
  limit?: string | number
  callback?: Void<(data: R[]) => any> // callback function
  finally?: Void<(data: R[]) => any> // lazy function, called if all fetch process done
  debug?: boolean // Warning: A browser can crash because of provoked by console.log() memory leaks
  until?: (
    param: Pick<PromiseFnArg, 'offset' | 'limit'> & {
      total: number
    }
  ) => boolean // Stop the process until the specified time
}

type UseRecursiveFetchReturn<A> = [A[], Void<() => void>]

export const useRecursiveFetchPaginate = <R = unknown, T = unknown>(
  promiseFn: PromiseFn<T>,
  // `promiseFn` required limit, offset parameter,
  // this will be used to split the data into small pieces
  // --
  accessor: string | null, // Accessor for response
  params?: UseRecursiveFetchParams<R>
): UseRecursiveFetchReturn<R> => {
  const pagination = useRef({
    page: 0,
    offset: params?.offset || 0,
    limit: params?.limit || 50,
  })
  const chunksLen = useRef(0)

  const stopLoop = useRef<boolean>(false)

  // Used to prevent state update if the component is unmounted
  const cancelRequest = useRef<boolean>(false)

  // Store data in chunks
  const [chunks, setChunks] = useState<R[]>([])

  const fetchData = useCallback(() => {
    const recurseFetchCall = async () => {
      try {
        if (params?.debug) {
          // eslint-disable-next-line no-console
          console.debug(
            '(Debug useRecursiveFetchPaginate) State: ',
            stopLoop.current,
            pagination.current
          )
        }

        // Base case
        if (!cancelRequest.current && !stopLoop.current) {
          pagination.current.page++

          const [res, resErr] = await promiseExtractor(
            promiseFn({
              limit: pagination.current.limit,
              offset: pagination.current.offset,
            })
          )

          // Abort
          if (resErr) {
            cancelRequest.current = true
          }

          let results = [] as R[]

          // Access response data
          if (accessor) {
            results = (res as ApiResponse)?.data[accessor as string] as R[] // if accessor undefined, process will stopped
          } else {
            results = (res as ApiResponse)?.data as R[]
          }

          // Passing until prop
          const until =
            params?.until &&
            params?.until({
              limit: pagination.current.limit,
              offset: pagination.current.offset,
              total: chunksLen.current,
            })

          // Stop calling itself
          if (until || results.length < pagination.current.limit) {
            stopLoop.current = true
          }

          if (results.length) {
            params?.callback && params.callback(results)
            setChunks((chunk) => {
              const next = [...chunk].concat(results)

              return next
            })

            pagination.current.offset =
              Number(pagination.current.page) * Number(pagination.current.limit)

            void recurseFetchCall()
          }
        }
      } catch (error) {
        cancelRequest.current = true
      }
    }

    void recurseFetchCall()
    // avoid multiple re-rendering (not need callback dependencies)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.debug, promiseFn, accessor])

  useEffect(() => {
    chunksLen.current = chunks.length

    if (stopLoop.current && chunks.length) {
      params?.finally && params.finally(chunks)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chunks.length])

  useEffect(() => {
    // Use the cleanup function for avoiding a possibly...
    // ...state update after the component was unmounted
    return () => {
      cancelRequest.current = true
    }
  }, [])

  return [stopLoop.current && chunks.length ? chunks : [], fetchData]
}
