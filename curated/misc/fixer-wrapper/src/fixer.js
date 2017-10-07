const fetch = require('isomorphic-fetch')

const currencies = [
  'AUD',
  'BGN',
  'BRL',
  'CAD',
  'CHF',
  'CNY',
  'CZK',
  'DKK',
  'DKK',
  'GBP',
  'HKD',
  'HRK',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'JPY',
  'KRW',
  'MXN',
  'MYR',
  'NOK',
  'NZD',
  'PHP',
  'PLN',
  'RON',
  'RUB',
  'SEK',
  'SGD',
  'THB',
  'TRY',
  'USD',
  'ZAR',
]

module.exports = event => {
  // replace with enum once supported, see types.graphql
  let base = 'EUR'
  if (event.data.base && currencies.indexOf(event.data.base) > -1) {
    base = event.data.base
  }

  const today = new Date().toISOString()
  let date = event.data.date || today
  date = date.slice(0, 10)

  const endpoint = `https://api.fixer.io/${date}?base=${base}`

  console.log(endpoint)

  return fetch(endpoint)
    .then(json => json.json())
    .then(data => {
      return {
        data: {
          'base': data.base,
          'date': data.date,
          'aud': data.rates.AUD,
          'bgn': data.rates.BGN,
          'brl': data.rates.BRL,
          'cad': data.rates.CAD,
          'chf': data.rates.CHF,
          'cny': data.rates.CNY,
          'czk': data.rates.CZK,
          'dkk': data.rates.DKK,
          'eur': data.rates.EUR,
          'gbp': data.rates.GBP,
          'hkd': data.rates.HKD,
          'hrk': data.rates.HRK,
          'huf': data.rates.HUF,
          'idr': data.rates.IDR,
          'ils': data.rates.ILS,
          'inr': data.rates.INR,
          'jpy': data.rates.JPY,
          'krw': data.rates.KRW,
          'mxn': data.rates.MXN,
          'myr': data.rates.MYR,
          'nok': data.rates.NOK,
          'nzd': data.rates.NZD,
          'php': data.rates.PHP,
          'pln': data.rates.PLN,
          'ron': data.rates.RON,
          'rub': data.rates.RUB,
          'sek': data.rates.SEK,
          'sgd': data.rates.SGD,
          'thb': data.rates.THB,
          'try': data.rates.TRY,
          'usd': data.rates.USD,
          'zar': data.rates.ZAR,
        }
      }
    })
    .catch(error => {
      console.log(error)

      return {
        error: 'An unexpected error occured.'
      }
    })
}
