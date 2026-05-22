// ─── Sound System (Web Audio API — no external files needed) ───────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  return audioCtx;
}

function playSound(type) {
  try {
    const ctx = getAudioCtx();

    const sounds = {
      // Keypress: very short, quiet click
      keypress: (ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.03);
      },

      // Submit: satisfying mid-tone "confirm" blip
      submit: (ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      },

      // Success: two ascending tones — "ok"
      success: (ctx) => {
        [0, 0.1].forEach((delay, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(i === 0 ? 520 : 780, ctx.currentTime + delay);
          gain.gain.setValueAtTime(0.1, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.12);
        });
      },

      // Error: descending buzz — "bad"
      error: (ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      },

      // Login success: triumphant three-note sweep
      login: (ctx) => {
        [0, 0.1, 0.2].forEach((delay, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          const freqs = [440, 550, 880];
          osc.frequency.setValueAtTime(freqs[i], ctx.currentTime + delay);
          gain.gain.setValueAtTime(0.1, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.15);
        });
      },

      // Logout: descending sweep — "goodbye"
      logout: (ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      },

      // Login error: flat, dull thud
      loginError: (ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      },

      // Not found: short negative blip
      notFound: (ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }
    };

    if (sounds[type]) {
      sounds[type](ctx);
    }
  } catch (e) {
    // Silently fail — sound is enhancement only
  }
}

// ─── Terminal core ──────────────────────────────────────────────────────────
const output = document.querySelector("#output");
const promptForm = document.querySelector("#promptForm");
const commandInput = document.querySelector("#commandInput");
const promptText = document.querySelector("#prompt");
const clearButton = document.querySelector("#clearButton");
const themeButton = document.querySelector("#themeButton");
const loginPanel = document.querySelector("#loginPanel");
const loginForm = document.querySelector("#loginForm");
const usernameInput = document.querySelector("#usernameInput");
const passwordInput = document.querySelector("#passwordInput");
const loginError = document.querySelector("#loginError");

const allowedAccounts = [
  {
    username: "gov.ascent",
    password: "AscentGovOfficial"
  },
  {
    username: "robert",
    password: "RobertNoir"
  }
];

const state = {
  cwd: "\\Users\\Noir",
  user: "",
  authenticated: false,
  history: [],
  historyIndex: 0,
  theme: "powershell",
  files: {
    "\\": ["Users", "System", "Apps"],
    "\\Users": ["Noir"],
    "\\Users\\Noir": ["readme.txt", "apps.txt", "secrets"],
    "\\Users\\Noir\\secrets": ["hint.txt"],
    "\\System": ["version.txt", "guardian.log"],
    "\\Apps": ["terminal.app", "guardian.app", "command-studio.app"]
  },
  fileContent: {
    "\\Users\\Noir\\readme.txt": "Welcome to Noir.os. Type help to get started.",
    "\\Users\\Noir\\apps.txt": "Terminal\nNoir Guardian\nCommand Studio",
    "\\Users\\Noir\\secrets\\hint.txt": "Some commands only appear when you try unusual things.",
    "\\System\\version.txt": "Noir.os Terminal Preview 0.2.0",
    "\\System\\guardian.log": "No threats found."
  }
};

