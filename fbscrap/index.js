const puppeteer = require("puppeteer");

// Получаеи ид юзра и ссылок и просто ид
function extractUserId(input) {
  const regex = /(\d{8,})/;
  const match = input.match(regex);
  return match ? match[1] : null;
}

function randomDelay(min = 500, max = 1500) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// переключаем на фанку
async function switchProfile(page, fanpage) {
  try {
    console.log("Переключаем профиль...");

    await page.waitForSelector("[aria-label='Ваш профиль']", {
      timeout: randomDelay(),
    });

    await page.evaluate(() => {
      const target = document.querySelector("[aria-label='Ваш профиль']");
      if (target) target.click();
    });

    await page.waitForSelector(
      `[aria-label='Переключиться на профиль ${namefanpage}']`,
      {
        timeout: randomDelay(),
      }
    );

    await page.evaluate(() => {
      const target = document.querySelector(
        `[aria-label='Переключиться на профиль ${fanpage}']`
      );
      if (target) target.click();
    });

    console.log("Профиль успешно переключён");

    await page.waitForNavigation({ waitUntil: "networkidle2" });
  } catch (err) {
    console.error("Ошибка при переключении профиля:", err.message);
  }
}

async function blockUser(page, userId) {
  try {
    console.log(`Блокируем пользователя с ID: ${userId}`);

    await page.goto(`https://www.facebook.com/profile.php?id=${userId}`, {
      waitUntil: "networkidle2",
    });

    // кнопка три точки
    await page.waitForSelector(
      '[aria-label="Настройки профиля, смотреть дополнительные параметры"]',
      {
        timeout: randomDelay(),
      }
    );
    console.log("Настройки профиля найдены");

    await page.evaluate(() => {
      const element = document.querySelector(
        '[aria-label="Настройки профиля, смотреть дополнительные параметры"]'
      );
      if (element) element.click();
    });

    // кнопка заблокировать после трех точек
    await page.waitForSelector("[role=menuitem]", {
      timeout: randomDelay(),
    });
    console.log("Кнопка 'Заблокировать' найдена");

    await page.evaluate(() => {
      const menuItems = Array.from(
        document.querySelectorAll("[role=menuitem]")
      );

      const target = menuItems.find(
        (item) => item.textContent.trim() === "Заблокировать"
      );

      if (target) {
        target.click();
      } else {
        console.log("Кнопка 'Заблокировать' не найдена");
      }
    });

    // радио кнопка
    await page.waitForSelector("[role=radio]", {
      timeout: randomDelay(),
    });
    console.log("Кнопка 'Заблокировать' найдена");

    await page.evaluate(() => {
      const menuItems = Array.from(document.querySelectorAll("[role=radio]"));

      const target = menuItems[menuItems.length - 1].click();

      if (target) {
        target.click();
      } else {
        console.log("Кнопка 'Заблокировать' не найдена");
      }
    });

    // кнопка подтвердить
    await page.waitForSelector("[aria-label=Подтвердить]", {
      timeout: randomDelay(),
    });

    await page.evaluate(() => {
      const target = document.querySelector("[aria-label=Подтвердить]");
      
      if (target) {
        target.click();
        console.log(target);
      } else {
        console.log("Кнопка 'Подтвердить' не найдена");
      }
    });

    console.log("Кнопка 'Подтвердить' найдена");
  } catch (err) {
    console.error(`Ошибка при блокировке пользователя ${userId}:`, err.message);
  }
}

const intiScraper = async (login, pass, accs, fanpage) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Вход в Facebook
  await page.goto("https://www.facebook.com/login", {
    waitUntil: "networkidle2",
  });

  await page.type("#email", login, { delay: 300 });
  await page.type("#pass", pass, { delay: 400 });
  await page.click('button[name="login"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  console.log("Вход выполнен");

  // переход на фанку
  await switchProfile(page, fanpage);

  // Список ID или URL для блокировки
  const users = accs;

  for (const rawUser of users) {
    const userId = extractUserId(rawUser);

    if (!userId) {
      console.log(`Невозможно извлечь ID из ${rawUser}, пропускаем.`);
      continue;
    }

    await blockUser(page, userId);

    // Задержка между блокировками, чтобы не вызвать подозрения
    await new Promise((res) => setTimeout(res, 10000));
  }

  await browser.close();
};

module.exports = intiScraper;
