// Coloca tu token de acceso con los permisos necesarios (user_posts, public_profile, etc.)
// Asegúrate de que el token no haya expirado.
const accessToken = 'TU_TOKEN_DE_FACEBOOK';

// Versión de la API (ajústala a la que uses en tu app)
const apiVersion = 'v16.0';

/*
  Endpoint para obtener las publicaciones del perfil con:
  - message (texto/descripción)
  - created_time (fecha de creación)
  - full_picture (imagen de la publicación)
  - permalink_url (link directo a la publicación)
  - shares (objeto con count de veces compartido)
  - reactions.summary(true) (para obtener la suma de reacciones)
*/
const endpoint = `https://graph.facebook.com/${apiVersion}/me/posts?fields=id,message,created_time,full_picture,permalink_url,shares,reactions.summary(true)&access_token=${accessToken}`;

/**
 * Función para renderizar las publicaciones en forma de tarjetas.
 */
function renderFeed(data) {
  const feedContainer = document.getElementById('posts');
  feedContainer.innerHTML = ''; // Limpia el contenido anterior

  // Recorremos cada publicación en data.data
  data.data.forEach(post => {
    // Creamos un contenedor para la tarjeta (col-md-4 para 3 columnas en pantallas medianas)
    const col = document.createElement('div');
    col.className = 'col-md-4';

    // Tarjeta de Bootstrap
    const card = document.createElement('div');
    card.className = 'card fb-post-card h-100';

    // Imagen superior, si existe
    if (post.full_picture) {
      const img = document.createElement('img');
      img.src = post.full_picture;
      img.alt = 'Publicación de Facebook';
      img.className = 'card-img-top';
      card.appendChild(img);
    }

    // Contenedor de texto
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body d-flex flex-column';

    // Mensaje de la publicación (descripción)
    if (post.message) {
      const msg = document.createElement('p');
      msg.className = 'card-text fb-post-message';
      msg.textContent = post.message;
      cardBody.appendChild(msg);
    }

    // Fecha de publicación
    if (post.created_time) {
      const dateP = document.createElement('p');
      dateP.className = 'text-muted small';
      const dateObj = new Date(post.created_time);
      dateP.textContent = `Publicado: ${dateObj.toLocaleString()}`;
      cardBody.appendChild(dateP);
    }

    // Reacciones (total_count dentro de reactions.summary)
    if (post.reactions && post.reactions.summary) {
      const totalReactions = post.reactions.summary.total_count;
      const reactP = document.createElement('p');
      reactP.className = 'mb-1';
      reactP.textContent = `Reacciones: ${totalReactions}`;
      cardBody.appendChild(reactP);
    }

    // Compartidos (si existe la propiedad "shares.count")
    if (post.shares && post.shares.count !== undefined) {
      const shareP = document.createElement('p');
      shareP.className = 'mb-1';
      shareP.textContent = `Compartido: ${post.shares.count} veces`;
      cardBody.appendChild(shareP);
    }

    // Botón para ver la publicación en Facebook
    if (post.permalink_url) {
      const linkBtn = document.createElement('a');
      linkBtn.className = 'btn btn-sm btn-outline-primary mt-auto';
      linkBtn.href = post.permalink_url;
      linkBtn.target = '_blank';
      linkBtn.textContent = 'Ver en Facebook';
      cardBody.appendChild(linkBtn);
    }

    // Se agrega el body a la tarjeta
    card.appendChild(cardBody);

    // Se agrega la tarjeta a la columna
    col.appendChild(card);

    // Se agrega la columna al contenedor
    feedContainer.appendChild(col);
  });
}

// Llamada a la API de Facebook para obtener las publicaciones
fetch(endpoint)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    document.getElementById('message').textContent = ''; 
    renderFeed(data);
  })
  .catch(error => {
    console.error('Error al obtener las publicaciones:', error);
    document.getElementById('message').textContent = 'Error al cargar las publicaciones. Verifica el token y los permisos.';
  });

// Ejemplo básico para cerrar el modal (si lo implementas en el futuro)
const modal = document.getElementById('videoModal');
const modalClose = document.getElementById('modalClose');
if(modalClose){
  modalClose.addEventListener('click', () => {
    modal.style.display = "none";
  });
}