function write(text = "", type = "") {
  const line = document.createElement("p");
  line.className = `line ${type}`.trim();
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function writeImage(src, alt = "Terminal image") {
  const wrap = document.createElement("figure");
  wrap.className = "terminal-image";
  const image = document.createElement("img");
  image.src = src;
  image.alt = alt;
  image.loading = "lazy";
  image.addEventListener("error", () => {
    wrap.classList.add("image-fallback");
    wrap.innerHTML = "";
    const message = document.createElement("figcaption");
    message.textContent = "This link did not load as a direct image. Open it as a preview:";
    const frame = document.createElement("iframe");
    frame.src = src;
    frame.title = alt;
    const anchor = document.createElement("a");
    anchor.href = src;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.textContent = src;
    wrap.append(message, frame, anchor);
    write(`Image failed to load: ${src}`, "error");
    write("Noir.OS added a preview/open link because this may be a viewer URL instead of a direct image file.", "muted");
  });
  wrap.appendChild(image);
  output.appendChild(wrap);
  output.scrollTop = output.scrollHeight;
}

function writeLink(href, label = href) {
  const line = document.createElement("p");
  line.className = "line link-line";
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.target = "_blank";
  anchor.rel = "noreferrer";
  anchor.textContent = label;
  line.appendChild(anchor);
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function writeLoading(seconds = 1) {
  const duration = Math.max(0, Number(seconds) || 0) * 1000;
  const line = document.createElement("p");
  line.className = "line loading-line";
  output.appendChild(line);

  if (duration === 0) {
    line.textContent = "...";
    output.scrollTop = output.scrollHeight;
    return;
  }

  const frames = [".", "..", "..."];
  const startedAt = Date.now();
  let index = 0;

  while (Date.now() - startedAt < duration) {
    line.textContent = frames[index % frames.length];
    index++;
    output.scrollTop = output.scrollHeight;
    await sleep(250);
  }

  line.textContent = "...";
  output.scrollTop = output.scrollHeight;
}

function setPrompt() {
  const user = state.user || "Noir";
  promptText.textContent = `PS ${user}:${state.cwd}>`;
}

function normalizePath(input) {
  if (!input || input === ".") {
    return state.cwd;
  }

  if (input === "..") {
    if (state.cwd === "\\") {
      return "\\";
    }
    const parts = state.cwd.split("\\").filter(Boolean);
    parts.pop();
    return parts.length ? `\\${parts.join("\\")}` : "\\";
  }

  if (input.startsWith("\\")) {
    return input.replace(/\\+$/g, "") || "\\";
  }

  const base = state.cwd === "\\" ? "" : state.cwd;
  return `${base}\\${input}`.replace(/\\+$/g, "");
}

function commandHelp() {
  const builtin = Object.keys(commands)
    .sort()
    .map((name) => `  ${name.padEnd(12)} ${commands[name].description}`);

  // Only show custom commands the current user is allowed to use
  const custom = customCommands
    .filter((command) => {
      if (!command.allowedUsers) return true;
      return command.allowedUsers.includes(state.user);
    })
    .map((command) => `  ${command.name.padEnd(12)} ${command.description}`);

  return [
    "Built-in commands:",
    ...builtin,
    "",
    "Custom commands:",
    ...custom,
    "",
  ].join("\n");
}

const commands = {
  help: {
    description: "Lists commands",
    run: commandHelp
  },
  clear: {
    description: "Clears the terminal",
    run() {
      output.innerHTML = "";
      return "";
    }
  },
  cls: {
    description: "Alias for clear",
    run() {
      output.innerHTML = "";
      return "";
    }
  },
  pwd: {
    description: "Shows the current directory",
    run() {
      return state.cwd;
    }
  },
  cd: {
    description: "Changes directory",
    run(args) {
      const next = normalizePath(args[0]);
      if (!state.files[next]) {
        return { type: "error", text: `Directory not found: ${next}` };
      }
      state.cwd = next;
      setPrompt();
      return state.cwd;
    }
  },
  ls: {
    description: "Lists files",
    run(args) {
      const target = normalizePath(args[0]);
      if (!state.files[target]) {
        return { type: "error", text: `Directory not found: ${target}` };
      }
      return state.files[target].join("\n");
    }
  },
  dir: {
    description: "Alias for ls",
    run(args) {
      return commands.ls.run(args);
    }
  },
  cat: {
    description: "Shows a file",
    run(args) {
      const target = normalizePath(args[0]);
      if (!state.fileContent[target]) {
        return { type: "error", text: `File not found: ${target}` };
      }
      return state.fileContent[target];
    }
  },
  echo: {
    description: "Prints text",
    run(args) {
      return args.join(" ");
    }
  },
  date: {
    description: "Shows date and time",
    run() {
      return new Date().toLocaleString("en-US");
    }
  },
  whoami: {
    description: "Shows the current user",
    run() {
      return `NOIR\\${state.user}`;
    }
  },
  neofetch: {
    description: "Shows system summary",
    run() {
      return [
        "       _   _       _",
        "      | \\ | | ___ (_)_ __",
        "      |  \\| |/ _ \\| | '__|",
        "      | |\\  | (_) | | |",
        "      |_| \\_|\\___/|_|_|",
        "",
        "OS: Noir.os Terminal Preview",
        "Shell: NoirShell",
        "Security: Noir Guardian",
        `Theme: ${state.theme}`
      ].join("\n");
    }
  },
  theme: {
    description: "Changes theme: theme powershell/light",
    run(args) {
      const next = args[0] || (state.theme === "powershell" ? "light" : "powershell");
      if (!["powershell", "light"].includes(next)) {
        return { type: "error", text: "Use: theme powershell or theme light" };
      }
      state.theme = next;
      document.body.classList.toggle("light", next === "light");
      return `Theme changed to ${next}`;
    }
  },
  commands: {
    description: "Shows how to create commands",
    run() {
      return [
        "Open commands.js and add an object inside customCommands:",
        "",
        "Example text command:",
        "{",
        "  name: \"mycommand\",",
        "  description: \"My description\",",
        "  run(args, api) {",
        "    return text(\"It works!\");",
        "  }",
        "}",
        "",
        "Example image command:",
        "{",
        "  name: \"logo\",",
        "  description: \"Shows my image\",",
        "  run(args, api) {",
        "    return image(\"images/logo.png\", \"My logo\");",
        "  }",
        "}",
        "",
        "Example mixed command:",
        "{",
        "  name: \"project\",",
        "  description: \"Shows text, loading, image and link\",",
        "  run(args, api) {",
        "    return group(",
        "      text(\"Project file\"),",
        "      loading(2),",
        "      image(\"images/file.png\", \"Project file\"),",
        "      link(\"https://example.com\", \"Open source\")",
        "    );",
        "  }",
        "}"
      ].join("\n");
    }
  },
  eggs: {
    description: "Shows how to create easter eggs",
    run() {
      return [
        "Open commands.js and add an object inside easterEggs:",
        "",
        "{",
        "  trigger: \"secret code\",",
        "  response: \"Secret message\"",
        "}"
      ].join("\n");
    }
  }
};

const api = {
  write,
  writeImage,
  writeLink,
  state,
  setPrompt,
  image(src, alt) {
    return { type: "image", src, alt };
  },
  text(value) {
    return { type: "text", text: value };
  },
  link(href, label) {
    return { type: "link", href, label };
  },
  group(...items) {
    return { type: "group", items: items.flat() };
  },
  loading(seconds) {
    return { type: "loading", seconds };
  },
  clear() {
    output.innerHTML = "";
  }
};

async function renderResult(result) {
  if (!result) {
    return;
  }

  if (Array.isArray(result)) {
    for (const item of result) {
      await renderResult(item);
    }
    return;
  }

  if (typeof result === "object") {
    if (result.type === "image") {
      writeImage(result.src, result.alt);
      return;
    }

    if (result.type === "text") {
      write(result.text, result.style || "");
      return;
    }

    if (result.type === "link") {
      writeLink(result.href, result.label);
      return;
    }

    if (result.type === "loading") {
      await writeLoading(result.seconds);
      return;
    }

    if (result.type === "group") {
      for (const item of result.items) {
        await renderResult(item);
      }
      return;
    }

    write(result.text, result.type);
    return;
  }

  write(String(result));
}

function parseCommand(raw) {
  return raw.match(/"[^"]+"|'[^']+'|\S+/g)?.map((part) => {
    if ((part.startsWith("\"") && part.endsWith("\"")) || (part.startsWith("'") && part.endsWith("'"))) {
      return part.slice(1, -1);
    }
    return part;
  }) || [];
}

