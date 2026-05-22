const startupMessage = [
  "Noir.OS Version 0.8.0.91 Terminal Version 1.0.0",
  "Copyright (C) Noir Systems. All rights reserved.",
  "Type help to list commands."
].join("\n");

function text(value) {
  return { type: "text", text: value };
}

function image(src, alt = "Command image") {
  return { type: "image", src, alt };
}

function link(href, label = href) {
  return { type: "link", href, label };
}

function group(...items) {
  return { type: "group", items: items.flat() };
}

function images(...sources) {
  return group(sources.flat().map((src, index) => image(src, `Image ${index + 1}`)));
}

function loading(seconds = 1) {
  return { type: "loading", seconds };
}

const customCommands = [
  {
    name: "about",
    description: "Shows the Noir.os identity",
    run() {
      return [
        "Noir.os Terminal",
        "An experimental command-driven system.",
        "Edit commands.js to create your own commands."
      ].join("\n");
    }
  },
  {
    name: "govfiles",
    description: "Government-only secure files",
    allowedUsers: ["government.ascent"],
    run(args, api) {
      return [
        "Government Access Granted",
        `User: ${api.state.user}`,
        "Secure archive: OS-GOV-001",
        "Status: classified"
      ].join("\n");
    }
  },
  {
    name: "labnotes",
    description: "Robert-only research notes",
    allowedUsers: ["robert"],
    run(args, api) {
      return [
        "Research Access Granted",
        `User: ${api.state.user}`,
        "Project: temporal systems",
        "Status: unstable"
      ].join("\n");
    }
  },
    {
    name: "GovernmentExpose.txt",
    description: "Robert-only notes",
    allowedUsers: ["robert"],
    run(args, api) {
      return [
        "Access Granted",
        "",
        `User: ${api.state.user}`,
        "",
        "Document: GovernmentExpose.txt",
        "",
        "Status: leaked",
        "",
        "This document contains sensitive information about the government's involvement in secret projects and operations, including details about the Noir OS development and its potential implications for society. The leak of this document has caused a significant stir in the media and has led to increased scrutiny of government activities.",
        "",
        "About Noir OS: w.i.p and experimental OS developed by Ascent Government, designed to be a secure operation system for ascent citzens but it turned being such another government project made for control the city",
      ].join("\n");
    }
  },
  {
    name: "antivirus",
    description: "Runs a simulated security scan",
    run() {
      return [
        "Noir Guardian",
        "Scanning memory... ok",
        "Scanning apps... ok",
        "Scanning custom commands... ok",
        "Status: protected"
      ].join("\n");
    }
  },
  {
    name: "project",
    description: "Shows the project images",
    run(args, api) {
      loading(10)
      const sources = args.length ? args : [
        "https://plain-enam-prod-public.komododecks.com/202605/15/TFtIty8fCy9RQtXfo0iT/image.png",
        "https://plain-enam-prod-public.komododecks.com/202605/15/IQRVtzeTGngdhqKMviA0/image.png"
      ];
      return group(
        text("Project images:"),
        sources.map((src, index) => image(src, `Project image ${index + 1}`)),
        text("Image's Took From Scientist Raid Operation")
      );
    }
  },
  {
    name: "logout",
    description: "Signs out and returns to the login screen",
    run(args, api) {
      // Small delay so the user sees the logout message before screen switches
      setTimeout(() => {
        // Reset state
        api.state.user = "";
        api.state.authenticated = false;
        api.state.cwd = "\\Users\\Noir";
        api.state.history = [];
        api.state.historyIndex = 0;

        // Clear output
        document.querySelector("#output").innerHTML = "";

        // Hide terminal, show login
        document.querySelector("#terminal").classList.add("is-hidden");
        document.querySelector("#loginPanel").classList.remove("is-hidden");

        // Reset login form
        document.querySelector("#usernameInput").value = "";
        document.querySelector("#passwordInput").value = "";
        document.querySelector("#loginError").textContent = "";
        document.querySelector("#usernameInput").focus();

        // Reset prompt
        api.setPrompt();
      }, 600);

      return text("Signing out...");
    }
  },
];

const easterEggs = [
  {
    trigger: "sudo make me coffee",
    response: "Permission denied: coffee is not implemented yet."
  },
];