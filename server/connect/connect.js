import mongoose from "mongoose";
import dotenv from "dotenv";

// dotenv로 mongo uri 숨기기
dotenv.config();
const { MONGO_URI } = process.env;

const connect_url = MONGO_URI;

const connect = () => {
    if (process.env.NODE_ENV !== "production") {
        mongoose.set("debug", true);
    }
    mongoose
        .connect(connect_url, { dbName: "oneul" })
        .then(() => {
            mongoose.set("debug", true);
            console.log("Connected to MongoDB");
        })
        .catch((err) => {
            console.error("Connection failed to MongoDB");
            console.log(err);
        });
};

export default connect;
