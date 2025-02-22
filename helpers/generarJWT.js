import  jwt from 'jsonwebtoken'

//crear la funcion que genera los JWT y los parametros que debe contener
const generarJWT = (id) =>{

return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

export default generarJWT;