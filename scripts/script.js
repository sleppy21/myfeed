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
reactions.type(ANGRY).summary(true).limit(0).as(angry_reactions)\
&access_token=${accessToken}
`.replace(/\s+/g, '');

let myProfile = null;
let allPosts = [];

/**
 * Construye la fila de reacciones para una publicación.
 */
function buildReactionsRow(post) {
  const container = document.createElement('div');
  container.className = 'fb-post-reactions';

  const likeCount = post.like_reactions?.summary?.total_count ?? 0;
  const loveCount = post.love_reactions?.summary?.total_count ?? 0;
  const hahaCount = post.haha_reactions?.summary?.total_count ?? 0;
  const wowCount  = post.wow_reactions?.summary?.total_count ?? 0;
  const sadCount  = post.sad_reactions?.summary?.total_count ?? 0;
  const angryCount= post.angry_reactions?.summary?.total_count ?? 0;

  function addReaction(iconClass, count) {
    if (count > 0) {
      const span = document.createElement('span');
      span.className = 'fb-reaction-item';
      span.innerHTML = `<i class="${iconClass}"></i> ${count}`;
      container.appendChild(span);
    }
  }

  addReaction('bi bi-hand-thumbs-up', likeCount);
  addReaction('bi bi-heart-fill', loveCount);
  addReaction('bi bi-emoji-laughing', hahaCount);
  addReaction('bi bi-emoji-surprised', wowCount);
  addReaction('bi bi-emoji-frown', sadCount);
  addReaction('bi bi-emoji-angry', angryCount);

  return container;
}

/**
 * Construye la tarjeta HTML para una publicación.
 */
function buildPostHTML(post) {
  // Cada tarjeta se coloca en una columna para forzar 3 por fila.
  const col = document.createElement('div');
  col.className = 'post-col d-flex';

  // Eliminamos la clase "card" para evitar los estilos de borde predeterminados de Bootstrap
  const card = document.createElement('div');
  card.className = 'fb-post h-100 d-flex flex-column';

  // Cabecera: foto, nombre y fecha
  const headerDiv = document.createElement('div');
  headerDiv.className = 'fb-post-header d-flex flex-column';

  const headerTop = document.createElement('div');
  headerTop.className = 'd-flex align-items-center';

  if (myProfile?.picture?.data?.url) {
    const authorImg = document.createElement('img');
    authorImg.src = myProfile.picture.data.url;
    authorImg.alt = myProfile.name || 'Autor';
    authorImg.className = 'fb-post-author-pic me-2';
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
    const dateObj = new Date(post.created_time);
    dateEl.textContent = dateObj.toLocaleString();
    headerDiv.appendChild(dateEl);
  }

  card.appendChild(headerDiv);

  // Cuerpo de la tarjeta
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'fb-post-body d-flex flex-column';

  if (post.message) {
    const msgEl = document.createElement('p');
    msgEl.className = 'fb-post-message mb-2';
    msgEl.textContent = post.message;
    bodyDiv.appendChild(msgEl);
  }

  if (post.full_picture) {
    const imgEl = document.createElement('img');
    imgEl.src = post.full_picture;
    imgEl.alt = 'Imagen de la publicación';
    imgEl.className = 'fb-post-image mb-2';
    bodyDiv.appendChild(imgEl);
  }

  const reactionsRow = buildReactionsRow(post);
  if (reactionsRow.children.length > 0) {
    bodyDiv.appendChild(reactionsRow);
  }

  if (post.permalink_url) {
    const shareBtn = document.createElement('a');
    shareBtn.className = 'fb-post-share-btn';
    shareBtn.href = post.permalink_url;
    shareBtn.target = '_blank';
    // Se utiliza un ícono más elegante (bi-share) y el botón es de ancho reducido
    shareBtn.innerHTML = `<i class="bi bi-share"></i> Compartir`;
    bodyDiv.appendChild(shareBtn);
  }

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

/**
 * Función para refrescar las publicaciones.
 */
function refreshPosts() {
  initFacebookFeed();
}

/**
 * Función para filtrar publicaciones (ejemplo: mostrar solo publicaciones con mensaje largo).
 */
function filterPosts() {
  const filtered = allPosts.filter(post => post.message && post.message.length > 50);
  renderPosts(filtered);
}

// Inicialización del feed al cargar la página.
initFacebookFeed();

// Eventos para los botones adicionales
document.getElementById('refreshBtn').addEventListener('click', refreshPosts);
document.getElementById('filterBtn').addEventListener('click', filterPosts);

// Modal para ver detalles adicionales (por ejemplo, videos)
const modal = document.getElementById('videoModal');
const modalClose = document.getElementById('modalClose');
if (modalClose) {
  modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

// Función adicional para mostrar contenido en el modal (ejemplo)
function showModal(content) {
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = content;
  modal.style.display = 'flex';
}

// Cierra el modal al hacer clic fuera de él.
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});
