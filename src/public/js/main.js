console.log("esta funcionando main.js");
const socket = io();

// Manejar eventos de productos
const productSocket = io("/products");

productSocket.on("products", (data) => {
    renderProducts(data);
});

// función para renderizar el listado de productos
const renderProducts = (products) => {
    const productsContainer = document.getElementById("productsContainer");
    productsContainer.innerHTML = "";

    products.forEach(element => {
        const card = document.createElement("div");
        card.innerHTML = `
            <div class="card">
                <p>ID:${element._id}</p>
                <p>Titulo: ${element.title}</p>
                <p>Precio: ${element.price}</p>
                <button>Eliminar</button>
            </div>
        `;
        productsContainer.appendChild(card);

        // Agregar evento al botón eliminar
        card.querySelector("button").addEventListener("click", () => {
            removeProduct(element.id);
        });
    });
};

// función eliminar producto
const removeProduct = (id) => {
    productSocket.emit("removeProduct", id);
};

// Agregar producto:
// 1) Configurar el botón
document.getElementById("btnEnviar").addEventListener("click", () => {
    addProduct();
});

// 2) Crear la función para agregar producto
const addProduct = () => {
    const product = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: document.getElementById("price").value,
        thumbnail: document.getElementById("img").value,
        code: document.getElementById("code").value,
        stock: document.getElementById("stock").value,
        category: document.getElementById("category").value,
        status: document.getElementById("status").value === "true",
    };
    productSocket.emit("addProduct", product);
};

// Crear función para renderizar mensajes del chat
const renderMessages = (messages) => {
    const messagesLogs = document.getElementById("messagesLogs");
    messagesLogs.innerHTML = "";
    messages.forEach(message => {
        const messageElement = document.createElement("div");
        messageElement.textContent = message.text;
        messagesLogs.appendChild(messageElement);
    });
};


// Función para renderizar los productos del carrito
const renderCartProducts = (cart) => {
    const productsContainer = document.getElementById("productsContainer");
    productsContainer.innerHTML = "";

    cart.forEach(cartItem => {
        const product = cartItem.product; // Producto dentro del carrito
        const quantity = cartItem.quantity; // Cantidad del producto en el carrito

        const card = document.createElement("div");
        card.innerHTML = `
            <div class="card">
                <p>ID:${product._id}</p>
                <p>Titulo: ${product.title}</p>
                <p>Descripción: ${product.description}</p>
                <p>Precio: ${product.price}</p>
                <p>Cantidad en el carrito: ${quantity}</p>
                <button>Eliminar</button>
            </div>
        `;
        productsContainer.appendChild(card);

        // Agregar evento al botón eliminar
        card.querySelector("button").addEventListener("click", () => {
            removeProductFromCart(product._id); // Llama a la función para eliminar el producto del carrito
        });
    });
};



//EVENTOS DE LOGIN:
const formulario = document.getElementById("loginForm"); 

formulario.addEventListener("submit", () => {

    let usuario = document.getElementById("usuario").value; 
    let pass = document.getElementById("pass").value; 

    let obj = {usuario, pass}; 

    fetch("/login", {
        method:"POST", 
        body: JSON.stringify(obj),
        headers: {
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
    })
    .then(result => result.json())
    .then(json => {
        localStorage.setItem("authToken", json.token);
    })
})
