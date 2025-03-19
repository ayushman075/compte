import mongoose from "mongoose";
const DB_NAME="CompteDatabase"

const  connectDB = async ()=>{
    try {
       const databaseConnectionResponse = await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`);
       console.log(`connected to database ${databaseConnectionResponse.connection.host}`)
    } catch (error) {
        console.error("Error occurred while connecting to database !!" , error);
        process.exit(1);
    }
}

export default connectDB; 
