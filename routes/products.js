const express = require('express')
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Product = require('../models/product');
const User = require('../models/User');
const Company = require('../models/company');

// @route   Post companies/:id/products
// @desc    Add product
// @access  Private
router.post('/', [auth, [
    check('productName', 'Product name is required').not().isEmpty(),
    check('specification.price', 'Price is required').not().isEmpty(),
    check('specification.category', 'Category is required').not().isEmpty(),
    check('specification.weight', 'Weight name is required').not().isEmpty()
]], async (req,res) => {
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

        const prodName = req.body.productName;
        const specs = req.body.specification;

        const newProd = {
            ProductName: prodName,
            specification: specs,
            company: company
        };

        let isExists = await Product.findOne(newProd);

        if(isExists){
            
            return res.json({ msg: 'This exact product already exists' });    
        }

        isExists = new Product(newProd);

        const resultProd = await isExists.save();
        res.json(resultProd);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});


// @route   GET companies/:comp_id/products
// @desc    Get All company products
// @access  Private
router.get('/', auth, async (req,res) => {
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

        const products = await Product.find({"company": company})
        
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});


// @route   GET companies/:comp_id/products/:prod_id
// @desc    Get product by ID
// @access  Private
router.get('/:prod_id', auth, async (req,res) => {
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

        const products = await Product.findById(req.params.prod_id)
        
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router