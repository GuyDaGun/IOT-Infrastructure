const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
        ProductName : {
            type:String,
            required:true
        },
        specification: {
            price: String,
            category: String,
            weight: String,
        },
        company:{
            type: mongoose.Types.ObjectId,
            required:true,
            ref:"company"
        }
}) 

module.exports = mongoose.model("product",ProductSchema,"products");