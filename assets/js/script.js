document.addEventListener("DOMContentLoaded", () => {

    // MODAL HOME.HTML

    const modalHorarios = document.getElementById('modalTechada');
    if (modalHorarios) {

        // Bootstrap show.bs.modal
        modalHorarios.addEventListener('show.bs.modal', function (event) {

            // 'event.relatedTarget' card que abrió el modal
            const card = event.relatedTarget;

            // nombre de la cancha del atributo 'data-cancha'
            const nombreCancha = card.getAttribute('data-cancha');


            const modalTitle = modalHorarios.querySelector('.modal-title');
            const hiddenInputCancha = modalHorarios.querySelector('input[name="cancha"]');

            modalTitle.textContent = `${nombreCancha} - Seleccioná un horario`;
            hiddenInputCancha.value = nombreCancha;
        });

        // guardar selección
        const modalForms = modalHorarios.querySelectorAll("form");

        modalForms.forEach(form => {
            form.addEventListener("submit", (e) => {
                const cancha = form.querySelector('input[name="cancha"]').value;
                const horario = form.querySelector('input[name="hora"]:checked')?.value;
                const contenedorAlerta = document.getElementById('modal-alerta-horario');

                if (contenedorAlerta) {
                    contenedorAlerta.innerHTML = "";
                }

                if (!horario) {
                    e.preventDefault(); // para que seleccione horario si o si

                    // Alerta de Bootstrap
                    if (contenedorAlerta) {
                        const wrapper = document.createElement('div');
                        wrapper.innerHTML = `
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        Por favor, seleccioná un horario para continuar.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
                        contenedorAlerta.append(wrapper);
                    } else {
                        alert("Por favor, seleccioná un horario."); // Fallback por si no encuentra el div
                    }
                    return;
                }

                // guardar selección
                localStorage.setItem("reservaTemporal", JSON.stringify({ cancha, horario }));
            });
        });
    }

    // FORMULARIO-RESERVA.HTML

    const formReserva = document.getElementById("reservaForm");
    if (formReserva) {

        // datos del modal
        const canchaSelect = document.getElementById("cancha");
        const horaInput = document.getElementById("hora");
        const reservaTemporal = JSON.parse(localStorage.getItem("reservaTemporal"));

        if (reservaTemporal) {
            // value del HTML
            canchaSelect.value = reservaTemporal.cancha;
            horaInput.value = reservaTemporal.horario;
        }

        // Validación con Bootstrap
        formReserva.addEventListener("submit", (event) => {
            event.preventDefault();
            event.stopPropagation();

            // checkValidity() = Bootstrap 
            if (formReserva.checkValidity()) {

                // guardar la reserva
                const reserva = {
                    id: Date.now(), // Un ID único para poder borrarla
                    nombre: document.getElementById("nombre").value,
                    fecha: document.getElementById("fecha").value,
                    hora: document.getElementById("hora").value,
                    jugadores: document.getElementById("jugadores").value,
                    cancha: document.getElementById("cancha").value,
                    comentarios: document.getElementById("comentarios").value
                };

                const reservasPrevias = JSON.parse(localStorage.getItem("reservas")) || [];
                reservasPrevias.push(reserva);
                localStorage.setItem("reservas", JSON.stringify(reservasPrevias));

                localStorage.removeItem("reservaTemporal");

                // alerta de Bootstrap
                mostrarAlerta("¡Reserva guardada exitosamente!", "success", formReserva);

                formReserva.reset();
                formReserva.classList.remove('was-validated'); // Limpiar validación

            } else {
                // estilos de error de Bootstrap
                formReserva.classList.add('was-validated');
            }
        }, false);
    }

    // MIS-RESERVAS.HTML

    const contenedorReservas = document.getElementById("contenedor-reservas");
    if (contenedorReservas) {
        cargarReservas();
    }

});



// FUNCION PARA MOSTRAR LA RESERVA EN MIS-RESERVAS.HTML
function cargarReservas() {
    const contenedor = document.getElementById("contenedor-reservas");
    const alertaVacio = document.getElementById("alerta-vacio");
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    contenedor.innerHTML = "";

    if (reservas.length === 0) {
        alertaVacio.classList.remove("d-none"); // alerta si no hay reservas
    } else {
        alertaVacio.classList.add("d-none");
        reservas.forEach((reserva) => {
            // Fecha para que sea más legible
            const fechaFormateada = new Date(reserva.fecha + 'T00:00:00-03:00').toLocaleDateString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Card con Bootstrap para cada reserva
            const cardHTML = `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card bg-dark border border-primary shadow-sm h-100">
                        <div class="card-header bg-primary text-white fw-bold">
                            Reserva: ${reserva.nombre}
                        </div>
                        <div class="card-body">
                            <h5 class="card-title text-light">${reserva.cancha}</h5>
                            <p class="card-text text-light">
                                <strong>Fecha:</strong> ${fechaFormateada}<br>
                                <strong>Hora:</strong> ${reserva.hora} hs<br>
                                <strong>Jugadores:</strong> ${reserva.jugadores}
                            </p>
                            ${reserva.comentarios ? `<p class="card-text text-light small"><strong>Comentarios:</strong> ${reserva.comentarios}</p>` : ''}
                        </div>
                        <div class="card-footer text-end">
                            <button class="btn btn-sm btn-outline-danger btn-cancelar" data-id="${reserva.id}">
                                Cancelar reserva
                            </button>
                        </div>
                    </div>
                </div>
            `;
            contenedor.innerHTML += cardHTML;
        });

        asignarEventosCancelar();
    }
}

// cancelar
function asignarEventosCancelar() {
    const botones = document.querySelectorAll('.btn-cancelar');
    botones.forEach(boton => {
        boton.addEventListener('click', () => {
            const idCancelar = parseInt(boton.getAttribute('data-id'));
            cancelarReserva(idCancelar);
        });
    });
}

/** borra una reserva del localStorage y recarga la vista
 @param {number} id 
 el ID de la reserva a cancelar **/

function cancelarReserva(id) {
    if (!confirm("¿Estás seguro de que querés cancelar esta reserva?")) {
        return;
    }

    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    // Filtro el array, dejando todas menos la que tiene el ID a cancelar
    reservas = reservas.filter(reserva => reserva.id !== id);
    // Guardo el nuevo array
    localStorage.setItem("reservas", JSON.stringify(reservas));
    // Recargo la vista de reservas
    cargarReservas();
}


/**
 * muestro alertas de Bootstrap
 * @param {string} mensaje - el texto a mostrar
 * @param {string} tipo - 'success', 'danger', 'warning', 'info', etc.
 * @param {HTMLElement} contenedor - dónde insertar la alerta
 */
function mostrarAlerta(mensaje, tipo, contenedor) {
    // Limpio alertas previas
    const alertaPrevia = contenedor.querySelector('.alert');
    if (alertaPrevia) {
        alertaPrevia.remove();
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show mt-3" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    // Inserto la alerta al principio del contenedor
    contenedor.prepend(wrapper);

    setTimeout(() => {
        wrapper.querySelector('.alert')?.remove();
    }, 3000);
}