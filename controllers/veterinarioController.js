import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlividePassword.js";


const registrar = async (req, res) =>{

    const {email, nombre, } = req.body;

    //prevenir usuarios duplicados

    const existeUsuario = await Veterinario.findOne({email})

    if (existeUsuario) {
        const error = new Error("Usuario ya registrado")
        return res.status(400).json({msg: error.message})
        
    }
    try {
        // Guardar un nuevo veterinario
        const veterinario = new Veterinario(req.body)
        const veterinarioGuardado = await veterinario.save()

            // Enviar el email de confimacion

            emailRegistro({
                email,
                nombre,
                token: veterinarioGuardado.token
            });


        res.json(veterinarioGuardado)

    } catch (error) {
        console.log(error);
        
    }
    
};

const perfil = (req, res) =>{
    const {veterinario} = req;
    
    res.json(veterinario);

};

 const confirmar = async (req, res) =>{
    //se crea una variable para almacenar el token del usuario para validar la cuenta
    const { token } = req.params;

    // se usa la funcion findOne de mongoose pasando el token como parametro
    // esta funcion busca en los registros del server un usuario con un token igual al pasando por el usuario registrado
    const usuarioConfirmar = await Veterinario.findOne({token});

        // se comprueba si ese token existe, caso no sea asi (es decir el usuario no es valido) se le muestra un msg de errror
    if (!usuarioConfirmar) {
        const error = new Error('Token no valido');
        return res.status(404).json({msg: error.message});
        
    }
    // en caso de que el usuario si pase la validacion (es decir si existe un usuario con ese token)
    // se cambia los valores de los campos token a null y confirmado a true y se guarda el registro en la BD
    
    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();
        
        
       res.json({msg:"usuario confirmado correctamente!!"});
    } catch (error) {
        console.log(error);
        
        
    }
    
 };
    const autenticar = async (req, res) => {
        const {email, password} = req.body

        //Comprobar si el usuario existe
        const usuario = await Veterinario.findOne({email})
        if (!usuario) {
            const error = new Error('El usuario no existe');
            return res.status(404).json({msg: error.message});
            
        }
        // compobar si el usuario esta confirmado
        if (!usuario.confirmado) {
            const error = new Error('Tu cuenta no ha sido confirmada');
            return res.status(403).json({msg: error.message});
            
        }
        // Revisar el password
            if (await usuario.comprobarPassword(password)) {
                //autenticar
                res.json({
                    _id: usuario._id,
                    nombre:usuario.nombre,
                    email: usuario.email,
                    token:  generarJWT(usuario.id),
                    
                });
                
                
            } else {
                const error = new Error('El password es incorrecto');
            return res.status(403).json({msg: error.message});
                 
            }
        
    };
    const olvidePassword = async (req, res) =>{

        const {email} = req.body
        const existeVeterinario = await Veterinario.findOne({email})
        if (!existeVeterinario) {
            const error = new Error('El usuario no existe');
            return res.status(400).json({msg: error.message})
        }
        try {
            existeVeterinario.token = generarId();
            await existeVeterinario.save();


            // enviar email con instrucciones para restablecer el password 

            emailOlvidePassword({
                email,
                nombre: existeVeterinario.nombre,
                token: existeVeterinario.token
            })

            res.json({msg: "Hemos enviado un email con las instrucciones"})
        } catch (error) {
            console.log(error);
            
        }
    };
    const comprobarToken = async (req, res) =>{
        const {token} = req.params

        const tokenValido = await Veterinario.findOne({token})

        if (tokenValido) {
            // El token es valido el usuario existe
            res.json({msg: "Token valido y el usuario existe"})
        } else {
            const error = new Error('Token no valido');
            return res.status(400).json({msg: error.message})
        }
        
        
    }
    const nuevoPassword = async (req, res) =>{

        const { token } = req.params; //parametros que vienen de la URL visitada
        const { password } = req.body; //datos provenientes de lo que el usuario escribe x ejemplo desde un formulario

        const veterinario = await Veterinario.findOne({token})
        if(!veterinario){
            const error = new Error('Hubo un error');
            return res.status(400).json({msg: error.message})
        }
        try {
            veterinario.token = null;
            veterinario.password = password;
            await veterinario.save();
            res.json({msg: "Password modificado correctamente"})
            
        } catch (error) {
            console.log(error);
            
            
        }

    }


    const actualizarPerfil = async (req, res) => {

        console.log(req.body);
        const veterinario = await Veterinario.findById(req.params.id)
        
        if (!veterinario) {
            const error = new Error('Hubo un error');
            return res.status(400).json({msg: error.message})
        }

            const {email} = req.body;
            if (veterinario.email !== email) {
                const existeVeterinario = await Veterinario.findOne({email})
                if (existeVeterinario) {
                    const error = new Error('El email ya esta en uso');
                    return res.status(400).json({msg: error.message})
                }
            }

        try {
            veterinario.nombre = req.body.nombre; 
            veterinario.email = req.body.email; 
            veterinario.web = req.body.web;
            veterinario.telefono = req.body.telefono;

            const veterinarioActualizado = await veterinario.save();
            res.json(veterinarioActualizado)
            
        } catch (error) {
            console.log(error);
            
        }
    }

    const actualizarPassword = async (req, res) => {
       // leer los datos 
       const {id} = req.veterinario;
       const {pwd_actual, pwd_nuevo} = req.body;

       // comprobar si el veterinario existe
       const veterinario = await Veterinario.findById(id)
        
       if (!veterinario) {
           const error = new Error('Hubo un error');
           return res.status(400).json({msg: error.message})
       }
        
       // comprobar su password
         if (await veterinario.comprobarPassword(pwd_actual)) {
            //almacenar el nuevo password
            
            veterinario.password = pwd_nuevo;
            await veterinario.save();
            res.json({msg: "Password actualizado correctamente"})
         }else{
            const error = new Error('El password actual es incorrecto');
           return res.status(400).json({msg: error.message})
            
         }
        
        
    }

export {registrar,perfil, confirmar, autenticar, olvidePassword, comprobarToken, nuevoPassword, actualizarPerfil,actualizarPassword}