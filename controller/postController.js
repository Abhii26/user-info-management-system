const Post = require("../models/usermodel")

const data = async (req,res) =>{
    // try {
    //     const page = parseInt(req.query.page) || 1;
    //     const perData = parseInt(req.query.size) || 10;
    //     const search = parseInt(req.query.search) || 10;
    //     const totalData = await Post.countDocuments()
    //     const totalPage = Math.ceil(totalData / perData )

    //     if(page > totalPage){
    //         res.status(500).json({ message : "Page Not Found"})
    //        // res.redirect(/post)
    //     }


    //     const data = await Post.find()
    //     .skip((page-1)*perData)
    //     .limit(perData)
    //     .exec()


    //     res.status(200).json({data, totalPage, page})

    // } catch (error) {
    //     res.status(500).json({message : "Error Occured"})
    // }

    try {
        const page = parseInt(req.query.page) || 1;
        const perData = parseInt(req.query.size) || 10;
        const search = req.query.search || ''; // Changed from parseInt since search could be string

        let query = {};
        if (search) {
            // If search term is provided, create a regex filter for name, email, or phone
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            };
        } 

        // Count documents based on query (filtered or all)
        const totalData = await Post.countDocuments(query);
        const totalPage = Math.ceil(totalData / perData);

        if (page > totalPage && totalPage > 0) {
            return res.status(404).json({ message: "Page Not Found" });
        }

        // Fetch data based on query with pagination
        const result = await Post.find(query)
            .skip((page - 1) * perData)
            .limit(perData)
            .exec();          

        res.status(200).json({
            data: result,
            totalPage,
            page,
            totalData // Optional: including total count might be useful
        });

    } catch (error) {
        console.error(error); // Helpful for debugging
        res.status(500).json({ message: "Error Occurred" });
    }
}


// const searchUser = async (req,res) =>{
//     try {
//         const {query} = req.body;

//         const filter = {
//             $or : [
//                 {name : {$regex : query , $options : i }},
//                 {email : {$regex : query }},
//                 {phone : {$regex : query , $options : i }}
//             ]
//         }

//         const filterData = await Search.find(filter)

//         if(filterData === 0){
//             return res.status(400).json({message :"Data Not Found"})
//         }

//         res.status(200).json(filterData)

//     } catch (error) {
//         res.status(500).json({message : "Error Occured"})
//     }

// }



module.exports = data 
