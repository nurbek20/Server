import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors'

import { registerValidation, loginValidation, postCreateValidation } from './validations.js';
import {UserController, PostController} from './controllers/index.js';
import {handleValidationErrors, checkAuth} from './utils/index.js';

mongoose
    .connect("mongodb+srv://admin:wwwwww@cluster0.witomxf.mongodb.net/blog?retryWrites=true&w=majority")
    .then(() => console.log('DB ok'))
    .catch((err) => console.log('DB error', err))

const app = express();

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage });
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'))

app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)  //? регистрация
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login)  //? авторизация
app.get('/auth/me', checkAuth, UserController.getMe)   //? возврашения 

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
});

app.get('/posts', PostController.getAll);  //? информация всех статья;
app.get('/posts/:id', PostController.getOne);   //? получения одно статья;
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);   //? создания статья;
app.delete('/posts/:id', checkAuth, PostController.remove);  //? удаления одного статья;
app.patch('/posts/:id', checkAuth, handleValidationErrors, PostController.update); //? изменения и обновления одного статя;

const PORT=process.env.PORT||80
app.listen(PORT, (err) => {
    if (err) {
        return console.log(err)
    }
    console.log(`Сервер запущен на порт${PORT}`);
})