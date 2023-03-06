const express = require("express");
const router = express.Router({mergeParams: true});
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const iotDevice = require("../models/iotdevice");
const Product = require('../models/product');
const User = require('../models/User');
const Company = require('../models/company');

// @route   POST companies/:id/products/:id/IOTDevices
// @desc    Add an IOT Device
// @access  Private
router.post("/", [auth, [
    check('owner.name', 'Owner Name is Required').not().isEmpty(),
    check('owner.email', 'Owner email is Required').not().isEmpty(),
    check('owner.phone', 'Owner phone is Required').not().isEmpty(),
    check('owner.address.country', 'Country is required').not().isEmpty(),
    check('owner.address.city', 'City is required').not().isEmpty(),
    check('owner.address.street', 'Street is required').not().isEmpty(),
    check('owner.address.postal_code', 'Postal code is required').not().isEmpty().isNumeric(),
    check('owner.payment.credit_card', 'Credit card is required').not().isEmpty(),
    check('owner.payment.expiration_date', 'Expiration date is required').not().isEmpty(),
    check('owner.payment.cvv', 'CVV is required').not().isEmpty().isNumeric(),
]],async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ error: errors.array() });
    }

    try {
        const product = await Product.findById(req.body.productId);

        const newOwner = new iotDevice({
            productId: product,
            owner: {
                name: req.body.owner.name,
                email: req.body.owner.email,
                phone: req.body.owner.phone,
                address: {
                    country: req.body.owner.address.country,
                    city: req.body.owner.address.city,
                    street: req.body.owner.address.street,
                    postal_code: req.body.owner.address.postal_code
                },
                payment: {
                    credit_card: req.body.owner.payment.credit_card,
                    expiration_date: req.body.owner.payment.expiration_date,
                    cvv: req.body.owner.payment.cvv
                }
            }
        });

        await newOwner.save();
        res.json({newOwner});

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
})


// @route   GET companies/:id/products/:id/IOTDevices
// @desc    Get all iot devices for a specific product
// @access  Private
router.get('/', auth, async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ error: errors.array() });
    }

    try {
        const product = await Product.findById(req.params.prod_id);
        
        const iots = await iotDevice.find({"productId": product});
        
        res.json(iots);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});


// @route   GET companies/:comp_id/products/:product_id/IOTDevices/:iot_id
// @desc    Get a specific iot of a product
// @access  Private
router.get('/:iot_id', auth, async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ error: errors.array() });
    }
    
    try {
        const user = await User.findById(req.user.id);
        const company = await Company.findOne({"company": user.companyName});
        const userID = company.user._id;
        
        if (!userID.toString() === req.user.id){
            return res.status(404).json({ msg: 'Invalid' });
        }
        console.log(req.params.iot_id)
        const iot = await iotDevice.findById(req.params.iot_id);
        
        res.json(iot);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});



// @route   POST companies/:comp_id/products/:product_id/IOTDevices/:iot_id/iotUpdates
// @desc    Add iot update
// @access  Private
router.put('/:iot_id/iotUpdates', [auth, [
    check('data', 'Data is required').not().isEmpty(),
]], async (req,res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ error: errors.array() })
    }

    const {
        data,
        timeStamp
    } = req.body;

    const newUpdt = {
        data,
        timeStamp
    }

    try {
        const iot = await iotDevice.findById(req.params.iot_id);

        iot.updates.unshift(newUpdt);

        await iot.save();

        res.json(iot);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});



// @route   GET companies/:comp_id/products/:product_id/IOTDevices/:iot_id/iotUpdates
// @desc    Get updates of an iot
// @access  Private
router.get('/:iot_id/iotUpdates/:num_of_updates', auth, async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ error: errors.array() });
    }
    
    try {
        const { iot_id, num_of_updates } = req.params;

        const iot = await iotDevice.findOne({ _id: iot_id }).populate('productId');
        
        if (!iot) {
            return res.status(404).json({ msg: 'IoT device not found' });
        }

        const updates = await iotDevice.aggregate([
            { $match: { _id: iot._id } }, // find the IoT device with the specified ID
            { $unwind: "$updates" }, // flatten the updates array
            { $sort: { "updates.timeStamp": -1 } }, // sort the updates by timestamp in descending order
            { $limit: parseInt(num_of_updates) }, // limit the number of updates to retrieve
            { $group: { _id: "$_id", updates: { $push: "$updates" } } }, // group the updates back into an array
            { $project: { _id: 0, updates: 1 } } // only return the updates array
        ]);

        res.json({ updates: updates[0]});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});


module.exports = router