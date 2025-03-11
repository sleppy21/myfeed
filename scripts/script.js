// Pon aquí tu token de acceso con los permisos necesarios
const accessToken = 'EAASZCQLWDkywBOyNP5eHrefvLIbVjRbGfKZALcf1n3W5oIXSxXGvnq89kDusZCGmcjYynOeebgicD1mTxjLzlKthqwaT7zyMjZANGspBle300xqBwdtOj7YLjj1rdqaMowI1HyoVfYpPZAWWBwZA3TenUM9F8QBp9dzl18BGYRaHZCLO7SNdlEWqIjkdd61yZBrDZC7xOn7QQS5jX3KlWQwZDZD';
const apiVersion = 'v16.0';

// Endpoint para obtener el perfil (nombre y foto)
const profileEndpoint = `https://graph.facebook.com/${apiVersion}/me?fields=name,picture.width(60).height(60)&access_token=${accessToken}`;

// Endpoint para obtener las publicaciones
// Reacciones se obtienen con "reactions.summary(true)"
// "message", "created_time", "full_picture", "permalink_url"
const postsEndpoint = `https://graph.facebook.com/${apiVersion}/me/posts?fields=id,message,created_time,full_picture,permalink_url,reactions.summary(true)&access_token=${accessToken}`;

// Variable global para guardar datos del perfil
let myProfile = null;

/* --- Función para construir el HTML de cada post --- */
function buildPostHTML(post) {
  // Estructura básica de la publicación
  // 1. Cabecera con foto de perfil y nombre
  // 2. Fecha de publicación
  // 3. Texto (message)
  // 4. Imagen (si existe)
  // 5. Reacciones
  // 6. Botón para compartir

  // Contenedor principal de la publicación
  const postDiv = document.createElement('div');
  postDiv.className = 'fb-post mb-4 p-3'; // Clase personalizada + margen e interno

  // --- Cabecera (autor + foto) ---
  const headerDiv = document.createElement('div');
  headerDiv.className = 'fb-post-header d-flex align-items-center mb-2';

  // Foto de perfil del autor (si se obtuvo del perfil)
  if (myProfile && myProfile.picture && myProfile.picture.data) {
    const authorImg = document.createElement('img');
    authorImg.src = myProfile.picture.data.url;
    authorImg.alt = myProfile.name;
    authorImg.className = 'fb-author-pic me-2';
    headerDiv.appendChild(authorImg);
  }

  // Nombre del autor y fecha en un contenedor
  const authorInfo = document.createElement('div');

  // Nombre del autor
  if (myProfile && myProfile.name) {
    const authorName = document.createElement('div');
    authorName.className = 'fw-bold'; // Negrita
    authorName.textContent = myProfile.name;
    authorInfo.appendChild(authorName);
  }

  // Fecha de publicación
  if (post.created_time) {
    const dateEl = document.createElement('div');
    dateEl.className = 'text-muted small';
    const dateObj = new Date(post.created_time);
    dateEl.textContent = dateObj.toLocaleString();
    authorInfo.appendChild(dateEl);
  }

  headerDiv.appendChild(authorInfo);

  // --- Cuerpo del post ---
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'fb-post-body';

  // Descripción (message)
  if (post.message) {
    const msgEl = document.createElement('p');
    msgEl.className = 'fb-post-text mb-2';
    msgEl.textContent = post.message;
    bodyDiv.appendChild(msgEl);
  }

  // Imagen (si existe)
  if (post.full_picture) {
    const imgEl = document.createElement('img');
    imgEl.src = post.full_picture;
    imgEl.alt = 'Imagen de la publicación';
    imgEl.className = 'fb-post-image mb-2';
    bodyDiv.appendChild(imgEl);
  }

  // Reacciones
  if (post.reactions && post.reactions.summary) {
    const totalReactions = post.reactions.summary.total_count;
    const reactEl = document.createElement('div');
    reactEl.className = 'text-muted small';
    reactEl.textContent = `Reacciones: ${totalReactions}`;
    bodyDiv.appendChild(reactEl);
  }

  // Botón para compartir (realmente abre la publicación en Facebook)
  if (post.permalink_url) {
    const shareBtn = document.createElement('a');
    shareBtn.className = 'btn btn-sm btn-primary mt-2';
    shareBtn.href = post.permalink_url;
    shareBtn.target = '_blank';
    shareBtn.textContent = 'Compartir';
    bodyDiv.appendChild(shareBtn);
  }

  // Agregar cabecera y cuerpo al contenedor principal
  postDiv.appendChild(headerDiv);
  postDiv.appendChild(bodyDiv);

  return postDiv;
}

/* --- Función para renderizar todas las publicaciones --- */
function renderPosts(data) {
  const postsContainer = document.getElementById('posts');
  postsContainer.innerHTML = '';

  data.data.forEach(post => {
    const postHTML = buildPostHTML(post);
    postsContainer.appendChild(postHTML);
  });
}

/* --- Inicializar la carga de perfil y publicaciones --- */
function initFacebookFeed() {
  // Primero obtenemos el perfil
  fetch(profileEndpoint)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(`Error perfil: ${resp.statusText}`);
      }
      return resp.json();
    })
    .then(profileData => {
      myProfile = profileData; // Guardamos la info en la variable global
      // Luego, obtenemos las publicaciones
      return fetch(postsEndpoint);
    })
    .then(resp => {
      if (!resp.ok) {
        throw new Error(`Error publicaciones: ${resp.statusText}`);
      }
      return resp.json();
    })
    .then(postsData => {
      document.getElementById('message').textContent = '';
      renderPosts(postsData);
    })
    .catch(err => {
      console.error('Error:', err);
      document.getElementById('message').textContent = 'Error al cargar las publicaciones. Verifica el token y los permisos.';
    });
}

initFacebookFeed();

/* (Opcional) Cerrar el modal si lo usas */
const modal = document.getElementById('videoModal');
const modalClose = document.getElementById('modalClose');
if (modalClose) {
  modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}
