# google-geocoding

Fetch missing geo-data for an address with Graphcool Functions and the help of [the Google Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro) ⚡️

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema google-geocoding.graphql
```

## Setup the Google Geocoding

* Create a new function as part of the **`TRANSFORM_ARGUMENT` step of the Request Pipeline** with **the trigger `Location is created`**. Paste the code from `google-geocoding.js`.

* To use the Google Maps Geocoding API, [**you need to generate an API key**](https://developers.google.com/maps/documentation/geocoding/get-api-key) and replace the `__GOOGLE_API_KEY__` in the function code.

Now this function will run whenever a location is created. It will ping Google with an address and get back the missing location information.

The response will then be merged with the location information that was entered in the mutation before the record will be saved.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to create a new location and query its geolocation details:

```graphql
mutation testGoogleGeocoding {
  createLocation(
    street: "221B Baker St",
    country: "London"
  ) {
    id
    street
    area
    city
    country
    lat
    lng
  }
}
```

The response should be the full address and coordinates of Sherlock Holmes' home. 🤓

![](http://i.imgur.com/5RHR6Ku.png)
