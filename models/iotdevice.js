const mongoose = require("mongoose")

const iotDeviceSchema = new mongoose.Schema({
    productId : {
        type: mongoose.Types.ObjectId,
        required:true,
        ref:"product"
    },
    owner : {
        name: String,
        email: String,
        phone: String,
        address:{
            country: String,
            city: String,
            street: String,
            postal_code: Number
        },
        payment:{
            credit_card:{
                type : String,
                require: true 
            },
            expiration_date:{
                type : String,
                require: true 
            },
            cvv:{
                type : Number,
                require: true 
            }
        }
    },
    updates : [{
        data:String,
        timeStamp:{
            type:Date,
            default: () => Date.now()
        }
    }]
})

module.exports = mongoose.model("iotDevice", iotDeviceSchema, "iotDevices");