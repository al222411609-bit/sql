const API_URL = 'api.php';
const form = document.getElementById('formEquipo');
const tabla = document.getElementById('tablaEquipos');
const btnGuardar = document.getElementById('btnGuardar');

let equipos = []; // copia local para poder editar sin pasar JSON por el HTML

// Evita que texto con <, >, comillas, etc. rompa el HTML (o inyecte código)
function escapeHTML(texto) {
    return String(texto ?? '').replace(/{&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// Función auxiliar para hacer peticiones y manejar errores
async function peticion(url, opciones) {
    try {
        const respuesta = await fetch(url, opciones);
        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }
        const texto = await respuesta.text();
        return texto ? JSON.parse(texto) : null;
    } catch (error) {
        console.error(error);
        alert('Ocurrió un error al comunicarse con el servidor. Revisa la consola (F12).');
        return undefined;
    }
}

// Cargar equipos al iniciar la página
document.addEventListener('DOMContentLoaded', obtenerEquipos);

// 1. LEER (GET)
async function obtenerEquipos() {
    const datos = await peticion(API_URL);
    if (!Array.isArray(datos)) return;

    equipos = datos;
    tabla.innerHTML = equipos.map(eq => `
        <tr>
            <td>${escapeHTML(eq.id)}</td>
            <td>${escapeHTML(eq.nombre)}</td>
            <td><span class="badge bg-secondary">${escapeHTML(eq.categoria)}</span></td>
            <td>$${(parseFloat(eq.precio) || 0).toFixed(2)}</td>
            <td>${escapeHTML(eq.stock)} uds.</td>
            <td>
                <button class="btn btn-sm btn-warning" data-accion="editar" data-id="${escapeHTML(eq.id)}">Editar</button>
                <button class="btn btn-sm btn-danger" data-accion="eliminar" data-id="${escapeHTML(eq.id)}">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// Botones Editar / Eliminar (un solo listener para toda la tabla)
tabla.addEventListener('click', (e) => {
    const boton = e.target.closest('button[data-accion]');
    if (!boton) return;

    const id = boton.dataset.id;
    if (boton.dataset.accion === 'editar') {
        const equipo = equipos.find(eq => String(eq.id) === id);
        if (equipo) cargarParaEditar(equipo);
    } else if (boton.dataset.accion === 'eliminar') {
        eliminarEquipo(id);
    }
});

// 2. CREAR (POST) y ACTUALIZAR (PUT)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('equipoId').value;
    const datos = {
        nombre: document.getElementById('nombre').value.trim(),
        categoria: document.getElementById('categoria').value,
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value, 10)
    };

    // Si hay ID, actualizamos (PUT); si no, creamos (POST)
    if (id) datos.id = id;
    const metodo = id ? 'PUT' : 'POST';

    const resultado = await peticion(API_URL, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (resultado === undefined) return; // hubo error: no limpiamos el formulario

    restablecerFormulario();
    obtenerEquipos(); // Recargar la tabla
});

function restablecerFormulario() {
    form.reset();
    document.getElementById('equipoId').value = '';
    btnGuardar.textContent = 'Guardar';
    btnGuardar.classList.remove('btn-success');
    btnGuardar.classList.add('btn-primary');
}

// Preparar el formulario para editar
function cargarParaEditar(equipo) {
    document.getElementById('equipoId').value = equipo.id;
    document.getElementById('nombre').value = equipo.nombre;
    document.getElementById('categoria').value = equipo.categoria;
    document.getElementById('precio').value = equipo.precio;
    document.getElementById('stock').value = equipo.stock;

    btnGuardar.textContent = 'Actualizar';
    btnGuardar.classList.remove('btn-primary');
    btnGuardar.classList.add('btn-success');
    form.scrollIntoView({ behavior: 'smooth' });
}

// 3. ELIMINAR (DELETE)
async function eliminarEquipo(id) {
    if (!confirm('¿Estás seguro de eliminar este equipo del inventario?')) return;

    const resultado = await peticion(`${API_URL}?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
    });
    if (resultado === undefined) return;

    obtenerEquipos(); // Recargar la tabla
}