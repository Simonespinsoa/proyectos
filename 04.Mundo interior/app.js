const emotions = [
  { label: "😊", name: "Feliz", color: "bg-yellow-300" },
  { label: "😢", name: "Triste", color: "bg-blue-300" },
  { label: "😡", name: "Enojado", color: "bg-red-400" },
  { label: "😱", name: "Sorprendido", color: "bg-indigo-300" },
  { label: "😎", name: "Genial", color: "bg-pink-400" },
  { label: "😴", name: "Cansado", color: "bg-gray-300" },
  { label: "🤩", name: "Motivado", color: "bg-green-300" },
  { label: "🫶", name: "Agradecido", color: "bg-purple-300" }
];
const emotionsDiv = document.getElementById('emotions');
emotions.forEach(em => {
  const btn = document.createElement('button');
  btn.className = `px-5 py-3 rounded-xl text-3xl m-1 font-bold shadow transition-all hover:scale-110 hover:shadow-lg ${em.color}`;
  btn.textContent = em.label;
  btn.title = em.name;
  btn.onclick = () => {
    document.getElementById('emotionResult').innerHTML = `Hoy te sientes <span class="underline decoration-wavy decoration-pink-400">${em.name}</span> ${em.label}`;
    saveMood(em.name, em.label);
    showMoodHistory();
  };
  emotionsDiv.appendChild(btn);
});


let stars = [];
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');


function drawConstellation() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for(let i=0; i<stars.length-1; ++i) {
    ctx.moveTo(stars[i].x, stars[i].y);
    ctx.lineTo(stars[i+1].x, stars[i+1].y);
  }
  ctx.stroke();
  
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, 7, 0, Math.PI*2);
    ctx.fillStyle = "#fae8ff";
    ctx.shadowColor = "#a21caf";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

canvas.addEventListener('click', function(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  stars.push({x, y});
  drawConstellation();
});

window.clearConstellation = function() {
  stars = [];
  drawConstellation();
};
drawConstellation();


window.saveReflection = function() {
  const txt = document.getElementById('reflection').value.trim();
  if(!txt) {
    document.getElementById('reflectionResult').innerHTML = '<span class="text-pink-300">Por favor, escribe algo para guardar tu reflexión.</span>';
    return;
  }
  localStorage.setItem('reflection', txt);
  document.getElementById('reflectionResult').innerHTML = '<span class="text-green-300">¡Reflexión guardada!</span><br><q>' + txt + '</q>';
};
window.onload = function() {
  const saved = localStorage.getItem('reflection');
  if(saved) {
    document.getElementById('reflection').value = saved;
    document.getElementById('reflectionResult').innerHTML = '<span class="text-green-300">Reflexión previa:</span><br><q>' + saved + '</q>';
  }
  showMoodHistory();
  randomQuote();
  randomChallenge();
  randomFact();
  weatherWidget();
};


const quotes = [
  "El universo está dentro de ti.",
  "Cada día es una nueva galaxia por explorar.",
  "Tu luz interior puede iluminar cualquier oscuridad.",
  "Eres polvo de estrellas creando tu propio destino.",
  "La magia comienza cuando crees en ti.",
  "A veces, perderse es la mejor manera de encontrarse.",
  "Haz de tu vida una constelación de momentos felices.",
  "El presente es el único tiempo que existe. Vívelo."
];
window.randomQuote = function() {
  const q = quotes[Math.floor(Math.random()*quotes.length)];
  document.getElementById('quoteText').textContent = `"${q}"`;
};


function weatherWidget() {
  if (!navigator.geolocation) {
    document.getElementById('weatherWidget').innerHTML = '<div class="text-xs">No disponible</div>';
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const {latitude, longitude} = pos.coords;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
      .then(r=>r.json())
      .then(data=>{
        if (data && data.current_weather) {
          const w = data.current_weather;
          let icon = "☀️";
          if (w.weathercode >= 51) icon = "🌧️";
          if (w.weathercode >= 61) icon = "⛈️";
          if (w.weathercode >= 71) icon = "❄️";
          if (w.weathercode === 3) icon = "☁️";
          document.getElementById('weatherWidget').innerHTML = `
            <div class="text-2xl">${icon}</div>
            <div class="text-lg">${w.temperature}°C</div>
            <div class="text-xs">${w.windspeed} km/h viento</div>
          `;
        } else {
          document.getElementById('weatherWidget').innerHTML = '<div class="text-xs">No disponible</div>';
        }
      })
      .catch(()=>document.getElementById('weatherWidget').innerHTML = '<div class="text-xs">No disponible</div>');
  }, ()=>{
    document.getElementById('weatherWidget').innerHTML = '<div class="text-xs">Permiso denegado</div>';
  });
}


const challenges = [
  "Haz una buena acción hoy.",
  "Sonríe a un desconocido.",
  "Dedica 5 minutos a meditar.",
  "Escribe 3 cosas por las que estés agradecido.",
  "Haz una pausa y respira profundamente.",
  "Sal a caminar y observa el cielo.",
  "Ayuda a alguien sin esperar nada a cambio.",
  "Aprende una palabra nueva."
];
window.randomChallenge = function() {
  const c = challenges[Math.floor(Math.random()*challenges.length)];
  document.getElementById('dailyChallenge').innerHTML = c + '<br><button onclick="randomChallenge()" class="mt-2 text-xs bg-indigo-500 hover:bg-pink-500 text-white px-2 py-1 rounded">Nuevo reto</button>';
};


const facts = [
  "El Sol es 330,000 veces más pesado que la Tierra.",
  "La Vía Láctea tiene más de 100 mil millones de estrellas.",
  "Un día en Venus dura más que un año en Venus.",
  "Las estrellas fugaces son en realidad meteoros entrando en la atmósfera.",
  "Si pudieras volar a Plutón, tardarías más de 800 años en avión.",
  "Las huellas en la Luna pueden durar millones de años.",
  "Hay más árboles en la Tierra que estrellas en la galaxia.",
  "Los arcoíris también pueden salir de noche. Se llaman 'lunares'."
];
window.randomFact = function() {
  document.getElementById('funFact').textContent = facts[Math.floor(Math.random()*facts.length)];
};


function saveMood(name, emoji) {
  const history = JSON.parse(localStorage.getItem('moodHistory') || "[]");
  const today = new Date().toISOString().slice(0,10);
  history.push({date: today, name, emoji});
  if (history.length > 10) history.shift(); 
  localStorage.setItem('moodHistory', JSON.stringify(history));
}
function showMoodHistory() {
  const history = JSON.parse(localStorage.getItem('moodHistory') || "[]");
  if (history.length === 0) {
    document.getElementById('moodHistory').textContent = "Aún no hay registro.";
    return;
  }
  document.getElementById('moodHistory').innerHTML = history.slice(-7).map(h =>
    `<span title="${h.date}" class="inline-block">${h.emoji}</span>`
  ).join(" ");
}
