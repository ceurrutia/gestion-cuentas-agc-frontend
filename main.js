import "bootstrap/dist/css/bootstrap.min.css";

// Funciones globales
window.editarCuenta = editarCuenta;
window.eliminarCuenta = eliminarCuenta;

// LISTAR LAS CUENTAS
const listaCuentas = document.getElementById("listaCuentas");

// Cuentas del backend
async function obtenerCuentas() {
  const res = await fetch("http://localhost:5000/cuentas");
  const cuentas = await res.json();

  listaCuentas.innerHTML = "";

  // Agregar cada cuenta a la tabla
  cuentas.forEach((cuenta) => {
    listaCuentas.innerHTML += `
      <tr>
          <td>${cuenta.nombreApellido}</td>
          <td>${cuenta.descripcion}</td>
          <td>${cuenta.cuentaX}</td>
          <td>${cuenta.cuentaInstagram}</td>
          <td>${cuenta.cuentaLinkedIn}</td>
          <td>${cuenta.comentarios}</td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="editarCuenta('${cuenta._id}')">Modificar</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarCuenta('${cuenta._id}')">Eliminar</button>
          </td>
      </tr>
    `;
  });
}

obtenerCuentas();

// AGREGAR CUENTA NUEVA
const formularioCuenta = document.getElementById("formularioCuenta");

formularioCuenta.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nuevaCuenta = {
    nombreApellido: document.getElementById("nombreApellido").value,
    descripcion: document.getElementById("descripcion").value,
    cuentaX: document.getElementById("cuentaX").value,
    cuentaInstagram: document.getElementById("cuentaInstagram").value,
    cuentaLinkedIn: document.getElementById("cuentaLinkedIn").value,
    comentarios: document.getElementById("comentarios").value,
  };

  const res = await fetch("http://localhost:5000/cuentas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nuevaCuenta),
  });

  if (res.ok) {
    formularioCuenta.reset();
    mostrarAlerta("success", "Cuenta agregada correctamente");
    obtenerCuentas(); 
  } else {
    mostrarAlerta("error", "Error al agregar la cuenta");
  }
});

// ELIMINAR CUENTA
async function eliminarCuenta(id) {
  if (confirm("¿Seguro que deseas eliminar esta cuenta?")) {
    const res = await fetch(`http://localhost:5000/cuentas/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      mostrarAlerta("success", "Cuenta eliminada correctamente");
      // Actualizar la tabla
      obtenerCuentas();
    } else {
      mostrarAlerta("error", "Error al eliminar la cuenta");
    }
  }
}

// EDITAR REGISTROS
async function editarCuenta(id) {
  try {
    const response = await fetch(`http://localhost:5000/cuentas/${id}`);

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    const cuenta = await response.json();
    console.log("Datos de la cuenta:", cuenta);

    document.getElementById("nombreApellidoModal").value =
      cuenta.nombreApellido;
    document.getElementById("descripcionModal").value = cuenta.descripcion;
    document.getElementById("cuentaXModal").value = cuenta.cuentaX;
    document.getElementById("cuentaInstagramModal").value =
      cuenta.cuentaInstagram;
    document.getElementById("cuentaLinkedInModal").value =
      cuenta.cuentaLinkedIn;
    document.getElementById("comentariosModal").value = cuenta.comentarios;

    // Guardar el ID de la cuenta a modificar
    window.cuentaId = id;

    // Muestra el modal
    const modal = new bootstrap.Modal(document.getElementById("editarModal"));
    modal.show();
  } catch (error) {
    console.error("Error al cargar los datos de la cuenta:", error);
    mostrarAlerta(
      "error",
      `Error al cargar los datos de la cuenta: ${error.message}`
    );
  }
}

// Evento para guardar cambios en el modal
document
  .getElementById("guardarCambiosBtn")
  .addEventListener("click", async () => {
    const cuentaActualizada = {
      nombreApellido: document.getElementById("nombreApellidoModal").value,
      descripcion: document.getElementById("descripcionModal").value,
      cuentaX: document.getElementById("cuentaXModal").value,
      cuentaInstagram: document.getElementById("cuentaInstagramModal").value,
      cuentaLinkedIn: document.getElementById("cuentaLinkedInModal").value,
      comentarios: document.getElementById("comentariosModal").value,
    };

    // Verifica si el ID de la cuenta está definido
    if (!window.cuentaId) {
      console.error("ID de cuenta no está definido");
      mostrarAlerta("error", "No se pudo actualizar la cuenta: ID no válido");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/cuentas/${window.cuentaId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cuentaActualizada),
        }
      );

      if (res.ok) {
        mostrarAlerta("success", "Cuenta actualizada correctamente");
        obtenerCuentas();
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("editarModal")
        );
        modal.hide();
      } else {
        // Errores de la respuesta
        const errorData = await res.json();
        mostrarAlerta(
          "error",
          `Error al actualizar la cuenta: ${
            errorData.error || "Error desconocido"
          }`
        );
      }
    } catch (error) {
      console.error("Error al actualizar la cuenta:", error);
      mostrarAlerta("error", `Error al actualizar la cuenta: ${error.message}`);
    }
  });

