# use-recursive-fetch-paginate

Data from APIs are commonly paginated. We also have often use cases when we have to fetch all the records from an API. For example, when we want to make data visualizations. Therefore, we have to iteratively fetch all the pages which contain the data we need.

## Usage

```tsx
 const [results, fetchData] = useRecursiveFetchPaginate<
    ProductsResponse
  >(getAllProductsByParam, null, {
    debug: true,
    until({ total }) {
      return total >= 1000
    },
    callback(products) {
      console.log('callback data', products)
    },
    finally(products) {
      console.log('results', products)
    },
  })
  
 // Call
 useEffect(fetchData, [fetchData])
```

### Requests
The structure of the call stack is evident when looking at the network requests after running the function.

![Screen Shot 2023-02-02 at 22 17 36](https://user-images.githubusercontent.com/31182611/216349292-573b8ca5-710e-4561-9686-efd2c421b408.png)

## Installation

Download the latest [use-recursive-fetch-paginate](https://github.com/natserract/use-recursive-fetch-paginate) from GitHub, or install with npm:

```sh
npm install use-recursive-fetch-paginate
```

## License

This program is free software; it is distributed under an [MIT License](https://github.com/natserract/use-recursive-fetch-paginate/blob/main/LICENSE).
