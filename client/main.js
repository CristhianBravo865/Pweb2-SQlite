document.addEventListener('DOMContentLoaded', () => {
    fetch('/actors')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('actor-select');
            data.forEach(actor => {
                const option = document.createElement('option');
                option.value = actor.id;
                option.textContent = actor.name;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error al cargar actores:', error));
});
