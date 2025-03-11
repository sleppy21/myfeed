const accessToken = 'EAASZCQLWDkywBO8BIcCI8O8ZBAGQMffAfNeIs3pZCwEnqAIpVBEAZA59Ee8uR1DiF6RUVfXVVHm0bJes6P5jUCbQcByAsZCyx2hfLIa3tMYamMYg0nI2CWts9ZBNQrN9cak1JeOYLJVnqzsQFhAK2PYkHEoZBdbsXTJZCi1fmRrOgoTWHSSCarF4akat';
const apiVersion = 'v16.0';

// Endpoints para obtener datos de Facebook
const profileEndpoint = `https://graph.facebook.com/${apiVersion}/me?fields=name,picture.width(60).height(60)&access_token=${accessToken}`;

const postsEndpoint = `
https://graph.facebook.com/${apiVersion}/me/posts?fields=\
id,\
message,\
created_time,\
full_picture,\
permalink_url,\
shares,\
reactions.type(LIKE).summary(true).limit(0).as(like_reactions),\
reactions.type(LOVE).summary(true).limit(0).as(love_reactions),\
reactions.type(HAHA).summary(true).limit(0).as(haha_reactions),\
reactions.type(WOW).summary(true).limit(0).as(wow_reactions),\
reactions.type(SAD).summary(true).limit(0).as(sad_reactions),\
reactions.type(ANGRY).summary(true).limit(0).as(angry_reactions),\
comments.summary(true)\
&access_token=${accessToken}
`.replace(/\s+/g, '');

let myProfile = null;
let allPosts = [];

/**
 * Construye la tarjeta HTML para una publicación.
 */
