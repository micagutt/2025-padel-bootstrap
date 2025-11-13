document.addEventListener("DOMContentLoaded", () => {

    let modalConfirmar;
    let idParaCancelar;
    let modalReservaExitosa;

    // lista de horarios fijos
    const horariosFijos = ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"];

    // modal de cancelación (mis-reservas.html)
    const modalElement = document.getElementById('modalConfirmarCancelacion');
    if (modalElement) {
        modalConfirmar = new bootstrap.Modal(modalElement);

        const btnConfirmar = document.getElementById('btn-confirmar-cancelacion');

        btnConfirmar.addEventListener('click', () => {
            if (idParaCancelar) {
                cancelarReserva(idParaCancelar);
            }
            modalConfirmar.hide();
            // foco fuera del modal
            document.activeElement.blur();
        });
    }

    // modal de éxito
    const modalExitoElement = document.getElementById('modalReservaExitosa');
    if (modalExitoElement) {
        modalReservaExitosa = new bootstrap.Modal(modalExitoElement);
    }

    // modal de horarios (home.html)
    const modalHorarios = document.getElementById('modalTechada');
    if (modalHorarios) {
        modalHorarios.addEventListener('show.bs.modal', function (event) {

            const card = event.relatedTarget;
            const nombreCancha = card.getAttribute('data-cancha');
            const modalTitle = modalHorarios.querySelector('.modal-title');
            const hiddenInputCancha = modalHorarios.querySelector('input[name="cancha"]');
            modalTitle.textContent = `${nombreCancha} - Seleccioná un horario`;
            hiddenInputCancha.value = nombreCancha;

            const hoy = getHoyYYYYMMDD();
            const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

            const horariosOcupados = reservas
                .filter(r => r.cancha === nombreCancha && r.fecha === hoy)
                .map(r => r.hora);

            const inputsHorarios = modalHorarios.querySelectorAll(".btn-check");
            inputsHorarios.forEach(input => {
                const label = document.querySelector(`label[for="${input.id}"]`);
                const horario = input.value;

                input.disabled = false;
                input.checked = false;
                label.classList.remove('disabled', 'btn-outline-danger', 'btn-outline-secondary');
                label.classList.add('btn-outline-primary');
                label.textContent = horario;

                if (horariosOcupados.includes(horario)) {
                    input.disabled = true;
                    label.classList.add('disabled', 'btn-outline-secondary');
                    label.classList.remove('btn-outline-primary');
                    label.textContent = `${horario} (Ocupado)`;
                }
            });
        });

        // submit del modal
        const modalForms = modalHorarios.querySelectorAll("form");
        modalForms.forEach(form => {
            form.addEventListener("submit", (event) => {
                const cancha = form.querySelector('input[name="cancha"]').value;
                const horario = form.querySelector('input[name="hora"]:checked')?.value;
                const contenedorAlerta = document.getElementById('modal-alerta-horario');

                if (contenedorAlerta) contenedorAlerta.innerHTML = "";

                if (!horario) {
                    event.preventDefault();
                    if (contenedorAlerta) {
                        const wrapper = document.createElement('div');
                        wrapper.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                            Por favor, seleccioná un horario para continuar.
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
                        contenedorAlerta.append(wrapper);
                    }
                    return;
                }

                const hoy = getHoyYYYYMMDD();
                const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
                const horariosOcupados = reservas
                    .filter(r => r.cancha === cancha && r.fecha === hoy)
                    .map(r => r.hora);

                if (horariosOcupados.includes(horario)) {
                    event.preventDefault();
                    if (contenedorAlerta) {
                        const wrapper = document.createElement('div');
                        wrapper.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                            El horario de las ${horario} hs ya está ocupado. Por favor, elegí otro.
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
                        contenedorAlerta.append(wrapper);
                    }
                    return;
                }

                localStorage.setItem("reservaTemporal", JSON.stringify({ cancha, horario }));
            });
        });
    }

    // formulario de reserva (formulario-reserva.html)
    const formReserva = document.getElementById("reservaForm");
    if (formReserva) {

        const canchaSelect = document.getElementById("cancha");
        const fechaInput = document.getElementById("fecha");
        const horaSelect = document.getElementById("hora");

        horaSelect.innerHTML = '<option value="" disabled selected>Seleccioná un horario</option>';
        horariosFijos.forEach(h => {
            const option = document.createElement('option');
            option.value = h;
            option.text = h;
            horaSelect.appendChild(option);
        });

        function actualizarHorariosSelect() {
            const cancha = canchaSelect.value;
            const fecha = fechaInput.value;

            if (!cancha || !fecha) {
                Array.from(horaSelect.options).forEach(option => {
                    if (option.value) {
                        option.disabled = false;
                        option.style.color = "#000";
                        option.text = option.value;
                    }
                });
                return;
            };

            const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
            const horariosOcupados = reservas
                .filter(r => r.cancha === cancha && r.fecha === fecha)
                .map(r => r.hora);

            Array.from(horaSelect.options).forEach(option => {
                if (option.value) {
                    option.disabled = false;
                    option.style.color = "#000";
                    option.text = option.value;

                    if (horariosOcupados.includes(option.value)) {
                        option.disabled = true;
                        option.style.color = "#6c757d";
                        option.text = `${option.value} (Ocupado)`;
                    }
                }
            });
        }

        canchaSelect.addEventListener('change', actualizarHorariosSelect);
        fechaInput.addEventListener('change', actualizarHorariosSelect);

        const reservaTemporal = JSON.parse(localStorage.getItem("reservaTemporal"));
        if (reservaTemporal) {
            canchaSelect.value = reservaTemporal.cancha;
            horaSelect.value = reservaTemporal.horario;
        }

        actualizarHorariosSelect();

        formReserva.addEventListener("submit", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (formReserva.checkValidity()) {
                const reserva = {
                    id: Date.now(),
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

                // modal de exito
                if (modalReservaExitosa) {
                    modalReservaExitosa.show();
                }

                formReserva.reset();
                formReserva.classList.remove('was-validated');

                // recargar horarios
                horaSelect.innerHTML = '<option value="" disabled selected>Seleccioná un horario</option>';
                horariosFijos.forEach(h => {
                    const option = document.createElement('option');
                    option.value = h;
                    option.text = h;
                    horaSelect.appendChild(option);
                });
            } else {
                formReserva.classList.add('was-validated');
            }
        }, false);
    }

    // carga inicial de reservas (mis-reservas.html)
    const contenedorReservas = document.getElementById("contenedor-reservas");
    if (contenedorReservas) {
        cargarReservas();
    }

    function cargarReservas() {
        const contenedor = document.getElementById("contenedor-reservas");
        const alertaVacio = document.getElementById("alerta-vacio");
        const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

        contenedor.innerHTML = "";

        if (reservas.length === 0) {
            alertaVacio.classList.remove("d-none");
        } else {
            alertaVacio.classList.add("d-none");
            reservas.forEach((reserva) => {
                const fechaFormateada = new Date(reserva.fecha + 'T00:00:00-03:00').toLocaleDateString('es-AR', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                });
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

    function asignarEventosCancelar() {
        const botones = document.querySelectorAll('.btn-cancelar');
        botones.forEach(boton => {
            boton.addEventListener('click', () => {
                idParaCancelar = parseInt(boton.getAttribute('data-id'));
                if (modalConfirmar) {
                    modalConfirmar.show();
                }
            });
        });
    }

    function cancelarReserva(id) {
        let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
        reservas = reservas.filter(reserva => reserva.id !== id);
        localStorage.setItem("reservas", JSON.stringify(reservas));
        cargarReservas();
    }

});

function getHoyYYYYMMDD() {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const localHoy = new Date(hoy.getTime() - (offset * 60 * 1000));
    return localHoy.toISOString().split('T')[0];
}