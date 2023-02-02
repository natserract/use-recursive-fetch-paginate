import axios from 'axios'
import React, { useEffect } from 'react'

import { useAppDispatch, useAppSelector, RootState } from '~/store/store'
import { useRecursiveFetchPaginate } from '~/hooks/useRecursiveFetch'

type GetAllResponse = {
  products: any[]
}

const BASE_API_URL = `http://jsonplaceholder.typicode.com`
const GET_PHOTOS_URL = `${BASE_API_URL}/photos`

const Example = () => {
  const dispatch = useAppDispatch()

  const [results, fetchData] = useRecursiveFetchPaginate<
    GetAllResponse['products'][number]
  >(getAllProductsByParam, null, {
    // offset: 5,
    // limit: 5,
    // debug: true,
    until({ total }) {
      return total >= 1000
    },
    callback(products) {
      // Dispatch action
      // dispatch({...})
      console.log('callback Data', products)
    },
    finally(data) {
      console.log('Results', data)
    },
  })

  useEffect(fetchData, [fetchData])

  return <React.Fragment />
}

const getAllProductsByParam = async (params: {
  limit: string | number
  offset: string | number
}) => {
  return axios.get(GET_PHOTOS_URL, {
    params: {
      _limit: params.limit,
      _start: params.offset,
    },
  })
}

export default Example
