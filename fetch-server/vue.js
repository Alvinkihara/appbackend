// const{MongoClient}=require('mongodb')

// letdbconnection

// module.exports={
//     connectedToDb:(cb) =>{


//         MongoClient.connect('mongodb+srv://ak2237:Mongodb@webstore.oq4ce.mongodb.net/mydatabase?retryWrites=true&w=majority')
//         .then((client)=>{
//             dbconnection = client.db()
//             return cb()
//         })
//     .catch(err=>{
//         console.log(err)
//         return cb(err)
//     })

//     },
//     getDb:() => {}
// }
// server.js
// const express = require('express');
// const app = express();
// const PORT = 5000;

// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });