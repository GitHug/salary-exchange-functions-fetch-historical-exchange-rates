export interface ExchangeRate {
  date: string,
  exchangeRates: any,
  baseCurrency?: 'EUR',
  lastUpdated?: FirebaseFirestore.FieldValue
}