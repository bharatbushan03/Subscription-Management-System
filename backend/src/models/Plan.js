class Plan {
  constructor({ id, name, priceMonthly, priceAnnual, currency = 'USD', features = [], active = true }) {
    this.id = id;
    this.name = name;
    this.priceMonthly = priceMonthly;
    this.priceAnnual = priceAnnual;
    this.currency = currency;
    this.features = features;
    this.active = active;
  }
}

module.exports = { Plan };

