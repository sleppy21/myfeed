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

// Solo se deja el emote de like
const reactionTypes = ['like'];

/**
 * Retorna el SVG para cada tipo de reacción.
 */
function getReactionSVG(type) {
  switch(type) {
    case 'like':
      return `<svg width="20" height="20" viewBox="0 0 40 40" class="fb-reaction-icon">
                <defs>
                  <linearGradient id="likeGradient" x1="50%" x2="50%" y1="0%" y2="100%">
                    <stop offset="0%" stop-color="#18AFFF"/>
                    <stop offset="100%" stop-color="#0062E0"/>
                  </linearGradient>
                </defs>
                <circle fill="url(#likeGradient)" cx="20" cy="20" r="20"/>
                <g transform="translate(0,0) scale(0.7)">
                  <svg viewBox="-3 -3 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#fff" d="M20.27 16.265l.705-4.08a1.666 1.666 0 0 0-1.64-1.95h-5.181a.833.833 0 0 1-.822-.969l.663-4.045a4.8 4.8 0 0 0-.09-1.973 1.64 1.64 0 0 0-1.092-1.137l-.145-.047a1.35 1.35 0 0 0-.994.068c-.34.164-.588.463-.68.818l-.476 1.834a7.6 7.6 0 0 1-.656 1.679c-.415.777-1.057 1.4-1.725 1.975l-1.439 1.24a1.67 1.67 0 0 0-.572 1.406l.812 9.393A1.666 1.666 0 0 0 8.597 22h4.648c3.482 0 6.453-2.426 7.025-5.735"/>
                  </svg>
                </g>
              </svg>`;
    default:
      return '';
  }
}

/**
 * Construye la tarjeta HTML para una publicación.
 */
function buildPostHTML(post) {
  const col = document.createElement('div');
  col.className = 'post-col';

  const card = document.createElement('div');
  card.className = 'fb-post';

  // Botón (ícono) para ir a la publicación en Facebook
  if (post.permalink_url) {
    const linkBtn = document.createElement('a');
    linkBtn.className = 'fb-post-link-btn';
    linkBtn.href = post.permalink_url;
    linkBtn.target = '_blank';
    linkBtn.innerHTML = `<i class="bi bi-box-arrow-up-right"></i>`;
    card.appendChild(linkBtn);
  }

  // Cabecera: foto, nombre y fecha
  const headerDiv = document.createElement('div');
  headerDiv.className = 'fb-post-header';

  const headerTop = document.createElement('div');
  headerTop.className = 'd-flex align-items-center';

  if (myProfile?.picture?.data?.url) {
    const authorImg = document.createElement('img');
    authorImg.src = myProfile.picture.data.url;
    authorImg.alt = myProfile.name || 'Autor';
    authorImg.className = 'fb-post-author-pic';
    headerTop.appendChild(authorImg);
  }
  if (myProfile?.name) {
    const authorName = document.createElement('div');
    authorName.className = 'fw-bold';
    authorName.textContent = myProfile.name;
    headerTop.appendChild(authorName);
  }
  headerDiv.appendChild(headerTop);

  if (post.created_time) {
    const dateEl = document.createElement('div');
    dateEl.className = 'fb-post-date';
    dateEl.textContent = new Date(post.created_time).toLocaleString();
    headerDiv.appendChild(dateEl);
  }
  card.appendChild(headerDiv);

  // Cuerpo: mensaje e imagen
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'fb-post-body';

  if (post.message) {
    const msgEl = document.createElement('p');
    msgEl.className = 'fb-post-message';
    msgEl.textContent = post.message;
    bodyDiv.appendChild(msgEl);
  }
  if (post.full_picture) {
    const imgEl = document.createElement('img');
    imgEl.src = post.full_picture;
    imgEl.alt = 'Imagen de la publicación';
    imgEl.className = 'fb-post-image';
    // Al hacer clic se abre el modal sin interferir en el feed
    imgEl.addEventListener('click', () => openPhotoModal(post));
    bodyDiv.appendChild(imgEl);
  }

  // Acciones: reacciones, comentarios y botón compartir
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'fb-post-actions';

  // Reacciones (solo like)
  const reactionsContainer = document.createElement('div');
  reactionsContainer.className = 'fb-reactions-container';
  reactionTypes.forEach(type => {
    const count = post[`${type}_reactions`]?.summary?.total_count ?? 0;
    const reactionSpan = document.createElement('span');
    reactionSpan.className = 'fb-reaction';
    reactionSpan.innerHTML = getReactionSVG(type) + `<span class="reaction-count">${count}</span>`;
    reactionsContainer.appendChild(reactionSpan);
  });
  actionsDiv.appendChild(reactionsContainer);

  // Comentarios
  const commentsCount = post.comments?.summary?.total_count ?? 0;
  const commentsCountSpan = document.createElement('span');
  commentsCountSpan.className = 'fb-comments-count';
  commentsCountSpan.textContent = `${commentsCount} ${commentsCount === 1 ? 'comment' : 'comments'}`;
  actionsDiv.appendChild(commentsCountSpan);

  // Botón Compartir
  if (post.permalink_url) {
    const shareBtn = document.createElement('a');
    shareBtn.className = 'fb-post-share-btn';
    shareBtn.href = post.permalink_url;
    shareBtn.target = '_blank';
    shareBtn.innerHTML = `<i class="bi bi-share"></i> Compartir`;
    actionsDiv.appendChild(shareBtn);
  }

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
    postsContainer.appendChild(buildPostHTML(post));
  });
}

