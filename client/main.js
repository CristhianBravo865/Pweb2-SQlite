function fetchWikidataInfo(actorName) {
    const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(actorName)}&language=es&format=json&origin=*`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.search && data.search.length > 0) {
                const qid = data.search[0].id;
                getWikidataDetails(qid);
            } else {
                displayActorInfo(actorName, null, null);
            }
        })
        .catch(err => console.error('Error en búsqueda Wikidata:', err));
}

function getWikidataDetails(qid) {
    const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const entity = data.entities[qid];
            const claims = entity.claims;
            // Imagen
            let image = null;
            if (claims.P18 && claims.P18[0]) {
                const filename = claims.P18[0].mainsnak.datavalue.value;
                image = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
            }
            // Nombre
            const label = entity.labels.es?.value || entity.labels.en?.value || '';
            // Título del artículo en Wikipedia
            const wikipediaTitle = entity.sitelinks?.eswiki?.title || entity.sitelinks?.enwiki?.title;
            
            if (wikipediaTitle) {
                fetchWikipediaIntro(wikipediaTitle, image, label);
            } else {
                displayActorInfo(label, image, null);
            }
        })
        .catch(err => console.error('Error obteniendo datos Wikidata:', err));
}


function fetchWikipediaIntro(title, image, label) {
    const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const extract = data.extract || 'No hay biografía disponible.';
            displayActorInfo(label, image, extract);
        })
        .catch(err => {
            console.error('Error obteniendo Wikipedia:', err);
            displayActorInfo(label, image, null);
        });
}

function displayActorInfo(name, image, bio) {
    document.getElementById('actor-name').textContent = name;
    const img = document.getElementById('actor-image');
    if (image) {
        img.src = image;
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
    }
    document.getElementById('actor-bio').textContent = bio || 'No hay biografía disponible.';
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('actor-input');
    const suggestions = document.getElementById('actor-suggestions');
    const table = document.getElementById('film-table');
    const chartDiv = document.getElementById('chart_div');

    let selectedActorId = null;

    input.addEventListener('input', () => {
        const query = input.value.trim();
        suggestions.innerHTML = '';
        if (query.length < 2) return;

        fetch(`/search-actors?name=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(actors => {
                suggestions.innerHTML = '';
                actors.forEach(actor => {
                    const li = document.createElement('li');
                    li.textContent = actor.name;
                    li.addEventListener('click', () => {
                        input.value = actor.name;
                        selectedActorId = actor.id;
                        suggestions.innerHTML = '';
                        loadFilmography(actor.id);
                        fetchWikidataInfo(actor.name);
                    });
                    suggestions.appendChild(li);
                });
            })
            .catch(err => console.error('Error en búsqueda de actores:', err));
    });

    function loadFilmography(actorId) {
        fetch(`/filmography/${actorId}`)
            .then(response => response.json())
            .then(films => {
                // === TABLA ===
                const tableBody = document.querySelector('#film-table tbody');
                tableBody.innerHTML = '';

                const filmsByYear = {};
                films.forEach(film => {
                    if (!filmsByYear[film.year]) {
                        filmsByYear[film.year] = [];
                    }
                    filmsByYear[film.year].push({
                        title: film.title,
                        coactors: film.coactors || 'N/A'
                    });
                });

                Object.keys(filmsByYear).sort().forEach(year => {
                    filmsByYear[year].forEach(film => {
                        const row = document.createElement('tr');

                        const yearCell = document.createElement('td');
                        yearCell.textContent = year;

                        const titleCell = document.createElement('td');
                        titleCell.textContent = film.title;

                        const coactorsCell = document.createElement('td');
                        coactorsCell.textContent = film.coactors;

                        row.appendChild(yearCell);
                        row.appendChild(titleCell);
                        row.appendChild(coactorsCell);
                        tableBody.appendChild(row);
                    });
                });

                table.style.display = 'table';

                // === GRAFICO ===
                const filmCountByYear = {};
                films.forEach(film => {
                    const year = film.year;
                    filmCountByYear[year] = (filmCountByYear[year] || 0) + 1;
                });

                const dataArray = [['Año', 'Películas']];
                for (const year in filmCountByYear) {
                    dataArray.push([year, filmCountByYear[year]]);
                }

                const data = google.visualization.arrayToDataTable(dataArray);
                const options = {
                    title: 'Películas por Año',
                    hAxis: { title: 'Año' },
                    vAxis: { title: 'Cantidad de Películas' },
                    legend: 'none'
                };

                const chart = new google.visualization.ColumnChart(chartDiv);
                chart.draw(data, options);

                chartDiv.style.display = 'block';
            })
            .catch(error => console.error('Error al obtener filmografía:', error));
    }

    google.charts.load('current', { packages: ['corechart'] });
});