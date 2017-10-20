import * as fetch from 'isomorphic-fetch'
import { Currencies } from './currencies'

interface EventData {
  base: Currencies | null
  date: string | null
}

export default async event => {
  console.log(event)

  if (event.data.base in Currencies) {
    console.log('Hi')
  } else {
    console.log('Bye')
  }

  try {
    // use EUR as default
    let base = Currencies.EUR
    if (event.data.base) {
      if (event.data.base in Currencies) {
        base = event.data.base  
      } else {
        return { error: `'${event.data.base}' is not a supported currency!` }
      }
    }

    const today = new Date().toISOString()
    let date = event.data.date || today
    date = date.slice(0, 10)

    const endpoint = `https://api.fixer.io/${date}?base=${base}`

    console.log(endpoint)

    const data = await fetch(endpoint)
      .then(json => json.json())

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
  } catch(e) {
    console.log(e)

    return {
      error: 'An unexpected error occured.'
    }
  }
}