// ─── Detect if a result contains an error ──────────────────────────────────
function resultHasError(result) {
  if (!result) return false;
  if (typeof result === "object") {
    if (result.type === "error") return true;
    if (result.type === "group") return result.items?.some(resultHasError);
    if (Array.isArray(result)) return result.some(resultHasError);
  }
  if (Array.isArray(result)) return result.some(resultHasError);
  return false;
}

async function runCommand(raw) {
  const input = raw.trim();
  if (!input) {
    return;
  }

  // Sound: keypress/submit when command is entered
  playSound("submit");

  write(`${promptText.textContent} ${input}`, "command");

  const egg = easterEggs.find((item) => item.trigger.toLowerCase() === input.toLowerCase());
  if (egg) {
    write(egg.response, "ok");
    playSound("success");
    return;
  }

  const parts = parseCommand(input);
  const name = parts[0].toLowerCase();
  const args = parts.slice(1);
  const command = commands[name] || customCommands.find((item) => item.name.toLowerCase() === name);

  if (!command) {
    write(`Command not found: ${name}. Type help.`, "error");
    playSound("notFound");
    return;
  }

  if (command.allowedUsers && !command.allowedUsers.includes(state.user)) {
    write(`Access denied: ${name} is not available for ${state.user}.`, "error");
    playSound("error");
    return;
  }

  // Logout gets its own sound
  const isLogout = name === "logout";
  if (isLogout) {
    playSound("logout");
  }

  try {
    const result = await command.run(args, api);
    await renderResult(result);

    // Play success or error sound based on result (skip for logout — already played)
    if (!isLogout) {
      if (resultHasError(result)) {
        playSound("error");
      } else if (name !== "clear" && name !== "cls") {
        playSound("success");
      }
    }
  } catch (error) {
    write(`Error in command ${name}: ${error.message}`, "error");
    playSound("error");
  }
}

