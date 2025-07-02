let pokemon1, pokemon2;
const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const battleResult = document.getElementById('battle-result'); 
const statsChartCanvas = document.getElementById('statsChart'); 
let statsChart;

document.addEventListener('DOMContentLoaded', () => {
    cargarPokemon();
});

async function cargarPokemon() {
    try {
        const response = await fetch(`${API_URL}?limit=150`);
        const data = await response.json();

        const pokemonOptions = data.results.map((pokemon) => {
            return `<option value="${pokemon.name}">${pokemon.name}</option>`;
        }).join('');

        document.getElementById('pokemon1').innerHTML += pokemonOptions;
        document.getElementById('pokemon2').innerHTML += pokemonOptions;

    } catch (error) {
        battleResult.innerHTML = `<p>Error al cargar los Pokémon: ${error}</p>`;
    }
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

async function startBattle() { 
    const pokemon1Name = document.getElementById('pokemon1').value;
    const pokemon2Name = document.getElementById('pokemon2').value;

    if (!pokemon1Name || !pokemon2Name) { 
        battleResult.innerHTML = '<p>¡Debes seleccionar dos Pokémon diferentes!</p>';
        return;
    }

    if (pokemon1Name === pokemon2Name) {
        battleResult.innerHTML = '<p>¡No puedes pelear contigo mismo!</p>';
        return;
    }

    try {
        const [data1, data2] = await Promise.all([
            obtenerPokemon(pokemon1Name),
            obtenerPokemon(pokemon2Name)
        ]);

        pokemon1 = data1;
        pokemon2 = data2;

        const ganador = determinarGanador(pokemon1, pokemon2);
        mostrarResultados(ganador);
        visualizarEstadisticas(pokemon1, pokemon2);
    } catch (error) {
        battleResult.innerHTML = `<p>Error al cargar los Pokémon: ${error}</p>`;
    }
}

async function obtenerPokemon(nombre) {
    const response = await fetch(`${API_URL}${nombre}`);
    if (!response.ok) throw new Error('Error al obtener datos del Pokémon');
    return await response.json();
}

function determinarGanador(pokemon1, pokemon2) {
    const sumaStats1 = calcularSumaStats(pokemon1.stats);
    const sumaStats2 = calcularSumaStats(pokemon2.stats);
    if (sumaStats1 > sumaStats2) return pokemon1;
    if (sumaStats2 > sumaStats1) return pokemon2;
    return null;
}

function calcularSumaStats(stats) {
    return stats.reduce((total, stat) => total + stat.base_stat, 0);
}

function mostrarResultados(ganador) {
    if (ganador) {
        battleResult.innerHTML = `<p>¡${capitalizar(ganador.name)} ha ganado!</p>`;
    } else {
        battleResult.innerHTML = `<p>¡Es un empate!</p>`;
    }
}

function visualizarEstadisticas(pokemon1, pokemon2) {
    const labels = pokemon1.stats.map(stat => capitalizar(stat.stat.name));
    const data1 = pokemon1.stats.map(stat => stat.base_stat);
    const data2 = pokemon2.stats.map(stat => stat.base_stat);

    if (statsChart) statsChart.destroy();

    statsChart = new Chart(statsChartCanvas, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: capitalizar(pokemon1.name),
                    data: data1,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: capitalizar(pokemon2.name),
                    data: data2,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: { 
            responsive: true,
            plugins: {
                legend: {
                    position: 'top', 
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                }
            }
        }
    });
}
