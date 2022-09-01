const socket = io.connect();


socket.on('carrito', async carrito => {
    const html = await makeHtmlTable(carrito);
    document.getElementById('carrito').innerHTML = html;
    socket.emit('notificacion', 'carrito recibido');
})

const productosApi = {
    get: () => {
        return fetch('/api/productos')
            .then(data => data.json())
    }
}

const carritosApi = {
    crearCarrito: () => {
        const options = { method: "POST" }
        return fetch('/api/carrito', options)
            .then(data => data.json())
    },
    getIds: () => {
        return fetch('/api/carrito')
            .then(data => data.json())
    },
    postProd: (idCarrito, idProd) => {
        const data = { id: idProd }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
        return fetch(`/api/carrito/${idCarrito}/productos`, options)
    },
    getProds: idCarrito => {
        return fetch(`/api/carrito/${idCarrito}/productos`)
            .then(data => data.json())
    },
    deleteProd: (idCarrito, idProducto) => {
        const options = {
            method: 'DELETE',
        }
        return fetch(`/api/carrito/${idCarrito}/productos/${idProducto}`, options)
    }
}

loadComboProductos()

loadComboCarrito()

//Agrega un producto al carrito
document.getElementById('btnAgregarAlCarrito').addEventListener('click', () => {
    const idCarrito = document.getElementById('comboCarritos').value
    const idProd = document.getElementById('comboProductos').value
    if (idCarrito && idProd) {
        agregarAlCarrito(idCarrito, idProd)
    } else {
        alert('debe seleccionar un carrito y un producto')
    }
})

//Crea un nuevo carrito
document.getElementById('btnCrearCarrito').addEventListener('click', () => {
    carritosApi.crearCarrito()
        .then(({ id }) => {
            loadComboCarrito().then(() => {
                const combo = document.getElementById('comboCarritos')
                combo.value = `${id}`
                combo.dispatchEvent(new Event('change'));
            })
        })

        socket.emit('new-carrito', combo);
})

//muestra el carrito que seleccionamos
document.getElementById('comboCarritos').addEventListener('change', () => {
    const idCarrito = document.getElementById('comboCarritos').value
    actualizarListaCarrito(idCarrito)
})

//funcion para agregar un producto al carrito
function agregarAlCarrito(idCarrito, idProducto) {
    return carritosApi.postProd(idCarrito, idProducto).then(() => {
        actualizarListaCarrito(idCarrito)
    })
}

//funcion para quitar un elemento del carrito
function quitarDelCarrito(idProducto) {
    const idCarrito = document.getElementById('comboCarritos').value
    return carritosApi.deleteProd(idCarrito, idProducto).then(() => {
        actualizarListaCarrito(idCarrito)
    })
}

//funcion para actualziar el listado de carritos
function actualizarListaCarrito(idCarrito) {
    return carritosApi.getProds(idCarrito)
        .then(prods => makeHtmlTable(prods))
        .then(html => {
            document.getElementById('carrito').innerHTML = html
        })
}

//funcion para crear la tabla de productos de un carrito
function makeHtmlTable(productos) {
    let html = `
        <style>
            .table td,
            .table th {
                vertical-align: middle;
            }
        </style>`

    if (productos.length > 0) {
        html += `
        <h2>Lista de Productos</h2>
        <div class="table-responsive">
            <table class="table table-dark">
                <tr>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Foto</th>
                </tr>`
        for (const prod of productos) {
            html += `
                    <tr>
                    <td>${prod.title}</td>
                    <td>$${prod.price}</td>
                    <td><img width="50" src=${prod.thumbnail} alt="not found"></td>
                    <td><a type="button" onclick="quitarDelCarrito('${prod.id}')">borrar</a></td>
                    </tr>`
        }
        html += `
            </table>
        </div >`
    } else {
        html += `<br><h4>carrito sin productos</h2>`
    }
    return Promise.resolve(html)
}

//Crea el menu 
function crearOpcionInicial(leyenda) {
    const defaultItem = document.createElement("option")
    defaultItem.value = ''
    defaultItem.text = leyenda
    defaultItem.hidden = true
    defaultItem.disabled = true
    defaultItem.selected = true
    return defaultItem
}

//Carga los productos en la lista desplegable
function loadComboProductos() {
    return productosApi.get()
        .then(productos => {
            const combo = document.getElementById('comboProductos');
            combo.appendChild(crearOpcionInicial('Elija un Producto'))
            for (const prod of productos) {
                const comboItem = document.createElement("option");
                comboItem.value = prod.id;
                comboItem.text = prod.title;
                combo.appendChild(comboItem);
            }
        })
}

//vacia un carrito ya creado
function vaciarCombo(combo) {
    while (combo.childElementCount > 0) {
        combo.remove(0)
    }
}

//Carga los carritos en el menu desplegable
function loadComboCarrito() {
    return carritosApi.getIds()
        .then(ids => {
            const combo = document.getElementById('comboCarritos');
            vaciarCombo(combo)
            combo.appendChild(crearOpcionInicial('Elija un Carrito'))
            for (const id of ids) {
                const comboItem = document.createElement("option");
                comboItem.value = id.id;
                comboItem.text =  'Carrito ' + id.id;
                combo.appendChild(comboItem);
            }
            
        })
}