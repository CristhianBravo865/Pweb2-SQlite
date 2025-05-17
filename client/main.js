document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('actor-select');

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

    // Cargar Google Charts
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(() => {
        select.addEventListener('change', () => {
            const actorId = select.value;
            if (!actorId) return;

            fetch(`/filmography/${actorId}`)
                .then(response => response.json())
                .then(films => {
                    // Agrupar por año
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

                    const chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
                    chart.draw(data, options);
                })
                .catch(error => console.error('Error al obtener filmografía:', error));
        });
    });
});