/**
 * Abre el modal mostrando la foto a la izquierda y la información a la derecha.
 */
function openPhotoModal(post) {
  const modal = document.getElementById('photoModal');
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = '';

  // Contenedor para la foto
  const photoContainer = document.createElement('div');
  photoContainer.className = 'photo-container';
  if (post.full_picture) {
    const img = document.createElement('img');
    img.src = post.full_picture;
    img.alt = 'Imagen de la publicación';
    img.style.width = '100%';
    photoContainer.appendChild(img);
  }

  // Contenedor para la información
  const infoContainer = document.createElement('div');
  infoContainer.className = 'info-container';
  
  if (myProfile?.name) {
    const author = document.createElement('h4');
    author.textContent = myProfile.name;
    infoContainer.appendChild(author);
  }
  if (post.created_time) {
    const date = document.createElement('p');
    date.textContent = new Date(post.created_time).toLocaleString();
    infoContainer.appendChild(date);
  }
  if (post.message) {
    const message = document.createElement('p');
    message.textContent = post.message;
    infoContainer.appendChild(message);
  }
  
  // Reacciones en el modal (solo like)
  const reactionsInfo = document.createElement('div');
  reactionsInfo.className = 'fb-reactions-container';
  reactionTypes.forEach(type => {
    const count = post[`${type}_reactions`]?.summary?.total_count ?? 0;
    const reactionSpan = document.createElement('span');
    reactionSpan.className = 'fb-reaction';
    reactionSpan.innerHTML = getReactionSVG(type) + `<span class="reaction-count">${count}</span>`;
    reactionsInfo.appendChild(reactionSpan);
  });
  infoContainer.appendChild(reactionsInfo);

  // Comentarios
  const commentsCount = post.comments?.summary?.total_count ?? 0;
  const commentsInfo = document.createElement('p');
  commentsInfo.textContent = `${commentsCount} ${commentsCount === 1 ? 'comment' : 'comments'}`;
  infoContainer.appendChild(commentsInfo);

  modalBody.appendChild(photoContainer);
  modalBody.appendChild(infoContainer);
  modal.style.display = 'flex';
}

/**
 * Inicializa el feed obteniendo perfil y publicaciones.
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

initFacebookFeed();

// Cerrar modal
const modal = document.getElementById('photoModal');
const modalClose = document.getElementById('modalClose');
modalClose.addEventListener('click', () => {
  modal.style.display = 'none';
});
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});
