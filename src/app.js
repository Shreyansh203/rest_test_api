import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import sequelize from './config/mysql.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/user', userRoutes);
app.use('/address', addressRoutes);

app.get('/', (req, res) => res.send('Welcome to the application!'));

sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port: http://localhost:${PORT}`);
    });
});