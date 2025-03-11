const accessToken = 'EAASZCQLWDkywBOZBD4uw5j0hbF1MvnvD5ZBZABcKN8NShpZAjeT6YhZCRoFNM9VBIGERgtfalwJIDQoryyp0Xnt7o7XH7hVN5eGDmgwKx1N6qwiEWTkE5bWVu2kzsZAVHYuxUKHZBNoaxqfN4PC3d0W3xXa5Y8XHoDm19j9gdZBK5vriugTVEZAPLZCisTrP7ZC5bZCckyyYzxcLRP1aGnSM4WwZDZD';
const apiVersion = 'v16.0';

// 1. Endpoint para obtener el perfil (nombre, foto)
const profileEndpoint = `https://graph.facebook.com/${apiVersion}/me?fields=name,picture.width(60).height(60)&access_token=${accessToken}`;

// 2. Endpoint para obtener las publicaciones con reacciones por tipo
// Usamos "as()" para renombrar cada set de reacciones
const postsEndpoint = `
https://graph.facebook.com/${apiVersion}/me/posts?fields=
id,
message,
created_time,
full_picture,
permalink_url,
shares,
reactions.type(LIKE).summary(true).limit(0).as(like_reactions),
reactions.type(LOVE).summary(true).limit(0).as(love_reactions),
reactions.type(HAHA).summary(true).limit(0).as(haha_reactions),
reactions.type(WOW).summary(true).limit(0).as(wow_reactions),
reactions.type(SAD).summary(true).limit(0).as(sad_reactions),
reactions.type(ANGRY).summary(true).limit(0).as(angry_reactions)
&access_token=${accessToken}
`.replace(/\s+/g, ''); 

let myProfile = null;

function buildReactionsRow(post) {
  const container = document.createElement('div');
  container.className = 'fb-post-reactions';

  // Obtenemos la cuenta de cada tipo de reacción (o 0 si no existe)
  const likeCount = post.like_reactions?.summary?.total_count ?? 0;
  const loveCount = post.love_reactions?.summary?.total_count ?? 0;
  const hahaCount = post.haha_reactions?.summary?.total_count ?? 0;
  const wowCount  = post.wow_reactions?.summary?.total_count ?? 0;
  const sadCount  = post.sad_reactions?.summary?.total_count ?? 0;
  const angryCount= post.angry_reactions?.summary?.total_count ?? 0;

  function addReaction(iconClass, count) {
    if (count > 0) {
      const span = document.createElement('span');
      span.className = 'me-3 fb-reaction-item';
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

/* --- Función para construir el HTML de cada post --- */
function buildPostHTML(post) {
  // Col contenedor (Bootstrap: col-md-6 para posts más anchos)
  const col = document.createElement('div');
  col.className = 'col-md-6 d-flex';

  // Tarjeta principal
  const card = document.createElement('div');
  card.className = 'fb-post card h-100 d-flex flex-column'; 

  // --- Cabecera (foto, nombre y fecha) ---
  const headerDiv = document.createElement('div');
  headerDiv.className = 'card-header d-flex flex-column fb-post-header';

  // Contenedor para imagen y nombre en una fila
  const headerTop = document.createElement('div');
  headerTop.className = 'd-flex align-items-center';

  // Foto de perfil
  if (myProfile?.picture?.data?.url) {
    const authorImg = document.createElement('img');
    authorImg.src = myProfile.picture.data.url;
    authorImg.alt = myProfile.name || 'Autor';
    authorImg.className = 'fb-post-author-pic me-2';
    headerTop.appendChild(authorImg);
  }
  // Nombre del autor
  if (myProfile?.name) {
    const authorName = document.createElement('div');
    authorName.className = 'fw-bold';
    authorName.textContent = myProfile.name;
    headerTop.appendChild(authorName);
  }
  
  headerDiv.appendChild(headerTop);

  // Fecha (ahora justo debajo del nombre)
  if (post.created_time) {
    const dateEl = document.createElement('div');
    dateEl.className = 'fb-post-date';
    const dateObj = new Date(post.created_time);
    dateEl.textContent = dateObj.toLocaleString();
    headerDiv.appendChild(dateEl);
  }

  card.appendChild(headerDiv);

  // --- Cuerpo de la tarjeta ---
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'card-body fb-post-body d-flex flex-column';

  // Mensaje / descripción
  if (post.message) {
    const msgEl = document.createElement('p');
    msgEl.className = 'fb-post-message mb-2';
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

  // Sección de reacciones
  const reactionsRow = buildReactionsRow(post);
  if (reactionsRow.children.length > 0) {
    bodyDiv.appendChild(reactionsRow);
  }

  // Botón para compartir (abre el post en Facebook)
  if (post.permalink_url) {
    const shareBtn = document.createElement('a');
    shareBtn.className = 'fb-post-share-btn mt-auto'; 
    shareBtn.href = post.permalink_url;
    shareBtn.target = '_blank';
    // Ícono de compartir (Bootstrap Icons) con texto "Compartir"
    shareBtn.innerHTML = `<i class="bi bi-share-fill"></i> Compartir`;
    bodyDiv.appendChild(shareBtn);
  }

  card.appendChild(bodyDiv);
  col.appendChild(card);

  return col;
}

/* --- Renderizar todos los posts --- */
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
