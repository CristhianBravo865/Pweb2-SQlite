# Visualizador de Filmografía de Actores

Esta es una aplicación web que permite buscar actores y visualizar su biografía, imagen, una tabla y un gráfico interactivo con sus películas por año, usando datos de **IMDb (SQLite)** y **Wikidata/Wikipedia**.

El archivo `server.js` se encarga de hacer las peticiones a la base de datos usando el módulo `sqlite3` y responder al cliente en formato **JSON**. Para esto, se instalaron los módulos `sqlite3` y `express`, que permiten la conexión con la base de datos y la creación del servidor respectivamente. En el cliente, se usa **AJAX** (con `fetch`) para comunicarse con el servidor y obtener los datos sin recargar la página.

---
## Tecnologías utilizadas

- **Frontend**: HTML, CSS, JavaScript, Google Charts
- **Backend**: Node.js + Express
- **Base de datos**: SQLite (IMDb)
- **APIs externas**: Wikidata y Wikipedia REST API

---
## Errores

- A veces, la información del actor resultante es muy corta y poco descriptiva, en otros directamente no se encuentra ninguna.
- En algunos casos, **no está disponible la imagen del actor**, lo que limita la experiencia visual.
- Respuestas lentas en las APIs externas (Wikipedia/Wikidata) 

## Capturas

### 🔎 Búsqueda de actores

Al escribir el nombre de un actor, se muestran sugerencias en vivo.

![image](https://github.com/user-attachments/assets/f1064e9c-081a-438c-89cb-9c175e36e19b)


---

### Biografía e imagen desde Wikidata/Wikipedia

Se muestra automáticamente la biografía e imagen del actor seleccionado.

![image](https://github.com/user-attachments/assets/626bb3b5-ff70-4ca2-86a6-7e0156ce616e)


---

### Tabla de películas

Se listan todas las películas del actor por año, incluyendo los coactores.

![image](https://github.com/user-attachments/assets/4ef0d12d-2c37-428b-ae55-11cc3b035e6b)


---

### Gráfico de películas por año (registradas en la base de datos imdb)

Visualización de la actividad del actor a lo largo del tiempo con Google Charts.
![image](https://github.com/user-attachments/assets/09d85f9e-d9d0-4b94-95ca-bf8cf82b85b5)

**Autor:** Cristhian Bravo

