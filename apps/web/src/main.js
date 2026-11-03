
import "./style.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const app = document.querySelector("#app");

let accessToken = null;
let currentUser = null;
let isRegisterMode = false;

app.innerHTML = `
  <div class="app">
    <header class="header">
      <div class="logo">N</div>
      <div>
        <div class="brand">NEXUS</div>
        <div class="subtitle">PRIVATE MESSAGING</div>
      </div>
    </header>

    <section class="panel login" id="authPanel">
      <div class="subtitle">WELCOME TO NEXUS</div>
      <h1 id="authTitle">Mesajele tale. Spațiul tău.</h1>
      <p id="authDescription">
        Conectează-te la o experiență de mesagerie construită în jurul confidențialității.
      </p>

      <form id="authForm" novalidate>
        <div id="registerFields" hidden>
          <label for="username">Nume de utilizator</label>
          <input
            type="text"
            id="username"
            minlength="3"
            maxlength="32"
            autocomplete="username"
            placeholder="numele_tau"
          >

          <label for="displayName">Nume afișat</label>
          <input
            type="text"
            id="displayName"
            maxlength="64"
            autocomplete="name"
            placeholder="Numele tău"
          >
        </div>

        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          maxlength="255"
          autocomplete="email"
          placeholder="nume@email.com"
          required
        >

        <label for="password">Parolă</label>
        <input
          type="password"
          id="password"
          maxlength="128"
          autocomplete="current-password"
          placeholder="Parola ta"
          required
        >

        <button class="primary" id="submitButton" type="submit">
          Intră în NEXUS
        </button>
      </form>

      <p id="authMessage" role="alert" aria-live="polite"></p>

      <button
        type="button"
        id="switchAuth"
        style="width:100%;margin-top:16px;background:none;border:0;color:#a18eff;cursor:pointer;"
      >
        Nu ai cont? Creează unul
      </button>

      <div class="demo">SECURE AUTHENTICATION</div>
    </section>

    <section class="panel messenger" id="messenger" hidden>
      <aside class="sidebar">
        <div class="section-title">Mesaje</div>

        <div class="person active">
          <div class="avatar" id="userAvatar">N</div>
          <div class="person-info">
            <strong id="userName">Utilizator</strong>
            <small>Cont autentificat</small>
          </div>
        </div>

        <button
          type="button"
          id="logoutButton"
          style="width:100%;margin-top:24px;padding:12px;border:1px solid #252536;border-radius:10px;background:#11111b;color:#f4f4f8;cursor:pointer;"
        >
          Deconectare
        </button>
      </aside>

      <main class="chat">
        <div class="chat-head">
          <div class="avatar" id="chatAvatar">N</div>
          <div>
            <strong id="chatName">NEXUS</strong>
            <div class="muted" id="accountEmail"></div>
          </div>
          <div class="security">● AUTHENTICATED</div>
        </div>

        <div class="messages" id="messages">
          <div class="bubble">
            Autentificarea a reușit.
            <span class="time">NEXUS API</span>
          </div>
          <div class="bubble mine">
            Profilul a fost încărcat de pe server.
            <span class="time">SECURE SESSION</span>
          </div>
          <div class="bubble">
            Sistemul de mesagerie este încă în dezvoltare.
            <span class="time">INFO</span>
          </div>
        </div>
      </main>
    </section>
  </div>
`;

const authPanel = document.querySelector("#authPanel");
const messenger = document.querySelector("#messenger");
const authForm = document.querySelector("#authForm");
const registerFields = document.querySelector("#registerFields");
const usernameInput = document.querySelector("#username");
const displayNameInput = document.querySelector("#displayName");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const authTitle = document.querySelector("#authTitle");
const authDescription = document.querySelector("#authDescription");
const authMessage = document.querySelector("#authMessage");
const submitButton = document.querySelector("#submitButton");
const switchAuth = document.querySelector("#switchAuth");

const setMessage = (message) => {
  authMessage.textContent = message;
};

