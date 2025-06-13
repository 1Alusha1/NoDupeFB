const form = document.querySelector("form");

const createError = (message, parent) => {
  const nextElem = parent.nextElementSibling;
  if (
    nextElem &&
    nextElem.classList.contains("error") &&
    nextElem.classList.contains("login")
  ) {
    return;
  }

  const span = document.createElement("span");
  span.innerHTML = message;
  span.classList.add("error");
  span.classList.add("login");
  parent.insertAdjacentElement("afterend", span);
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const login = form.elements["login"];
    const password = form.elements["password"];
    const text = form.elements["ids"];
    const fanPage = form.elements["fanPage"];

    if (!login.value.trim()) {
      createError("Поле не может быть пустым", login);
      return false;
    }
    if (!password.value.trim()) {
      createError("Поле не может быть пустым", password);
      return false;
    }
    if (!text.value.trim()) {
      createError("Поле не может быть пустым", text);
      return false;
    }

    const idsList = text.value.trim().split(" ");
    const result = await window.electronAPI.runscrapper(
      idsList,
    );
    console.log(result);
  } catch (error) {
    console.error("Ошибка:", error);
  }
});