// FUNCIONES DE ALERTAS
function mostrarAlerta(tipo, mensaje) {
  const alertElement = tipo === "success" ? "alertSuccess" : "alertError";
  const alertDiv = document.getElementById(alertElement);

  alertDiv.textContent = mensaje;
  alertDiv.classList.remove("d-none");

  setTimeout(() => {
    alertDiv.classList.add("d-none");
  }, 3000);
}


document.addEventListener("DOMContentLoaded", function () {
  obtenerCuentas();
});


// busqueda por nom y apelido

document.getElementById("buscarBtn").addEventListener("click", async () => {
  const cuentaBuscada = document
    .getElementById("buscarNombreApellido")
    .value.trim();

  if (cuentaBuscada.length < 3) {
    mostrarAlerta("error", "Por favor ingresa al menos 3 letras para buscar.");
    return;
  }

  // Solo las primeras 3 letras
  const primerasTresLetras = cuentaBuscada.substring(0, 3);

  try {
    const res = await fetch(
      `http://localhost:5000/cuentas?nombreApellido=${primerasTresLetras}`
    );
    if (!res.ok) {
      throw new Error("Error al buscar cuentas");
    }
    const cuentas = await res.json();

    if (cuentas.length === 0) {
      mostrarAlerta("error", "No se encontraron cuentas con ese nombre o apellido.");
    } else {
      mostrarCuentas(cuentas);  
      mostrarAlerta("success", "Cuentas encontradas.");
    }
  } catch (error) {
    console.error("Error al buscar cuentas:", error);
    mostrarAlerta("error", `Error al buscar cuentas: ${error.message}`);
  }
});



//mostrar cuentas en la busqueda
function mostrarCuentas(cuentas) {
  const listaCuentas = document.getElementById("listaCuentas");
  listaCuentas.innerHTML = "";  

  if (cuentas.length > 0) {
    cuentas.forEach((cuenta) => {
      const row = document.createElement("tr");

      row.innerHTML = `
            <td>${cuenta.nombreApellido}</td>
            <td>${cuenta.descripcion || "N/A"}</td>
            <td>${cuenta.cuentaX || "N/A"}</td>
            <td>${cuenta.cuentaInstagram || "N/A"}</td>
            <td>${cuenta.cuentaLinkedIn || "N/A"}</td>
            <td>${cuenta.comentarios || "N/A"}</td>
            <td>
                <button class="btn btn-primary" onclick="editarCuenta('${cuenta._id}')">Editar</button>
                <button class="btn btn-danger" onclick="eliminarCuenta('${cuenta._id}')">Eliminar</button>
            </td>
        `;
      listaCuentas.appendChild(row);  
    });
  } else {
    mostrarAlerta("error", "No se encontraron cuentas con ese nombre o apellido.");
  }
}


