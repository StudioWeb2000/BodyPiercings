// Variables
let carrito = [];

// Cargar carrito desde LocalStorage al iniciar
window.addEventListener("load", () => {
  const carritoGuardado = localStorage.getItem("carrito");
  if(carritoGuardado){
    carrito = JSON.parse(carritoGuardado);
    actualizarCarrito();
  }
});

// Modales
const modalDetalle = document.getElementById("modal-detalle");
const modalCarrito = document.getElementById("modal-carrito");
const formWhats = document.getElementById("form-whatsapp");

// Abrir detalle producto
document.querySelectorAll(".ver-detalle").forEach(btn => {
  btn.addEventListener("click", e => {
    const producto = e.target.closest(".producto");
    document.getElementById("modal-img").src = producto.querySelector("img").src;
    document.getElementById("modal-nombre").textContent = producto.dataset.nombre;
    document.getElementById("modal-descripcion").textContent = producto.dataset.descripcion;
    document.getElementById("modal-precio").textContent = "S/ " + producto.dataset.precio;
    document.getElementById("cantidad").value = 0;
    modalDetalle.style.display = "block";
  });
});

// Cerrar modal detalle
document.querySelector(".cerrar").onclick = () => modalDetalle.style.display = "none";

// Contador cantidad en modal
document.getElementById("mas").onclick = () => {
  let input = document.getElementById("cantidad");
  input.value = parseInt(input.value) + 1;
}
document.getElementById("menos").onclick = () => {
  let input = document.getElementById("cantidad");
  if(parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
}

// Agregar al carrito
document.getElementById("agregar-carrito").onclick = () => {
  const nombre = document.getElementById("modal-nombre").textContent;
  const precio = parseFloat(document.getElementById("modal-precio").textContent.replace("S/ ",""));
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const img = document.getElementById("modal-img").src;

  let existente = carrito.find(item => item.nombre === nombre);
  if(existente){
    existente.cantidad += cantidad;
  } else {
    carrito.push({nombre, precio, cantidad, img});
  }

  modalDetalle.style.display = "none";
  actualizarCarrito();
}

// Ver carrito
document.getElementById("ver-carrito").onclick = () => {
  modalCarrito.style.display = "block";
  actualizarCarrito();
}

// Cerrar carrito
document.querySelector(".cerrar-carrito").onclick = () => modalCarrito.style.display = "none";

// Vaciar carrito
document.getElementById("vaciar-carrito").onclick = () => {
  carrito = [];
  localStorage.removeItem("carrito");
  actualizarCarrito();
}

// Actualizar carrito con interacción en tiempo real
function actualizarCarrito(){
  const cont = document.getElementById("carrito-items");
  cont.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    let subtotal = item.precio * item.cantidad;
    total += subtotal;
    cont.innerHTML += `
      <div class="item-carrito">
        <img src="${item.img}" width="50">
        <p>${item.nombre}</p>
        <p>Unid: S/ ${item.precio.toFixed(2)}</p>
        <div class="cantidad-control">
          <button class="menos-carrito" data-index="${index}">-</button>
          <input type="number" value="${item.cantidad}" min="1" data-index="${index}" class="cantidad-carrito">
          <button class="mas-carrito" data-index="${index}">+</button>
        </div>
        <p>Subtotal: S/ <span class="subtotal" data-index="${index}">${subtotal.toFixed(2)}</span></p>
        <button class="eliminar" data-index="${index}">Eliminar</button>
      </div>
    `;
  });

  document.getElementById("total").textContent = total.toFixed(2);
  localStorage.setItem("carrito", JSON.stringify(carrito));

  // Botones + y - en carrito
  document.querySelectorAll(".mas-carrito").forEach(btn => {
    btn.onclick = (e) => {
      let index = e.target.dataset.index;
      carrito[index].cantidad += 1;
      actualizarCarrito();
    }
  });
  document.querySelectorAll(".menos-carrito").forEach(btn => {
    btn.onclick = (e) => {
      let index = e.target.dataset.index;
      carrito[index].cantidad -= 1;
      if(carrito[index].cantidad <= 0) carrito.splice(index,1);
      actualizarCarrito();
    }
  });

  // Cambiar cantidad manualmente
  document.querySelectorAll(".cantidad-carrito").forEach(input => {
    input.onchange = (e) => {
      let index = e.target.dataset.index;
      carrito[index].cantidad = parseInt(e.target.value);
      if(carrito[index].cantidad <= 0) carrito.splice(index,1);
      actualizarCarrito();
    }
  });

  // Eliminar producto completo
  document.querySelectorAll(".eliminar").forEach(btn => {
    btn.onclick = (e) => {
      let index = e.target.dataset.index;
      carrito.splice(index,1);
      actualizarCarrito();
    }
  });
}

// Enviar al WhatsApp
document.getElementById("enviar-whatsapp").onclick = () => {
  modalCarrito.style.display = "none";
  formWhats.style.display = "block";
}

// Cerrar formulario WhatsApp
document.querySelector(".cerrar-form").onclick = () => formWhats.style.display = "none";

// Capturar datos del formulario
document.getElementById("formulario-pedido").onsubmit = (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre-cliente").value;
  const correo = document.getElementById("correo-cliente").value;
  const celular = document.getElementById("celular-cliente").value;

  let mensaje = `Pedido de ${nombre}%0ACorreo: ${correo}%0ACelular: ${celular}%0AProductos:%0A`;
  carrito.forEach(item => {
    mensaje += `${item.nombre} x${item.cantidad} - S/ ${(item.precio*item.cantidad).toFixed(2)}%0A`;
  });
  let total = carrito.reduce((acc, item) => acc + item.precio*item.cantidad,0);
  mensaje += `Total: S/ ${total.toFixed(2)}`;

  window.open(`https://wa.me/51968406928?text=${mensaje}`, '_blank');
  carrito = [];
  localStorage.removeItem("carrito");
  actualizarCarrito();
  formWhats.style.display = "none";
}
