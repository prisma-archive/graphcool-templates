# Schema Extension: Address lookup for Dutch addresses

This is a very simple Schema Extension function that uses the API from [https://www.postcodeapi.nu](https://www.postcodeapi.nu) to lookup an address (street and city) based on postcode and house number. It only works for Dutch addresses.

## Setup

- Register for an API key at [https://www.postcodeapi.nu](https://www.postcodeapi.nu).

- Create a new Schema Extension to obtain an address by postcode and number, using the supplied SDL (`getAddressByPostcodeAndNumber.graphql`) and function (`getAddressByPostCodeAndNumber.js`). Replace `__API_KEY__` in the function with you own API key.

- - Create a new Schema Extension to obtain an address by id, using the supplied SDL (`getAddressById.graphql`) and function (`getAddressById.js`). Replace `__API_KEY__` in the function with you own API key.

## Usage

Call a query like this:

```graphql
query {
  getAddressByPostCodeAndNumber(postcode: "7961LZ", number: "12" ) {
    street
    city
    id
  }
  getAddressById(id: "0307200000392702") {
    street
    city
    id
  }
}
```

The response should be:

```json
{
  "data": {
    "getAddressByPostCodeAndNumber": {
      "street": "Koekangerweg",
      "city": "Ruinerwold",
      "id": "1690200000010578"
    },
    "getAddressById": {
      "street": "Ronhaarstraat",
      "city": "Amersfoort",
      "id": "0307200000392702"
    }
  }
}
```

If no address is found, both result fields are null.

## Contributions

Thanks so much [@kbrandwijk](https://github.com/kbrandwijk) for contributing this example! :tada:

![](http://i.imgur.com/5RHR6Ku.png)
