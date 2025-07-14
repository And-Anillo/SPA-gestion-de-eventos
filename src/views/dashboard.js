import { getEvents, registerUserToEvent } from '../js/api.js';
import { getCurrentUser, logoutUser, isAdmin } from '../js/auth.js';

export async function showDashboard() {
    const app = document.getElementById('app');
    const user = getCurrentUser();

    if (!user) {
        window.location.hash = '#/login';
        return;
    }

    let events = [];
    try {
        events = await getEvents();
    } catch (error) {
        app.innerHTML = `<p>Error al cargar eventos</p>`;
        return;
    }

    app.innerHTML = `
    <section class="dashboard">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2>Bienvenido, ${user.name}</h2>
        <button id="logoutBtn" class="logout">Cerrar sesión</button>
      </div>
      <div id="events-container">
        ${events.map(event => renderEvent(event, user)).join('')}
      </div>
    </section>
  `;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        logoutUser();
        window.location.hash = '#/login';
    });

    document.querySelectorAll('.register-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const eventId = e.target.dataset.eventId;
            try {
                await registerUserToEvent(eventId, user.id);
                alert("Registro exitoso");
                showDashboard();
            } catch (err) {
                alert(err.message);
            }
        });
    });
}

// Renderizar un evento según si el usuario está registrado o no
function renderEvent(event, user) {
    const isRegistered = event.registeredUsers?.includes(user.id);
    const isFull = event.registeredUsers.length >= event.capacity;
    const canRegister = !isRegistered && !isFull && user.role === 'user';

    return `
    <div class="event-card">
      <h3><i>${event.name}</i></h3>
      <p><strong>Fecha:</strong> ${event.date}</p>
      <p><strong>Lugar:</strong> ${event.location}</p>
      <p><strong>Cupos:</strong> ${event.registeredUsers.length} / ${event.capacity}</p>

      ${user.role === 'user'
            ? (isRegistered
                ? `<p class="registered-msg">Ya estás registrado</p>`
                : `<button class="register-btn" data-event-id="${event.id}" ${canRegister ? '' : 'disabled'}>
                  Registrarse
                </button>`)
            : ''
        }

      ${isAdmin()
            ? `<a href="#/dashboard/events/edit?id=${event.id}"> Editar</a>`
            : ''
        }
    </div>
  `;
}
