const { stringify } = require("uuid");

const router = require("express").Router();
//const stripe = require("stripe")(process.env.STRIPE_KEY);
const stripe = require('stripe')('sk_test_51JRjPOG9fFF0nTkRRANWMcUnLi1dcY1ZyxwNCXzr6UsU2Emp1PkngU1m5IL9YyTE6NiQBowrp2CGkeeeW6RaE6F400fPNDEtT4');
const stripemethods = require('./stripemethods')


// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys

// The price ID passed from the client
//   const {priceId} = req.body;


router.post('/create-checkout-session', async (req, res) => {
 // const customer = req.user
  //const { product, customerID } = req.body
  const { email } = req.body;
 
  let customerInfo = {}
  customerInfo = await stripemethods.addNewCustomer(email)
  const customerID = customerInfo.id;
const price = process.env.PRICE_ID;

  try {
    const session = await stripemethods.createCheckoutSession(customerID, price)

    const sessions = await stripemethods.createBillingSession(customerID)
    console.log('session', sessions)

    res.send({
      sessionId: session.id
    })
    
  } catch (e) {
    console.log(e)
    res.status(400)
    return res.send({
      error: {
        message: e.message
      }
    })
  }

});
  // Redirect to the URL returned on the Checkout Session.
  // With express, you can redirect with:
  //   res.redirect(303, session.url);
  
 router.post('/webhook', (request, response) => {
  const payload = request.body;

  console.log("Got payload: " + stringify(payload));

  response.status(200);
});
router.post('/pay', async (req, res) => {
   const {email} = req.body;
  
  const paymentIntent = await stripe.paymentIntents.create({
      amount: 3000,
      currency: 'usd',
      // Verify your integration in this guide by including this parameter
      metadata: {integration_check: 'accept_a_payment'},
      receipt_email: email,
    });

    res.json({'client_secret': paymentIntent['client_secret']})
})

router.post('/sub', async (req, res) => {
const {email, payment_method} = req.body;
try {
  const customer = await stripe.customers.create({
    payment_method: payment_method,
    email: email,
    invoice_settings: {
      default_payment_method: payment_method,
    },
  });
  
const subscription = await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ plan: process.env.PLAN }],
  expand: ['latest_invoice.payment_intent']
});
const status = subscription['latest_invoice']['payment_intent']['status'] 
const client_secret = subscription['latest_invoice']['payment_intent']['client_secret']



res.json({'client_secret': client_secret, 'status': status,'subscription':subscription});
} catch (error) {
 res.json({'error':error})
}


})

router.get('/balance', async (req, res) => {
  stripe.balance.retrieve(function(err, balance) {
    console.log(balance);
    res.json({'balance': balance})

  });
  

})
router.get('/subscriptions', async (req, res) => {
   
  const subscriptions = await stripe.subscriptions.list({
   });

// const obj = JSON.parse(JSON.stringify(subscriptions));
// //const d=  JSON.stringify(obj.data);
// const d= JSON.stringify(obj);
// const k = JSON.parse(d);
// const a = JSON.stringify(k);
// const l = JSON.parse(a).data[0];
// const obj = JSON.parse(JSON.stringify(subscriptions));
//   const d=  JSON.parse(JSON.stringify(obj.subscriptions[0].data))
const obj = JSON.parse(JSON.stringify(subscriptions));
const d=  JSON.parse(JSON.stringify(obj.data))
   res.json({'subscriptions':  Object.keys(d).length})

})
//create coupons
router.post('/createcoupon', async (req, res) => {
  try {
     for(let i = 0; i<req.body.length;i++){
      await stripe.coupons.create({
        id:req.body[i],
        percent_off: 100,
        max_redemptions:1,
        duration: 'once',
        duration_in_months: 3,
      });
    }

    res.status(200).json("added successfully");

  } catch (error) {
    res.status(500).json(error);
  }


})

const createCheckoutSession = async (customer) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer:customer,
    line_items: [{ price: process.env.PLAN ,quantity: 1}],
    allow_promotion_codes: true,


    success_url: `http://localhost:3000/`,
    cancel_url: `http://localhost:3000/404`
  })

  return session
}

router.post("/checkout", async (req, res) => {
  //const { customer } = req.body
  try {

    const session = await createCheckoutSession(req.body.subsId);
    console.log(session);
    res.send({ sessionId: session.id });
  } catch (error) {
    res.json({'error':error})
  }

});

module.exports = router;
