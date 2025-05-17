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