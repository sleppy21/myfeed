
# Mis Publicaciones de Facebook

Una aplicación web que muestra un feed de publicaciones de Facebook, utilizando la Facebook Graph API. La interfaz, inspirada en el diseño de Facebook, permite visualizar publicaciones en un formato tipo "masonry" (tarjetas en 3 columnas), con detalles como imágenes, mensajes, fecha de publicación y reacciones. Además, se incluye un modal para ampliar la información y ver las imágenes a mayor tamaño.

---

## Visita mi Feed Online

[feedfacebook.vercel.app](https://feedfacebook.vercel.app)

---

## Tabla de Contenidos
- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Instalación y Configuración](#instalación-y-configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Uso](#uso)
- [Consideraciones y Advertencias](#consideraciones-y-advertencias)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)

---

## Características
- **Feed de Publicaciones:** Muestra publicaciones extraídas de la cuenta de Facebook mediante la Graph API.
- **Diseño Responsive:** Uso de Bootstrap para asegurar que la interfaz se adapte a dispositivos móviles y de escritorio.
- **Tarjetas de Publicación:** Cada publicación se muestra en una tarjeta que incluye foto, nombre del autor, fecha, mensaje y número de reacciones.
- **Modal Detallado:** Al hacer clic en una imagen se abre un modal que muestra la publicación a mayor detalle.
- **Interacción con Facebook:** Enlaces directos para compartir y ver la publicación original en Facebook.
- **Personalización:** Variables CSS para ajustar estilos del modal, colores y tipografías.

---

## Tecnologías Utilizadas
- **HTML5:** Estructura y semántica de la aplicación.
- **CSS3:** Estilos personalizados y variables para modularidad.
- **JavaScript:** Lógica de conexión con la API, renderizado dinámico de publicaciones y manejo de eventos (modal, botones, etc.).
- **Bootstrap 5:** Framework CSS para diseño responsive y componentes.
- **Bootstrap Icons:** Iconos para botones de acción (compartir, enlace, etc.).

---

## Instalación y Configuración

### Clonar el Repositorio:
```bash
git clone https://github.com/tu_usuario/tu_repositorio.git
cd tu_repositorio

```

### Configurar el Token de Acceso:
- Abre el archivo de JavaScript donde se define la variable `accessToken` (por ejemplo, `../scripts/script.js`).
- Reemplaza el valor `'EL TOKEN VA ACA'` con tu token de acceso de Facebook.
- Asegúrate de que tu token tenga los permisos necesarios para acceder a los datos de perfil y publicaciones.

### Instalar Dependencias (Opcional):
- Si deseas personalizar o ampliar el proyecto, puedes utilizar un servidor local (por ejemplo, [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) para VS Code) para visualizar los cambios en tiempo real.

---

## Estructura del Proyecto

```
├── index.html                # Archivo principal que contiene la estructura del feed.
├── styles/
│   ├── styles.css            # Estilos generales y personalizados.
│   └── headercss.css         # Estilos específicos para la cabecera.
├── scripts/
│   └── script.js             # Lógica para la conexión con Facebook API y renderizado de publicaciones.
└── README.md                 # Este archivo.
```

- **index.html:** Define la estructura de la interfaz, incluye el navbar, sidebar y contenedor principal donde se muestran las publicaciones.
- **styles/styles.css y headercss.css:** Contienen la configuración visual, incluyendo variables CSS para personalización del modal, tipografías, colores y estilos de la tarjeta de publicación.
- **scripts/script.js:** Se encarga de:
  - Realizar peticiones a la API de Facebook para obtener datos del perfil y publicaciones.
  - Renderizar dinámicamente las publicaciones en un layout tipo “masonry”.
  - Manejar la interacción del usuario, como la apertura y cierre del modal de detalle.

---

## Uso

### Obtener el Token de Acceso:
- Genera o adquiere un token de acceso válido con permisos para acceder a la información necesaria (perfil, publicaciones, reacciones, etc.).

### Ejecutar la Aplicación:
- Abre el archivo `index.html` en tu navegador o utiliza un servidor local para visualizar la aplicación.
- La aplicación iniciará una petición a la API de Facebook para cargar el feed. Mientras se cargan los datos, se muestra un mensaje “Cargando publicaciones, por favor espera…”.

### Interacción:
- **Visualizar Publicaciones:** Las publicaciones se muestran en tarjetas organizadas en tres columnas.
- **Ver Detalles:** Al hacer clic en la imagen de una publicación, se abre un modal con detalles ampliados, incluyendo información del autor y fecha.
- **Acciones:** Botones para compartir y enlaces que redirigen a la publicación original en Facebook.

---

## Consideraciones y Advertencias
- **Advertencias en la API:** Al cambiar configuraciones o actualizar el token, ten en cuenta que la conexión con la API puede generar advertencias si los permisos o el token no son correctos.
- **Impacto en Pull Requests y Clones:** Si trabajas en equipo o tienes colaboradores, recuerda actualizar la rama por defecto en GitHub (de `master` a `main`, por ejemplo) y comunicar los cambios para evitar inconvenientes.
- **Privacidad y Seguridad:** Nunca compartas tu token de acceso en repositorios públicos. Considera usar variables de entorno o archivos de configuración seguros en entornos de producción.

---

## Contribuciones
¡Las contribuciones son bienvenidas!
- **Forkea el repositorio.**
- Crea una rama para tu nueva funcionalidad o corrección (`git checkout -b feature/nueva-funcion`).
- Realiza tus cambios y haz commit (`git commit -m 'Agrega nueva funcionalidad'`).
- Sube tu rama (`git push origin feature/nueva-funcion`).
- Abre un Pull Request describiendo tus cambios.

---

¡Gracias por visitar este proyecto! Si tienes alguna duda o sugerencia, no dudes en abrir un issue o contactarme.
```
