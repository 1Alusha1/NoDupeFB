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
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function blockUser(page, userId, type) {
  try {
    console.log(`Блокируем пользователя с ID: ${userId}`);
    let url;
    if (type === "byId") {
      url = `https://www.facebook.com/profile.php?id=${userId}`;
    } else {
      url = userId;
    }

    await page.goto(url, {
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

const intiScraper = async (accs, type) => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  const page = await browser.newPage();

  // Вход в Facebook
  await page.goto("https://www.facebook.com/login", {
    waitUntil: "networkidle2",
  });

  setTimeout(async () => {
    await startScrapper(accs, type, page);
  }, 60000);
};

const startScrapper = async (accs, type, page) => {
  console.log(accs, type);
  switch (type) {
    case "byId":
      const users = accs;

      for (const rawUser of users) {
        const userId = extractUserId(rawUser);

        if (!userId) {
          console.log(`Невозможно извлечь ID из ${rawUser}, пропускаем.`);
          continue;
        }

        setTimeout(async () => {
          await blockUser(page, userId, "byId");
        }, 60000);

        // Задержка между блокировками, чтобы не вызвать подозрения
        await new Promise((res) => setTimeout(res, 10000));
      }
    case "byName":
      const names = accs;

      for (let name of names) {
        await page.goto(`https://www.facebook.com/search/people/?q=${name}`, {
          waitUntil: "networkidle2",
        });

        await page.waitForSelector('[role="feed"]', {
          timeout: randomDelay(),
        });
        console.log(`[role="feed"] найдено для ${name}`);

        await delay(3000); // ждем для подгрузки

        const profileLinks = await page.evaluate(() => {
          const feed = document.querySelector('[role="feed"]');
          if (!feed) return [];

          const links = [];
          const children = feed.children;

          Array.from(children).forEach((item) => {
            const a = item.querySelector("a");
            if (a && a.href) {
              links.push(a.href);
            }
          });

          return links;
        });

        console.log(`Найдено ссылок: ${profileLinks.length}`);
        console.log(profileLinks);
        for (let link of profileLinks) {
          console.log(`Обрабатываем ссылку: ${link}`);

          const userId = link;
          console.log(`Извлечён userId: ${userId}`);

          if (userId) {
            await blockUser(page, userId, "byName");
            await delay(10000); // задержка между блокировками
          } else {
            console.log(`Не удалось извлечь userId для ссылки ${link}`);
          }
        }
      }
  }
};

module.exports = intiScraper;
