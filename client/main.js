let googleChartsReady = false;

google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(() => {
    googleChartsReady = true;
});

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('actor-input');
    const suggestions = document.getElementById('actor-suggestions');
    const table = document.getElementById('film-table');
    const tbody = table.querySelector('tbody');
    const chartDiv = document.getElementById('chart_div');

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
                        suggestions.innerHTML = '';
                        loadAll(actor.name, actor.id);
                    });
                    suggestions.appendChild(li);
                });
            })
            .catch(err => console.error('Error en búsqueda de actores:', err));
    });

    function loadAll(actorName, actorId) {
        // Mensaje de cargando
        displayActorInfo('Cargando...', null, 'Buscando biografía...');
        tbody.innerHTML = '';
        table.style.display = 'none';
        chartDiv.style.display = 'none';

        Promise.all([
            getWikidataBioAndImage(actorName),
            fetch(`/filmography/${actorId}`).then(res => res.json())
        ]).then(([wikidata, filmography]) => {
            // Mostrar bio e imagen
            displayActorInfo(actorName, wikidata.image, wikidata.bio);

            const waitForCharts = () => {
                if (googleChartsReady) {
                    // Mostrar tabla
                    tbody.innerHTML = '';
                    filmography.forEach(film => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${film.year}</td>
                            <td>${film.title}</td>
                            <td>${film.coactors}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                    table.style.display = filmography.length ? 'table' : 'none';
                    drawChart(filmography);
                    chartDiv.style.display = filmography.length ? 'block' : 'none';
                } else {
                    setTimeout(waitForCharts, 100); // Reintentar hasta que esté cargado
                }
            };

            waitForCharts();
        }).catch(err => {
            console.error('Error al cargar datos:', err);
        });
    }

    function getWikidataBioAndImage(actorName) {
        return fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(actorName)}&language=es&format=json&origin=*`)
            .then(res => res.json())
            .then(data => {
                const qid = data.search?.[0]?.id;
                if (!qid) return { image: null, bio: 'Biografía no encontrada.' };

                return fetch(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`)
                    .then(res => res.json())
                    .then(data => {
                        const entity = data.entities[qid];
                        const claims = entity.claims;

                        const image = claims.P18?.[0]?.mainsnak.datavalue?.value
                            ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(claims.P18[0].mainsnak.datavalue.value)}`
                            : null;

                        const wikipediaTitle = entity.sitelinks?.eswiki?.title || entity.sitelinks?.enwiki?.title;
                        if (!wikipediaTitle) return { image, bio: 'Biografía no disponible.' };

                        return fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikipediaTitle)}`)
                            .then(res => res.json())
                            .then(summary => {
                                const bio = summary.extract || 'Sin biografía disponible.';
                                return { image, bio };
                            });
                    });
            })
            .catch(err => {
                console.error('Error en Wikidata:', err);
                return { image: null, bio: 'Biografía no disponible.' };
            });
    }

    function displayActorInfo(name, imageUrl, bio) {
        document.getElementById('actor-name').textContent = name;
        const img = document.getElementById('actor-image');
        if (imageUrl) {
            img.src = imageUrl;
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
        document.getElementById('actor-bio').textContent = bio || 'No hay biografía disponible.';
    }

    function drawChart(filmography) {
        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Año');
        data.addColumn('number', 'Películas');

        const yearCount = {};
        filmography.forEach(f => {
            yearCount[f.year] = (yearCount[f.year] || 0) + 1;
        });

        const chartData = Object.entries(yearCount).sort((a, b) => a[0] - b[0]);
        data.addRows(chartData.map(([year, count]) => [year, count]));

        const chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
        chart.draw(data, {
            title: 'Películas por Año',
            legend: 'none',
            hAxis: { title: 'Año' },
            vAxis: { title: 'Cantidad' },
            colors: ['#3366cc']
        });
    }
});