const requestApi = async (path, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
  } catch {
    throw new Error(
      "Nu s-a putut contacta serverul NEXUS. Verifică dacă API-ul este pornit."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error(
        data.details
          ? "Datele introduse nu respectă regulile de validare."
          : data.error || "Date invalide."
      );
    }

    if (response.status === 409) {
      throw new Error("Username-ul sau emailul este deja folosit.");
    }

    if (response.status === 401) {
      throw new Error("Email sau parolă incorectă.");
    }

    if (response.status === 429) {
      throw new Error(
        "Prea multe încercări. Așteaptă înainte să încerci din nou."
      );
    }

    throw new Error(
      data.error || data.message || "A apărut o eroare de server."
    );
  }

  return data;
};

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateRegistration = ({ username, email, password }) => {
  if (!username) {
    return "Introdu un nume de utilizator.";
  }

  if (username.length < 3 || username.length > 32) {
    return "Username-ul trebuie să aibă între 3 și 32 de caractere.";
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "Username-ul poate conține doar litere, cifre și underscore.";
  }

  if (!validateEmail(email) || email.length > 255) {
    return "Introdu o adresă de email validă.";
  }

  if (password.length < 12) {
    return "Parola trebuie să aibă minimum 12 caractere.";
  }

  if (password.length > 128) {
    return "Parola nu poate depăși 128 de caractere.";
  }

  return null;
};

const validateLogin = ({ email, password }) => {
  if (!validateEmail(email) || email.length > 255) {
    return "Introdu o adresă de email validă.";
  }

  if (!password || password.length > 128) {
    return "Introdu o parolă validă.";
  }

  return null;
};

const showLogin = () => {
  isRegisterMode = false;
  registerFields.hidden = true;
  usernameInput.required = false;
  passwordInput.autocomplete = "current-password";

  authTitle.textContent = "Mesajele tale. Spațiul tău.";
  authDescription.textContent =
    "Conectează-te la experiența NEXUS.";
  submitButton.textContent = "Intră în NEXUS";
  switchAuth.textContent = "Nu ai cont? Creează unul";

  setMessage("");
};

const showRegister = () => {
  isRegisterMode = true;
  registerFields.hidden = false;
  usernameInput.required = true;
  passwordInput.autocomplete = "new-password";

  authTitle.textContent = "Creează contul tău.";
  authDescription.textContent =
    "Începe să folosești NEXUS.";
  submitButton.textContent = "Creează cont";
  switchAuth.textContent = "Ai deja cont? Conectează-te";

  setMessage("");
};

switchAuth.addEventListener("click", () => {
  if (isRegisterMode) {
    showLogin();
  } else {
    showRegister();
  }
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const username = usernameInput.value.trim();

  const formData = { email, password, username };

  const validationError = isRegisterMode
    ? validateRegistration(formData)
    : validateLogin(formData);

  if (validationError) {
    setMessage(validationError);
    return;
  }

  submitButton.disabled = true;
  setMessage("Se comunică cu serverul NEXUS...");

  try {
    if (isRegisterMode) {
      const displayName = displayNameInput.value.trim();

      await requestApi("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
          ...(displayName ? { displayName } : {})
        })
      });

      showLogin();
      emailInput.value = email;
      setMessage("Cont creat cu succes. Acum te poți conecta.");
      return;
    }

    const result = await requestApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (!result.accessToken) {
      throw new Error(
        "Serverul nu a returnat un token de autentificare."
      );
    }

    accessToken = result.accessToken;

    const profile = await requestApi("/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    currentUser = profile.user;

    if (!currentUser) {
      throw new Error(
        "Profilul utilizatorului nu a putut fi încărcat."
      );
    }

    const displayName =
      currentUser.display_name || currentUser.username;

    document.querySelector("#userName").textContent = displayName;
    document.querySelector("#userAvatar").textContent =
      (currentUser.username || "N").charAt(0).toUpperCase();

    document.querySelector("#chatName").textContent = displayName;
    document.querySelector("#chatAvatar").textContent =
      (currentUser.username || "N").charAt(0).toUpperCase();

    document.querySelector("#accountEmail").textContent =
      currentUser.email;

    authPanel.hidden = true;
    messenger.hidden = false;
    setMessage("");
  } catch (error) {
    accessToken = null;
    currentUser = null;
    setMessage(error.message);
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelector("#logoutButton").addEventListener("click", () => {
  accessToken = null;
  currentUser = null;

  messenger.hidden = true;
  authPanel.hidden = false;

  authForm.reset();
  showLogin();
});

showLogin();
