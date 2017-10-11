# Geospatial Resolver  🌎 📡

A geospatial query resolver for Graphcool.

## About

Uses the popular [geolib](https://github.com/manuelbieh/geolib) to sort a collection of places by distance.


## Example Usage

```graphql
query {
  # replace __LNG__ and __LNG__
  placesByDistance(lat: __LAT__, lng: __LNG__) {
    id
    name
    geoloc
    distance
  }
}
```
```graphql
{
  placesByDistance(lat: 51.515, lng: 7.453619) {
    id
    name
    geoloc
    distance
  }
}
```

## Credits

This module was made by [@pcooney10](https://github.com/pcooney10) with help from [@kbrandwijk](https://github.com/kbrandwijk) and inspiration from the wonderful Grahpcool community.