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
    const text = form.elements["ids"];
    const radions = form.elements["type"];

    if (!radions.value.trim()) {
      createError("Поле не может быть пустым", radions);
      return false;
    }

    if (!text.value.trim()) {
      createError("Поле не может быть пустым", text);
      return false;
    }

    const idsOrName = text.value.trim().split("\n");
    const result = await window.electronAPI.runscrapper(
      idsOrName,
      radions.value
    );
    console.log(result);
  } catch (error) {
    console.error("Ошибка:", error);
  }
});
