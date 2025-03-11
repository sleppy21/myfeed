// Pon aquí tu token de acceso con los permisos necesarios
const accessToken = 'EAASZCQLWDkywBOZBD4uw5j0hbF1MvnvD5ZBZABcKN8NShpZAjeT6YhZCRoFNM9VBIGERgtfalwJIDQoryyp0Xnt7o7XH7hVN5eGDmgwKx1N6qwiEWTkE5bWVu2kzsZAVHYuxUKHZBNoaxqfN4PC3d0W3xXa5Y8XHoDm19j9gdZBK5vriugTVEZAPLZCisTrP7ZC5bZCckyyYzxcLRP1aGnSM4WwZDZD';
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
  // Contenedor principal de la publicación (tarjeta)
  const postDiv = document.createElement('div');
  postDiv.className = 'fb-post card h-100'; 
  // h-100 para que la tarjeta ocupe la altura total de la columna

  // Cabecera de la tarjeta
  const headerDiv = document.createElement('div');
  headerDiv.className = 'card-header d-flex align-items-center';

  // Foto y nombre del autor
  if (myProfile && myProfile.picture && myProfile.picture.data) {
    const authorImg = document.createElement('img');
    authorImg.src = myProfile.picture.data.url;
    authorImg.alt = myProfile.name;
    authorImg.className = 'fb-author-pic me-2';
    headerDiv.appendChild(authorImg);
  }
  if (myProfile && myProfile.name) {
    const authorName = document.createElement('div');
    authorName.className = 'fw-bold';
    authorName.textContent = myProfile.name;
    headerDiv.appendChild(authorName);
  }
  postDiv.appendChild(headerDiv);

  // Cuerpo de la tarjeta
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'card-body d-flex flex-column';

  // Fecha de publicación
  if (post.created_time) {
    const dateEl = document.createElement('div');
    dateEl.className = 'text-muted small mb-2';
    const dateObj = new Date(post.created_time);
    dateEl.textContent = dateObj.toLocaleString();
    bodyDiv.appendChild(dateEl);
  }

  // Descripción
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
    reactEl.className = 'text-muted small mb-2';
    reactEl.textContent = `Reacciones: ${totalReactions}`;
    bodyDiv.appendChild(reactEl);
  }

  // Botón para compartir (en realidad abre la publicación en Facebook)
  if (post.permalink_url) {
    const shareBtn = document.createElement('a');
    shareBtn.className = 'btn btn-sm btn-primary mt-auto';
    shareBtn.href = post.permalink_url;
    shareBtn.target = '_blank';
    shareBtn.textContent = 'Compartir';
    bodyDiv.appendChild(shareBtn);
  }

  postDiv.appendChild(bodyDiv);
  return postDiv;
}

/* --- Función para renderizar todas las publicaciones en 3 columnas --- */
function renderPosts(data) {
  const postsContainer = document.getElementById('posts');
  postsContainer.innerHTML = ''; // Limpia

  data.data.forEach(post => {
    // Creamos la columna
    const col = document.createElement('div');
    col.className = 'col-md-4 d-flex'; 
    // d-flex para que la tarjeta crezca en altura uniformemente si deseas

    // Construimos el post
    const postHTML = buildPostHTML(post);

    // Insertamos la tarjeta en la columna
    col.appendChild(postHTML);

    // Insertamos la columna en el row (#posts)
    postsContainer.appendChild(col);
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
      myProfile = profileData; // Guardamos la info del perfil
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
