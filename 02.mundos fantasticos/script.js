const criaturas = [
    { nombre: "Drakon", tipo: "Dragón", habilidad: "Aliento de hielo" },
    { nombre: "Lumina", tipo: "Hada", habilidad: "Curación instantánea" },
    { nombre: "Grum", tipo: "Trol", habilidad: "Fuerza descomunal" },
    { nombre: "Sylfe", tipo: "Elfo", habilidad: "Control de la naturaleza" },
    { nombre: "Vortex", tipo: "Espectro", habilidad: "Viaje entre dimensiones" }
];

function generarMundo() {
    const lugares = [
        "Bosque de los Susurros",
        "Montañas de Cristal",
        "Lago Eterno",
        "Cueva de los Ecos",
        "Ruinas del Alba"
    ];

    const desafios = [
        "resolver el enigma de la puerta mágica",
        "recuperar la gema perdida",
        "derrotar al guardián de las sombras",
        "cruzar el puente invisible",
        "descifrar el mapa antiguo"
    ];

    function elegirAleatorio(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    const protagonista = elegirAleatorio(criaturas);

    let aliados = [];
    for (let i = 0; i < 2; i++) {
        let aliado;
        do {
            aliado = elegirAleatorio(criaturas);
        } while (aliado.nombre === protagonista.nombre || aliados.includes(aliado));
        aliados.push(aliado);
    }

    let lugarPrincipal = elegirAleatorio(lugares);
    let lugarSecundario;
    let intentos = 0;
    while (!lugarSecundario || lugarSecundario === lugarPrincipal) {
        lugarSecundario = elegirAleatorio(lugares);
        intentos++;
        if (intentos > 10) break;
    }

    let habilidadesAliados = "";
    for (let idx in aliados) {
        habilidadesAliados += `<li>${aliados[idx].nombre} (${aliados[idx].tipo}): <em>${aliados[idx].habilidad}</em></li>`;
    }

    let rutas = "";
    for (let i = 0; i < lugares.length; i++) {
        for (let j = 0; j < lugares.length; j++) {
            if (i !== j && Math.random() < 0.2) {
                rutas += `<li>${lugares[i]} &rarr; ${lugares[j]}</li>`;
            }
        }
    }
    if (!rutas) rutas = "<li>No se han descubierto rutas mágicas nuevas hoy.</li>";

    document.getElementById("resultados").innerHTML = `
        <h3>🌟 Aventurero/a elegido/a</h3>
        <p><strong>${protagonista.nombre}</strong> (${protagonista.tipo})<br>
        Habilidad especial: <em>${protagonista.habilidad}</em></p>
        
        <h3>🧙‍♂️ Aliados en la misión</h3>
        <ul>${habilidadesAliados}</ul>

        <h3>🌄 Escenario principal</h3>
        <p>La aventura comienza en <strong>${lugarPrincipal}</strong>, pero pronto deberán viajar hacia <strong>${lugarSecundario}</strong>.</p>
        
        <h3>⚔️ Desafío a enfrentar</h3>
        <p>El objetivo es <strong>${elegirAleatorio(desafios)}</strong>.</p>

        <h3>🔮 Rutas mágicas descubiertas hoy</h3>
        <ul>${rutas}</ul>
    `;
}


function mostrarSelectorPersonaje() {
    const select = document.getElementById("personajeSelect");
    select.innerHTML = "";
    criaturas.forEach((criatura, i) => {
        let opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `${criatura.nombre} (${criatura.tipo})`;
        select.appendChild(opt);
    });
    document.getElementById("selectorPersonaje").style.display = "block";
}


function verAtributosPersonaje() {
    const idx = document.getElementById("personajeSelect").value;
    const c = criaturas[idx];
    let html = `<strong>${c.nombre}</strong> (${c.tipo})<ul>`;
    for (let prop in c) {
        html += `<li><strong>${prop}</strong>: ${c[prop]}</li>`;
    }
    html += "</ul>";
    document.getElementById("atributosPersonaje").innerHTML = html;
}
