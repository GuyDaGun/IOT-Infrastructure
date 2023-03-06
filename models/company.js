const mongoose = require("mongoose")


const CompanySchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        company : {
            type:String,
            required:true
        },
        address: [{
            country: String,
            city: String,
            street: String,
            postal_code: Number
        }],
        contacts: [{ 
            contact_name: String,
            contact_email: String,
            contact_phone: String,
        }]
}) 

module.exports = mongoose.model("company",CompanySchema,"companies");