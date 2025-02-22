import express from "express";
import dotenv from 'dotenv'
import cors from 'cors'
import conectarDB from "./config/db.js";
import veterinarioRoutes from './routes/veterinarioRoutes.js'
import pacienteRoutes from "./routes/pacienteRuotes.js"

const app = express();
app.use(express.json())
dotenv.config();

conectarDB();

const dominiosPermitidos = [process.env.FRONTEND_URL, process.env.BACKEND_URL]

const corsOptions ={
    origin: function (origin, callback){
        console.log({origin, dominiosPermitidos});
        
        if (!origin || dominiosPermitidos.indexOf(origin) !== -1) {
            // si se pasa esta validacion entonces el Request esta permitido
            callback(null, true)
            
        }else {
            callback(new Error('No permitido por CORS'))
        }
    }
}

app.use(cors(corsOptions));

app.use("/api/veterinarios",veterinarioRoutes);
app.use("/api/pacientes",pacienteRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>{
    console.log(`el servidor esta funcionando en el puerto ${PORT}`);
    
});
