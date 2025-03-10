// Reemplaza 'TU_FACEBOOK_ACCESS_TOKEN' por tu token de acceso válido de Facebook.
const API_KEY = '1213168163806063|bhE-VYtghiF3Z5Rsm4wSiZxSM7E';
// Endpoint base de la Graph API de Facebook para búsquedas.
const API_BASE = 'https://graph.facebook.com/v15.0/';

// Número de resultados por solicitud.
const resultsPerPage = 10;
let nextPageUrl = null;

// Función para buscar páginas (p. ej., "perfiles" públicos) por nombre
function searchProfiles(query) {
  // Se utiliza el endpoint /search con type=page.
  const url = `${API_BASE}search?q=${encodeURIComponent(query)}&type=page&fields=id,name,about,fan_count&limit=${resultsPerPage}&access_token=${API_KEY}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error('Error:', data.error);
        document.getElementById("results").innerHTML = `<p>Error: ${data.error.message}</p>`;
        return;
      }
      if (data.data && data.data.length > 0) {
        displayResults(data.data);
        // Si existe paginación, guardar la URL para cargar más resultados
        nextPageUrl = data.paging && data.paging.next ? data.paging.next : null;
        updateLoadMoreButton();
      } else {
        document.getElementById("results").innerHTML = `<p>No se encontraron resultados.</p>`;
      }
    })
    .catch(error => {
      console.error('Error al buscar:', error);
      document.getElementById("results").innerHTML = `<p>Error al obtener resultados.</p>`;
    });
}

// Función para cargar más resultados (si existen)
function loadMoreProfiles() {
  if (!nextPageUrl) return;
  fetch(nextPageUrl)
    .then(response => response.json())
    .then(data => {
      if (data.data && data.data.length > 0) {
        displayResults(data.data, true);
        nextPageUrl = data.paging && data.paging.next ? data.paging.next : null;
        updateLoadMoreButton();
      }
    })
    .catch(error => {
      console.error('Error al cargar más resultados:', error);
    });
}

// Actualiza el botón de "Cargar más"
function updateLoadMoreButton() {
  const loadMoreContainer = document.getElementById("loadMoreContainer");
  loadMoreContainer.innerHTML = "";
  if (nextPageUrl) {
    const btn = document.createElement("button");
    btn.textContent = "Cargar más resultados";
    btn.className = "btn btn-secondary";
    btn.addEventListener("click", loadMoreProfiles);
    loadMoreContainer.appendChild(btn);
  }
}

// Función para mostrar los resultados en la sección "results"
// Si 'append' es true, se agregan los nuevos resultados sin borrar los existentes
function displayResults(results, append = false) {
  const resultsDiv = document.getElementById("results");
  if (!append) resultsDiv.innerHTML = "";
  results.forEach(item => {
    // Crear tarjeta para cada resultado
    const card = document.createElement("div");
    card.className = "result-card mb-3 card";
    card.style.cursor = "pointer";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    // Mostrar el nombre de la página
    const title = document.createElement("h5");
    title.className = "card-title";
    title.textContent = item.name || "Sin nombre";
    cardBody.appendChild(title);

    // Mostrar información adicional (por ejemplo, la cantidad de fans o "about")
    const info = document.createElement("p");
    info.className = "card-text";
    info.textContent = item.about ? item.about.substring(0, 100) + "..." : `Fans: ${item.fan_count || 0}`;
    cardBody.appendChild(info);

    card.appendChild(cardBody);

    // Al hacer clic, se puede abrir un modal o redirigir a la página de Facebook
    card.addEventListener("click", function() {
      window.open(`https://www.facebook.com/${item.id}`, "_blank");
    });

    resultsDiv.appendChild(card);
  });
}

// Evento para iniciar la búsqueda al hacer clic en el botón "Buscar"
document.getElementById("searchBtn").addEventListener("click", function() {
  const query = document.getElementById("searchInput").value;
  if (!query) return;
  searchProfiles(query);
});
