document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('actor-select');
    const table = document.getElementById('film-table');
    const chartDiv = document.getElementById('chart_div');

    fetch('/actors')
        .then(response => response.json())
        .then(data => {
            data.forEach(actor => {
                const option = document.createElement('option');
                option.value = actor.id;
                option.textContent = actor.name;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error al cargar actores:', error));

    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(() => {
        select.addEventListener('change', () => {
            const actorId = select.value;
            if (!actorId) return;

            fetch(`/filmography/${actorId}`)
                .then(response => response.json())
                .then(films => {
                    //TABLA 
                    const tableBody = document.querySelector('#film-table tbody');
                    tableBody.innerHTML = ''; // Limpiar tabla antes de agregar nuevos datos

                    const filmsByYear = {};
                    films.forEach(film => {
                        if (!filmsByYear[film.year]) {
                            filmsByYear[film.year] = [];
                        }
                        filmsByYear[film.year].push(film.title);
                    });

                    Object.keys(filmsByYear).sort().forEach(year => {
                        const row = document.createElement('tr');

                        const yearCell = document.createElement('td');
                        yearCell.textContent = year;

                        const titlesCell = document.createElement('td');
                        titlesCell.innerHTML = filmsByYear[year].join(', ');

                        row.appendChild(yearCell);
                        row.appendChild(titlesCell);
                        tableBody.appendChild(row);
                    });

                    table.style.display = 'table';

                    //GRAFICO
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
        });
    });
});
