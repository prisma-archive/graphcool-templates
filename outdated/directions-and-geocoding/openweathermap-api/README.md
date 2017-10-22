# Schema Extensions for OpenWeatherMap API

A set of schema extension queries that exposes the [OpenWeatherMap API](https://openweathermap.org/api) through your Graphcool endpoint.

## Getting Started

- Sign up at https://openweathermap.org/

- Get the API key from your profile

- Replace the `__API_KEY__` in all functions with your actual API key

- Create Schema Extensions using the `.graphql` and `.js` files provided in this project

> All OpenWeatherMap API calls use `metric` units by default. Each function contains a `units` constant that you can change to `imperial`

## Implemented queries

### Current weather data (https://openweathermap.org/current)

`getWeatherByCity(city: String!)` - [Documentation](https://openweathermap.org/current#name)

`getWeatherByCityAndCountry(city: String!, country: String!)` - [Documentation](https://openweathermap.org/current#name)

`getWeatherByCityId(cityId: Int!)` - [Documentation](https://openweathermap.org/current#cityid)

`getWeatherByCoordinates(lat: Float!, lon: Float!)` - [Documentation](https://openweathermap.org/current#geo)

`getWeatherByZipcode(zipcode: String!)` - [Documentation](https://openweathermap.org/current#zip)

`getWeatherByZipcodeAndCountry(zipcode: String!, country: String!)` - [Documentation](https://openweathermap.org/current#zip)

`getWeatherByBoundingBox(lonLeft: Float!, latBottom: Float!, lonRight: Float!, latTop: Float!, zoom: Int!, cluster: Boolean!)` - [Documentation](https://openweathermap.org/current#rectangle)

`getWeatherByCircle(lat: Float!, lon: Float!, count: Int!, cluster: Boolean!)` - [Documentation](https://openweathermap.org/current#cycle)

`getWeatherByCityIds(cityIds: [Int!]!)` - [Documentation](https://openweathermap.org/current#severalid)

### 5 day / 3 hour forecast (https://openweathermap.org/forecast5)

`getForecastByCity(city: String!)` - [Documentation](https://openweathermap.org/forecast5#name5)

`getForecastByCityAndCountry(city: String!, country: String!)` - [Documentation](https://openweathermap.org/forecast5#name5)

`getForecastByCityId(cityId: Int!)` - [Documentation](https://openweathermap.org/forecast5#cityid5)

`getForecastByCoordinates(lat: Float!, lon: Float!)` - [Documentation](https://openweathermap.org/forecast5#geo5)

`getForecastByZipcode(zipcode: String!)` - [Documentation](https://openweathermap.org/forecast5#zip)

`getForecastByZipcodeAndCountry(zipcode: String!, country: String!)` - [Documentation](https://openweathermap.org/forecast5#zip)

### 16 day / daily forecast (https://openweathermap.org/forecast5)
> NOTE: This OpenWeatherMap API is not available with a free subscription!

`getDailyForecastByCity(city: String!, count: Int!)` - [Documentation](https://openweathermap.org/forecast16#name16)

`getDailyForecastByCityAndCountry(city: String!, country: String!, count: Int!)` - [Documentation](https://openweathermap.org/forecast16#name16)

`getDailyForecastByCityId(cityId: Int!, count: Int!)` - [Documentation](https://openweathermap.org/forecast16#cityid16)

`getDailyForecastByCoordinates(lat: Float!, lon: Float!, count: Int!)` - [Documentation](https://openweathermap.org/forecast16#geo16)

`getDailyForecastByZipcode(zipcode: String!, count: Int!)` - [Documentation](https://openweathermap.org/forecast16#zip)

`getDailyForecastByZipcodeAndCountry(zipcode: String!, country: String!, count: Int!)` - [Documentation](https://openweathermap.org/forecast16#zip)

### UV index

`getCurrentUV(lat: Float!, lon: Float!)` - [Documentation](https://openweathermap.org/api/uvi#geo)

`getUVForecast(lat: Float!, lon: Float!, count: Int!)` - [Documentation](https://openweathermap.org/api/uvi#fgeo)

`getUVHistory(lat: Float!, lon: Float!, count: Int!)` - [Documentation](https://openweathermap.org/api/uvi#hgeo)

`getUVHistoryPeriod(lat: Float!, lon: Float!, start: Int!, end: Int!)` - [Documentation](https://openweathermap.org/api/uvi#hgeo)
