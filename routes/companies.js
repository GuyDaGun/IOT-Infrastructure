const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const request = require('request');
const config = require('config');
const { check, validationResult } = require('express-validator');

const Profile = require('../models/company');
const User = require('../models/User');
const { response } = require('express');


// @route   GET /companies
// @desc    Get all profiles
// @access  Public
router.get('/', async (req,res) =>{
    try {
        const profiles = await Profile.find().populate('user', 'id');
        res.json({...profiles});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// @route   POST /companies
// @desc    Create or update company's profile
// @access  Private
router.post('/', auth, async (req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ error: errors.array() });
    }

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    const { company } = user.companyName;
    if (company) profileFields.company = company;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if(profile){
            //update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );

            return res.json(profile);
        }

        //Create
        profile = new Profile(profileFields);

        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

});

// @route   GET /companies/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/:user_id', async (req,res) =>{
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', 'id');

        if(!profile){
            return res.status(400).json({ msg: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server error');
    }
});



// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
// router.delete('/', auth, async (req,res) =>{
//     try {
//         //@todo - remove users posts

//         //Remove profile
//         await Profile.findOneAndRemove({ user: req.user.id });
//         //Remove user
//         await User.findOneAndRemove({ _id: req.user.id });

//         res.json({ msg: 'User deleted' });

//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });



// @route   PUT /companies/address
// @desc    Add profile address
// @access  Private
router.put('/address', [auth, [
    check('country', 'Country is required').not().isEmpty(),
    check('city', 'City is required').not().isEmpty(),
    check('street', 'Street is required').not().isEmpty(),
    check('postal_code', 'Postal code is required').not().isEmpty().isNumeric()
]], async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ error: errors.array() })
    }

    const {
        country,
        city,
        street,
        postal_code
    } = req.body;

    const newExp = {
        country,
        city,
        street,
        postal_code
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        console.log(profile);
        profile.address.unshift(newExp);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete profile experience
// @access  Private
// router.delete('/experience/:exp_id' , auth, async (req,res) => {
//     try {
//         const profile = await Profile.findOne({ user: req.user.id });

//         //Get the remove index
//         const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

//         profile.experience.splice(removeIndex, 1);

//         await profile.save();

//         res.json(profile);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });


// @route   PUT /companies/contacts
// @desc    Add profile contacts
// @access  Private
router.put('/contacts', [auth, [
    check('contact_name', 'Name is required').not().isEmpty(),
    check('contact_email', 'Email is required').not().isEmpty().isEmail(),
    check('contact_phone', 'Phone number is required').not().isEmpty(),
]], async (req,res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ error: errors.array() })
    }

    const {
        contact_name,
        contact_email,
        contact_phone
    } = req.body;

    const newEdu = {
        contact_name,
        contact_email,
        contact_phone
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.contacts.unshift(newEdu);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// @route   DELETE api/profile/education/:edu_id
// @desc    Delete profile education
// @access  Private
// router.delete('/education/:edu_id' , auth, async (req,res) => {
//     try {
//         const profile = await Profile.findOne({ user: req.user.id });

//         //Get the remove index
//         const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

//         profile.education.splice(removeIndex, 1);

//         await profile.save();

//         res.json(profile);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });


module.exports = router;