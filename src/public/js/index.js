//Creamos una instacia de socket.io desde el lado del cliente

const socket = io();

//Creamos una variable para guardar el usuario.
let user;

const chatBox = document.getElementById("chatBox");

//Utilizamos Sweet alert para el mensaje de bienvenida

Swal.fire({
    title: "Identificate",
    input: "text",
    text: "Ingresa un usuario para identificarte en el chat",
    inputValidator: (value) => {
        return !value && "Necesitas escribir un nombre para continuar";
    },
    allowOutsideClick: false,
}).then( result => {
    user = result.value;
})

//Envio de mensajes 

chatBox.addEventListener("keyup", (event) => {
    if(event.key === "Enter") {
        console.log(chatBox.value);
        console.log(user)
        if(chatBox.value.trim().length > 0) {
            console.log("hola")
            console.log(chatBox.value.trim())
            console.log(user)
            //Si el mensaje tiene más de 0 caracteres, lo enviamos al servidor. 
            socket.emit("message", {user: user, message: chatBox.value});
            chatBox.value = "";
        }
    }
})


//listerner de mensajes

socket.on("message", data => {
    const log = document.getElementById("messagesLogs");
    let messages = "";

    if (Array.isArray(data)) {
        data.forEach(message => {
            messages += `${message.user}: ${message.message} <br>`;
        });
    } else {
        console.error("Los datos recibidos no son un array:", data);
    }

    log.innerHTML = messages;
});