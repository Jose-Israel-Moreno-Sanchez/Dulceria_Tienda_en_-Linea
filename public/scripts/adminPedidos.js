document.addEventListener("DOMContentLoaded", async () => {
  const tabla = document.getElementById("tabla-pedidos");
  const modalDetalle = document.getElementById("modalDetalleProductos");
  const detalleContenido = document.getElementById("detalle-productos-contenido");
  const instanceModal = M.Modal.init(modalDetalle, {});

  async function cargarPedidos() {
    try {
      const res = await fetch("/pedidos/admin/listado", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const pedidos = await res.json();

      tabla.innerHTML = "";

      pedidos.forEach((p, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.pedido_id}</td>
          <td>${new Date(p.fecha_creacion).toLocaleDateString()}</td>
          <td>${p.estado_nombre}</td>
          <td>$${p.total.toFixed(2)}</td>
          <td>
            <button class="btn-small amber darken-3 ver-detalle" data-id="${p.pedido_id}">
              <i class="fas fa-eye"></i>
            </button>
          </td>
          <td>
            ${
              [1, 2].includes(p.estado_id)
                ? `<button class="btn-small red cancelar-pedido" data-id="${p.pedido_id}">
                    <i class="fas fa-times"></i>
                   </button>`
                : "-"
            }
          </td>
        `;
        tabla.appendChild(tr);
      });
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      M.toast({ html: "Error al cargar pedidos", classes: "red" });
    }
  }

  tabla.addEventListener("click", async (e) => {
    if (e.target.closest(".ver-detalle")) {
      const id = e.target.closest(".ver-detalle").dataset.id;
      try {
        const res = await fetch(`/pedidos/${id}/productos`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const productos = await res.json();

        detalleContenido.innerHTML = productos
          .map(
            (p) => `
          <div class="col s12 m6 l4">
            <div class="card grey darken-3 white-text">
              <div class="card-content">
                <span class="card-title">${p.nombre}</span>
                <p>Cantidad: ${p.cantidad}</p>
                <p>Precio unitario: $${p.precio_unitario}</p>
                <p>Total: $${(p.cantidad * p.precio_unitario).toFixed(2)}</p>
              </div>
            </div>
          </div>`
          )
          .join("");

        instanceModal.open();
      } catch (error) {
        console.error("Error al obtener productos:", error);
        M.toast({ html: "No se pudieron cargar los productos", classes: "red" });
      }
    }

    if (e.target.closest(".cancelar-pedido")) {
      const id = e.target.closest(".cancelar-pedido").dataset.id;
      if (!confirm("¿Estás seguro de cancelar este pedido?")) return;

      try {
        const res = await fetch(`/pedidos/${id}/cancelar`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const data = await res.json();
        M.toast({ html: data.mensaje, classes: res.ok ? "green" : "red" });
        if (res.ok) cargarPedidos();
      } catch (error) {
        console.error("Error al cancelar pedido:", error);
        M.toast({ html: "No se pudo cancelar el pedido", classes: "red" });
      }
    }
  });

  cargarPedidos();
});
