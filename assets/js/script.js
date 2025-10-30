// // script.js
// document.addEventListener("DOMContentLoaded", () => {

//     //  HOME: Guardar cancha + horario

//   const modalForms = document.querySelectorAll("#modalTechada form");

//   modalForms.forEach(form => {
//     form.addEventListener("submit", (e) => {
//       const cancha = form.querySelector('input[name="cancha"]').value;
//       const horario = form.querySelector('input[name="hora"]:checked')?.value;

//       if (!horario) return;

//       // Guardamos la selección temporal en localStorage
//       localStorage.setItem("reservaTemporal", JSON.stringify({ cancha, horario }));
//     });
//   });

//     //  FORMULARIO: Precargar y guardar datos

//   const formReserva = document.getElementById("reservaForm");

//   if (formReserva) {
//     const canchaSelect = document.getElementById("cancha");
//     const horaInput = document.getElementById("hora");

//     // Recuperar los datos del modal si existen
//     const reservaTemporal = JSON.parse(localStorage.getItem("reservaTemporal"));

//     if (reservaTemporal) {
//       canchaSelect.value = reservaTemporal.cancha;
//       horaInput.value = reservaTemporal.horario;
//     }

//     // Guardar reserva completa en localStorage
//     formReserva.addEventListener("submit", (e) => {
//       e.preventDefault();

//       const reserva = {
//         nombre: document.getElementById("nombre").value,
//         fecha: document.getElementById("fecha").value,
//         hora: document.getElementById("hora").value,
//         jugadores: document.getElementById("jugadores").value,
//         cancha: document.getElementById("cancha").value,
//         comentarios: document.getElementById("comentarios").value
//       };

//       const reservasPrevias = JSON.parse(localStorage.getItem("reservas")) || [];
//       reservasPrevias.push(reserva);
//       localStorage.setItem("reservas", JSON.stringify(reservasPrevias));

//       // Limpiamos la reserva temporal
//       localStorage.removeItem("reservaTemporal");

//       // Mensaje visual con Bootstrap
//       const alerta = document.createElement("div");
//       alerta.className = "alert alert-success mt-3 text-center fw-bold";
//       alerta.textContent = "¡Reserva guardada exitosamente!";
//       formReserva.appendChild(alerta);

//       formReserva.reset();

//       setTimeout(() => alerta.remove(), 2000);
//     });
//   }
// });
