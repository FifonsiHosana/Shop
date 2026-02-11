
import crypto from 'crypto';
const secret = process.env.PAYSTACK_SECRET_KEY;
import { Paystack } from "@paystack/paystack-sdk"
import Order from '../models/Order';
import { CallTracker } from 'assert';

const paystack = new Paystack(secret);

app.post("/my/webhook/url", async function (req, res) {
    //validate event
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) {
        return res.status(401).send('Invalid signature');
    }

    if (hash == req.headers['x-paystack-signature']) {
        // Retrieve the request's body
        const event = req.body;
        // Do something with event
        console.log(event);

        if (event.event === 'charge.success') {
            const orderId = event.data.metadata.orderId;

            const order = await Order.findById(orderId);

            //Idempotency check
            if (!order || order.isPaid) {
                return res.sendStatus(200);
            }

            if (order) {
                order.isPaid = true;
                order.paymentStatus = 'paid';
                order.paidAt = Date.now();
                order.paymentMethod = 'Paystack';
            }
            await order.save();
        }


    }

    res.send(200);
});

const initialize = async (email, amount) => {


    const {orderId} = req.body;


    const order = await Order.findById(orderId).populate('user');

    const response = await paystack.transaction.initialize({
        email,
        amount,
    })

    console.log(response)
}

const email = 'test@example.com'
const amount = 2000
initialize(email, amount)