// ─── Key sounds ─────────────────────────────────────────────────────────────
commandInput.addEventListener("keydown", (event) => {
  // Arrow history navigation
  if (event.key === "ArrowUp") {
    event.preventDefault();
    state.historyIndex = Math.max(0, state.historyIndex - 1);
    commandInput.value = state.history[state.historyIndex] || "";
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    state.historyIndex = Math.min(state.history.length, state.historyIndex + 1);
    commandInput.value = state.history[state.historyIndex] || "";
    return;
  }

  // Keypress sound for typing (not for Enter — that's handled by submit)
  if (event.key.length === 1 || event.key === "Backspace") {
    playSound("keypress");
  }
});

// ─── Event listeners ─────────────────────────────────────────────────────────
promptForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.authenticated) {
    return;
  }
  const value = commandInput.value;
  commandInput.value = "";
  state.history.push(value);
  state.historyIndex = state.history.length;
  await runCommand(value);
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const account = allowedAccounts.find((item) => item.username === username && item.password === password);

  if (!account) {
    loginError.textContent = "Invalid username or password.";
    passwordInput.value = "";
    passwordInput.focus();
    playSound("loginError");
    return;
  }

  state.user = account.username;
  state.authenticated = true;
  loginError.textContent = "";
  loginPanel.classList.add("is-hidden");
  document.querySelector("#terminal").classList.remove("is-hidden");
  setPrompt();
  write(startupMessage, "ok");
  commandInput.focus();
  playSound("login");
});

// Login form key sounds
[usernameInput, passwordInput].forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key.length === 1 || event.key === "Backspace") {
      playSound("keypress");
    }
  });
});

clearButton.addEventListener("click", () => {
  output.innerHTML = "";
  commandInput.focus();
});

themeButton.addEventListener("click", () => {
  runCommand("theme");
  commandInput.focus();
});

document.querySelector(".terminal").addEventListener("click", () => {
  commandInput.focus();
});

setPrompt();