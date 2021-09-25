const Stripe = require('stripe')('sk_test_51JRjPOG9fFF0nTkRRANWMcUnLi1dcY1ZyxwNCXzr6UsU2Emp1PkngU1m5IL9YyTE6NiQBowrp2CGkeeeW6RaE6F400fPNDEtT4')
 

const createCheckoutSession = async (customerID, price) => {
  const session = await Stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: customerID,
    line_items: [
      {
        price,
        quantity: 1
      }
    ],

    success_url: `${process.env.FRONT_URL}`,
    cancel_url: `${process.env.FRONT_URL}/404`
  })

  return session
}

const createBillingSession = async (customer) => {
  const session = await Stripe.billingPortal.sessions.create({
    customer,
    return_url: 'https://localhost:3000'
  })
  return session
}

const getCustomerByID = async (id) => {
  const customer = await Stripe.customers.retrieve(id)
  return customer
}

const addNewCustomer = async (email) => {
  const customer = await Stripe.customers.create({
    email,
    description: 'New Customer'
  })

  return customer
}

const createWebhook = (rawBody, sig) => {
  const event = Stripe.webhooks.constructEvent(
    rawBody,
    sig,
    process.env.whsec_HUkJ0h5IKHmvewVNeGvKB2aF9l96dZhq
  )
  return event
}

module.exports = {
  getCustomerByID,
  addNewCustomer,
  createCheckoutSession,
  createBillingSession,
  createWebhook
}
