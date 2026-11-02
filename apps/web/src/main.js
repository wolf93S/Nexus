
import "./style.css";

const app = document.querySelector("#app");

app.innerHTML = `
  <div class="app">
    <header class="header">
      <div class="logo">N</div>
      <div>
        <div class="brand">NEXUS</div>
        <div class="subtitle">PRIVATE MESSAGING</div>
      </div>
    </header>

    <section class="panel login" id="login">
      <div class="subtitle">WELCOME TO NEXUS</div>
      <h1>Mesajele tale. Spațiul tău.</h1>
      <p>Conectează-te la o experiență de mesagerie construită în jurul confidențialității.</p>

      <label for="email">Email</label>
      <input type="email" id="email" placeholder="nume@email.com">

      <label for="password">Parolă</label>
      <input type="password" id="password" placeholder="Parola ta">

      <button class="primary" id="loginButton">Intră în NEXUS</button>
      <div class="demo">PROTOTIP DEMO · Autentificarea nu este activă</div>
    </section>

    <section class="panel messenger" id="messenger" hidden>
      <aside class="sidebar">
        <div class="section-title">Mesaje</div>
        <input id="search" placeholder="Caută conversații...">

        <div id="people">
          <div class="person active" data-name="Alex">
            <div class="avatar">A</div>
            <div class="person-info">
              <strong>Alex</strong>
              <small>Ne auzim mai târziu.</small>
            </div>
          </div>

          <div class="person" data-name="Daniel">
            <div class="avatar">D</div>
            <div class="person-info">
              <strong>Daniel</strong>
              <small>Am primit fișierul.</small>
            </div>
          </div>

          <div class="person" data-name="NEXUS Team">
            <div class="avatar">N</div>
            <div class="person-info">
              <strong>NEXUS Team</strong>
              <small>Device verified ✓</small>
            </div>
          </div>
        </div>
      </aside>

      <main class="chat">
        <div class="chat-head">
          <div class="avatar" id="chatAvatar">A</div>
          <div>
            <strong id="chatName">Alex</strong>
            <div class="muted">Conversație demo</div>
          </div>
          <div class="security">● DEMO MODE</div>
        </div>

        <div class="messages" id="messages">
          <div class="bubble">Salut! Cum merge NEXUS?<span class="time">12:40</span></div>
          <div class="bubble mine">Construim ceva interesant. 🔐<span class="time">12:41</span></div>
          <div class="bubble">Abia aștept să-l testăm!<span class="time">12:42</span></div>
        </div>

        <form class="composer" id="messageForm">
          <input id="message" placeholder="Scrie un mesaj..." autocomplete="off">
          <button type="submit">➤</button>
        </form>
      </main>
    </section>
  </div>
`;

const login = document.querySelector("#login");
const messenger = document.querySelector("#messenger");

document.querySelector("#loginButton").addEventListener("click", () => {
  login.hidden = true;
  messenger.hidden = false;
});

document.querySelector("#search").addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase();

  document.querySelectorAll(".person").forEach((person) => {
    person.hidden = !person.textContent.toLowerCase().includes(query);
  });
});

document.querySelectorAll(".person").forEach((person) => {
  person.addEventListener("click", () => {
    document.querySelectorAll(".person").forEach((item) => {
      item.classList.remove("active");
    });

    person.classList.add("active");

    const name = person.dataset.name;
    document.querySelector("#chatName").textContent = name;
    document.querySelector("#chatAvatar").textContent = name[0];

    document.querySelector("#messages").innerHTML = `
      <div class="bubble">
        Aceasta este o conversație demonstrativă cu ${name}.
        <span class="time">Acum</span>
      </div>
    `;
  });
});

document.querySelector("#messageForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const input = document.querySelector("#message");
  const value = input.value.trim();

  if (!value) return;

  const bubble = document.createElement("div");
  bubble.className = "bubble mine";
  bubble.textContent = value;

  const time = document.createElement("span");
  time.className = "time";
  time.textContent = new Date().toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit"
  });

  bubble.appendChild(time);
  document.querySelector("#messages").appendChild(bubble);

  input.value = "";

  const messages = document.querySelector("#messages");
  messages.scrollTop = messages.scrollHeight;
});
