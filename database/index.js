import mongoose, { set, connect } from 'mongoose';

const server = `localhost:27017`; // REPLACE WITH YOUR OWN SERVER
const database = 'locatrans';          // REPLACE WITH YOUR OWN DB NAME

const connectDB = async () => {
    try {
	    set("strictQuery", true);

        await connect(`mongodb://${server}/${database}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB connected!!');
    } catch (err) {
        console.log('Failed to connect to MongoDB', err);
    }
};

connectDB();

export default mongoose; 