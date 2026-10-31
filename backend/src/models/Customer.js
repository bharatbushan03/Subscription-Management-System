class Customer {
  constructor({ id, name, email, company, paymentMethodId, currency = 'USD' }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.company = company;
    this.paymentMethodId = paymentMethodId;
    this.currency = currency;
    this.createdAt = new Date();
  }
}

module.exports = { Customer };

