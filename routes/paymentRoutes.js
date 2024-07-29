import express  from 'express';
import {isAuthenticated } from '../middlewares/auth.js';
import { buySubscription, cancelSubscription, getRazorPayKey, paymentVerification } from '../controllers/paymentController.js';

const router = express.Router();


//Buy Subscription
router.route("/subscribe").get(isAuthenticated, buySubscription);


// verify payment and save refernce in database 
router.route("/paymentverification").post(isAuthenticated , paymentVerification);


//get RazorPay Key 
router.route("/razorpaykey").get(getRazorPayKey);


//cancel subscription
router.route("/subscribe/cancel").delete( isAuthenticated , cancelSubscription); //so jo subscribed user hai vhi kr sakta hai cancel obviously , so vo hm bna lenge authorize subscriber 


export default router;
