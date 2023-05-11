const {Faq}=require("../models")


class FaqController {


      // create a new  Faq

      creatFaq=async(req,res,next)=>{


          const {category,title,dec}= req.body

          console.log(category,title,dec)

        

          
                try {
                    const  newFaq = await new Faq({category, title, dec})

                    const result = await newFaq.save()
                    res.status(200).json({message:"success",result})
                } catch (error) {
                        res.status(500).json({message:"fail to creat new FAQ",error})
                    
                }

      }


      // get all FAq

      getAllFaq =async(req,res,next) => {

                try {

                    const faq = await Faq.findAll({})

                    res.status(200).json({message:"success",faq})
                    
                } catch (error) {
                    res.status(404).json({message:"not found",error})
                }
           
      }

              // filtered by category

              filteredByCategory = async (req, res) => {

                const query = req.params.q

                try {

                    const faq = await Faq.findAll({
                        where:{
                            category:query
                        }
                    })
                    res.status(200).json({message:"success",faq})
                    
                } catch (error) {
                    res.status(404).json({message:"not found",error})
                }

                
              }



}


module.exports = new FaqController();