function buildPostHTML(post) {
  // Cada tarjeta se coloca en una columna (grid item)
  const col = document.createElement('div');
  col.className = 'post-col';

  const card = document.createElement('div');
  card.className = 'fb-post d-flex flex-column';

  // Cabecera: foto, nombre y fecha
  const headerDiv = document.createElement('div');
  headerDiv.className = 'fb-post-header d-flex flex-column';

  const headerTop = document.createElement('div');
  headerTop.className = 'd-flex align-items-center';

  // Imagen de perfil
  if (myProfile?.picture?.data?.url) {
    const authorImg = document.createElement('img');
    authorImg.src = myProfile.picture.data.url;
    authorImg.alt = myProfile.name || 'Autor';
    authorImg.className = 'fb-post-author-pic me-2';
    headerTop.appendChild(authorImg);
  }

  // Nombre de perfil
  if (myProfile?.name) {
    const authorName = document.createElement('div');
    authorName.className = 'fw-bold';
    authorName.textContent = myProfile.name;
    headerTop.appendChild(authorName);
  }
  
  headerDiv.appendChild(headerTop);

  // Fecha de la publicación
  if (post.created_time) {
    const dateEl = document.createElement('div');
    dateEl.className = 'fb-post-date';
    const dateObj = new Date(post.created_time);
    dateEl.textContent = dateObj.toLocaleString();
    headerDiv.appendChild(dateEl);
  }

  card.appendChild(headerDiv);

  // Cuerpo de la tarjeta
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'fb-post-body d-flex flex-column';

  // Mensaje
  if (post.message) {
    const msgEl = document.createElement('p');
    msgEl.className = 'fb-post-message mb-2';
    msgEl.textContent = post.message;
    bodyDiv.appendChild(msgEl);
  }

  // Imagen de la publicación
  if (post.full_picture) {
    const imgEl = document.createElement('img');
    imgEl.src = post.full_picture;
    imgEl.alt = 'Imagen de la publicación';
    imgEl.className = 'fb-post-image mb-2';
    bodyDiv.appendChild(imgEl);
  }

  // Contenedor de acciones (reacciones + comentarios + compartir)
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'fb-post-actions';

  // Suma total de reacciones
  const totalReactions = 
    (post.like_reactions?.summary?.total_count ?? 0) +
    (post.love_reactions?.summary?.total_count ?? 0) +
    (post.haha_reactions?.summary?.total_count ?? 0) +
    (post.wow_reactions?.summary?.total_count ?? 0) +
    (post.sad_reactions?.summary?.total_count ?? 0) +
    (post.angry_reactions?.summary?.total_count ?? 0);

  // "Me gusta" con ícono oficial + contador
  const likeCountSpan = document.createElement('span');
  likeCountSpan.className = 'fb-like-count';
  likeCountSpan.innerHTML = `
  <svg width="20" height="20" viewBox="0 0 40 40" class="fb-like-icon">
    <defs>
      <linearGradient id="thumbGradient" x1="50%" x2="50%" y1="0%" y2="100%">
        <stop offset="0%" stop-color="#18AFFF"/>
        <stop offset="100%" stop-color="#0062E0"/>
      </linearGradient>
    </defs>
    <!-- Círculo con degradado azul -->
    <circle fill="url(#thumbGradient)" cx="20" cy="20" r="20"/>
    <!-- Grupo que inserta el ícono del pulgar blanco -->
    <g transform="translate(0,0) scale(0.7)">
      <svg viewBox="-3 -3 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fill="#fff" d="m20.27 16.265l.705-4.08a1.666 1.666 0 0 0-1.64-1.95h-5.181a.833.833 0 0 1-.822-.969l.663-4.045a4.8 4.8 0 0 0-.09-1.973a1.64 1.64 0 0 0-1.092-1.137l-.145-.047a1.35 1.35 0 0 0-.994.068c-.34.164-.588.463-.68.818l-.476 1.834a7.6 7.6 0 0 1-.656 1.679c-.415.777-1.057 1.4-1.725 1.975l-1.439 1.24a1.67 1.67 0 0 0-.572 1.406l.812 9.393A1.666 1.666 0 0 0 8.597 22h4.648c3.482 0 6.453-2.426 7.025-5.735"/>
        <path fill="#fff" fill-rule="evenodd" d="M2.968 9.485a.75.75 0 0 1 .78.685l.97 11.236a1.237 1.237 0 1 1-2.468.107V10.234a.75.75 0 0 1 .718-.749" clip-rule="evenodd"/>
      </svg>
    </g>
  </svg>
  <span class="like-text">${totalReactions}</span>
`;
  actionsDiv.appendChild(likeCountSpan);

  // Comentarios: cantidad real obtenida de la API
  const commentsCount = post.comments?.summary?.total_count ?? 0;
  const commentsCountSpan = document.createElement('span');
  commentsCountSpan.className = 'fb-comments-count';
  commentsCountSpan.textContent = `${commentsCount} ${commentsCount === 1 ? 'comment' : 'comments'}`;
  actionsDiv.appendChild(commentsCountSpan);

  // Botón "Share"
  if (post.permalink_url) {
    const shareBtn = document.createElement('a');
    shareBtn.className = 'fb-post-share-btn';
    shareBtn.href = post.permalink_url;
    shareBtn.target = '_blank';
    // Ícono distinto para Share
    shareBtn.innerHTML = `<i class="bi bi-arrow-up-right"></i> Compartir`;
    actionsDiv.appendChild(shareBtn);
  }

  // Se añaden las acciones al body
  bodyDiv.appendChild(actionsDiv);
  card.appendChild(bodyDiv);
  col.appendChild(card);

  return col;
}

/**
 * Renderiza las publicaciones en la página.
 */
function renderPosts(data) {
  const postsContainer = document.getElementById('posts');
  postsContainer.innerHTML = '';
  data.forEach(post => {
    const postHTML = buildPostHTML(post);
    postsContainer.appendChild(postHTML);
  });
}

/**
 * Inicializa el feed de Facebook.
 */
function initFacebookFeed() {
  document.getElementById('message').textContent = 'Cargando publicaciones, por favor espera...';
  fetch(profileEndpoint)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(`Error perfil: ${resp.statusText}`);
      }
      return resp.json();
    })
    .then(profileData => {
      myProfile = profileData;
      return fetch(postsEndpoint);
    })
    .then(resp => {
      if (!resp.ok) {
        throw new Error(`Error publicaciones: ${resp.statusText}`);
      }
      return resp.json();
    })
    .then(postsData => {
      allPosts = postsData.data || [];
      document.getElementById('message').textContent = '';
      renderPosts(allPosts);
    })
    .catch(err => {
      console.error('Error:', err);
      document.getElementById('message').textContent = 'Error al cargar las publicaciones. Verifica el token y los permisos.';
    });
}

// Inicialización del feed al cargar la página
initFacebookFeed();

// Modal para ver detalles adicionales (por ejemplo, videos)
const modal = document.getElementById('videoModal');
const modalClose = document.getElementById('modalClose');
if (modalClose) {
  modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

// Cierra el modal al hacer clic fuera de él.
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});
