const {Party , Item, Invoice} = require("../models");


// party functions

exports.createParty = async(req,res,next)=>{

         const {
                party_type,
                name,
                mobileNumber,
                gstin,
                addr,
                pan_no,
                bussiness_name,
                bank_acc_no,
                ifsc,
         } = req.body;

    try {
        const party = await new Party(party_type, name, mobileNumber, gstin, addr, pan_no, bussiness_name, bank_acc_no,ifsc)
             const  saved = await party.save()
        res.status(200).json({
            status: 'success',
            data:saved,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error,
        });
    }



}

exports.getParty = async(req,res,next)=>{

try {
    const party = await Party.findAll({})
      
    res.status(200).json({
        status: 'success',
        data:party,
    });

} catch (error) {
    res.status(500).json({
        status: 'failed',
        error: error,
    });
}


};

// items  functions

exports.createItems = async(req,res,next)=>{
    const {
        name,
        description,
        unit,
        price,
        tax_type,
        hsnCode,
        sacCode,
        brand,
        tax_amount
    } = req.body;


    try {
        const data = await new Item(
            name,
            description,
            unit,
            price,
            tax_type,
            hsnCode,
            sacCode,
            brand,
            tax_amount
        )
             const  saved = await data.save()
        res.status(200).json({
            status: 'success',
            data:saved,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error,
        });
    }




};

exports.getItems = async(req, res, next) => {

    try {
        const data = await Item.findAll({})
          
        res.status(200).json({
            status: 'success',
            data:data,
        });
    
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            error: error,
        });
    }
    

};



exports.createInvoice = async(req,res,next) => {

const {

    type,
    invoceNumber,
    date,
    status,
    totalTax_amount,
    items_totalamount,
    amount_received,
    amount_due,
    totalInvoice_amount,
    discount_amount,
    items,
    saller,
    buyer
} = req.body

         try {
                 const data =  await new Invoice(

                    type,
                    invoceNumber,
                    date,
                    status,
                    totalTax_amount,
                    items_totalamount,
                    amount_received,
                    amount_due,
                    totalInvoice_amount,
                    discount_amount,
                    items,
                    saller,
                    buyer

                 )
                 const  saved = await data.save()
                 res.status(200).json({
                     status: 'success',
                     data:saved,
                 })

         } catch (error) {
            res.status(500).json({
                status: 'failed',
                error: error,
            });
         }


}



exports.getInvoice = async(req, res, next) => {

    try {
        const data = await Invoice.findAll({})
        res.status(200).json({
            status: 'success',
            data: data
        })
    } catch (error) {
        res.status(500).json({
            status:"failed",
            msg: error
        })
    }

}


exports.updateInvoice = async(req, res, next) =>{

    const {

        type,
        invoceNumber,
        date,
        status,
        totalTax_amount,
        items_totalamount,
        amount_received,
        amount_due,
        totalInvoice_amount,
        discount_amount,
        items,
        saller,
        buyer
    } = req.body

          const data = await Invoice.find({
            where:{
                id:req.query.id,
            }
          })

          if(!data){
            res.status(404).json({

                status:`no invoice found in database given:${req.query.id}`,


            })
          }else{
            try {
                const updatedData =  await data.update({
                    type,
                    invoceNumber,
                    date,
                    status,
                    totalTax_amount,
                    items_totalamount,
                    amount_received,
                    amount_due,
                    totalInvoice_amount,
                    discount_amount,
                    items,
                    saller,
                    buyer
                })


                res.status(200).json({
                    status: 'success',
                    data: updatedData
                })
            } catch (error) {
                res.status(500).json({ 
                    status:"failed",
                     error:error.message 
                    })
                
            }
          }
}