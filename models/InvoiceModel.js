// const express = require('express');
// const mongoose = require('mongoose');

// const InvoiceSchema = mongoose.Schema({
//     dueDate: Date,
//     currency: String,
//     types:String,
//     items: [ { itemName: String, unitPrice: String, quantity: String,hsn: String, discount: String } ],
//     rates: String,
//     extra:String,
//     vat: Number,
//     total: Number,
//     subTotal: Number,
//     notes: String,
//     status: String,
//     invoiceNumber: String,
//     type: String,
//     creator: [String],
//     totalAmountReceived: Number,
//     client: { name: String, email: String, phone: String, gst: String, address: String },
//     paymentRecords: [ {amountPaid: Number, datePaid: Date, paymentMethod: String, note: String, paidBy: String } ],
//     createdAt: {
//         type: Date,
//         default: new Date()
//     }
// })

// const InvoiceModel = mongoose.model('InvoiceModel', InvoiceSchema)
// module.exports= InvoiceModel

const { Model } = require('sequelize');
const invoiceItem = require('./invoice.Item');

module.exports = (sequelize, DataTypes) => {
    class Invoice extends Model {}
    Invoice.init(
        {
            // Invoice Number
            // Invoice Type (Sale/Purchase)
            // Party Name
            // Phone Number
            // Party Address
            // GSTIN
            // Invoice Date
            // Own GSTIN - User's GSTIN
            // State Of Supply
            // Total Amount
            // Paid Via (Unpaid, Online, Cash)
            // Balance Due
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            type: {
                type: DataTypes.ENUM,
                values:['sale', 'purchased']
            },
            invoiceNumber: {
                type: DataTypes.UUID,
            },
            date:{
                type: DataTypes.STRING
            },
            status:{
                type: DataTypes.ENUM,
                values:["draft", "paid", "partial_paid", "due"]
            },
           totalTax_amount:{
            type: DataTypes.INTEGER,
           },
           items_totalamount:{
            type: DataTypes.INTEGER
           },
           amount_received:{
            type: DataTypes.INTEGER
           },
           amount_due:{
            type: DataTypes.INTEGER
           },
           totalInvoice_amount:{
            type: DataTypes.INTEGER
           },

           discount_amount:{
            type: DataTypes.INTEGER
           },
           items:{
           type:DataTypes.STRING
            },
            saller:{
                type:DataTypes.STRING
            },
           buyer:{
            type:DataTypes.STRING
           }

        },
        {
            sequelize,
            tableName: 'Invoices',
            modelName: 'Invoice',
        }
    );

    return Invoice;
};
