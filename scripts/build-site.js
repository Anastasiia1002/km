import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public");
const siteUrl = "https://km-trade.net";

const phonePrimary = "+380961584385";
const phoneSecondary = "+380950584385";
const phoneDisplay = "+38 096 158-43-85";
const phoneDisplay2 = "+38 095 058-43-85";
const email = "info@km-trade.net";

const regions = [
  {
    slug: "gps-monitoring-chernivtsi",
    city: "Чернівці",
    oblast: "Чернівецька область",
    title: "GPS моніторинг транспорту у Чернівцях",
    description:
      "GPS-моніторинг автопарку у Чернівцях на Wialon: встановлення сьогодні, тест-драйв 14 днів, від 250 грн/авто/міс.",
    hero:
      "GPS-моніторинг транспорту у Чернівцях — встановлення сьогодні",
    inCity: "у Чернівцях",
    local:
      "Головний офіс КМ-Трейд знаходиться у Чернівцях, тому монтажник може виїхати до вас у день звернення або наступного ранку.",
    keys: ["gps моніторинг Чернівці", "контроль пального Чернівці", "Wialon Чернівці"],
  },
  {
    slug: "gps-monitoring-ivano-frankivsk",
    city: "Івано-Франківськ",
    oblast: "Івано-Франківська область",
    title: "GPS моніторинг у Івано-Франківську",
    description:
      "GPS-моніторинг транспорту в Івано-Франківську і області: Wialon, контроль пального, виїзд майстра, 14 днів тест-драйву.",
    hero:
      "GPS-моніторинг автопарку в Івано-Франківську без очікування майстра з Києва",
    inCity: "в Івано-Франківську",
    local:
      "Працюємо по всій Івано-Франківській області: підбираємо обладнання, виїжджаємо на монтаж і супроводжуємо автопарк після запуску.",
    keys: ["gps моніторинг Івано-Франківськ", "контроль транспорту ІФ", "Wialon Франківськ"],
  },
  {
    slug: "gps-monitoring-ternopil",
    city: "Тернопіль",
    oblast: "Тернопільська область",
    title: "GPS моніторинг у Тернополі",
    description:
      "Підключення GPS-моніторингу Wialon для транспорту у Тернополі: контроль маршрутів, пального і водіїв, від 250 грн/авто.",
    hero:
      "GPS-моніторинг транспорту у Тернополі для автопарків від 3 авто",
    inCity: "у Тернополі",
    local:
      "Обслуговуємо Тернопіль і область без залучення далеких підрядників: аудит, монтаж, навчання диспетчерів і підтримка 24/7.",
    keys: ["gps моніторинг Тернопіль", "gps контроль пального Тернопіль", "Wialon Тернопіль"],
  },
  {
    slug: "gps-monitoring-khmelnytskyi",
    city: "Хмельницький",
    oblast: "Хмельницька область",
    title: "GPS моніторинг у Хмельницькому",
    description:
      "GPS-моніторинг транспорту у Хмельницькому та області: Wialon, контроль пального, персональний менеджер, тест 14 днів.",
    hero:
      "GPS-моніторинг автопарку у Хмельницькому з виїздом по області",
    inCity: "у Хмельницькому",
    local:
      "Підключаємо автопарки у Хмельницькому та області: вантажівки, агротехніку, будтехніку, таксі, доставку і корпоративні авто.",
    keys: ["gps моніторинг Хмельницький", "контроль транспорту Хмельницький", "Wialon Хмельницький"],
  },
];

const industries = [
  {
    slug: "gps-dlya-vantazhivok",
    icon: "🚚",
    name: "Вантажні перевезення",
    short: "Фури, фургони, рефрижератори",
    title: "GPS-моніторинг для вантажних перевезень",
    description:
      "GPS для вантажівок на Wialon: контроль маршрутів, пального, швидкості, рефрижераторів і водіїв по Західній Україні.",
    intro:
      "Для перевізника кожен зайвий кілометр, злив пального або проста доставка напряму б'є по маржі. GPS-моніторинг показує маршрут, швидкість, стоянки, витрати пального і відхилення від плану в реальному часі.",
    features: [
      ["Онлайн-карта маршрутів", "Бачите де кожна вантажівка і чи рухається вона за погодженим маршрутом."],
      ["Контроль пального", "Датчик рівня палива фіксує заправки, витрати і різкі зливи."],
      ["Геозони клієнтів", "Автоматична фіксація прибуття на склад, термінал або точку доставки."],
      ["Температура рефрижератора", "Для холодної логістики можна контролювати температуру вантажу."],
    ],
  },
  {
    slug: "gps-dlya-agro",
    icon: "🌾",
    name: "Агросектор",
    short: "Трактори, комбайни, агротехніка",
    title: "GPS-моніторинг для агротехніки",
    description:
      "GPS для агро у Чернівецькій, Івано-Франківській, Тернопільській і Хмельницькій областях: контроль ДП, площ і техніки.",
    intro:
      "Агробізнесу важливо бачити не тільки координати техніки, а й фактичну роботу у полі: площі, мотогодини, витрати дизелю, нічні виїзди і простої.",
    features: [
      ["Облік оброблених площ", "Контроль проходів по полю і фактичної площі виконаних робіт."],
      ["Контроль дизелю", "Фіксація заправок, витрат і підозрілих падінь рівня пального."],
      ["Охорона техніки", "Сповіщення при запуску двигуна або виїзді з геозони вночі."],
      ["Звіти для агронома", "Аналітика по полях, механізаторах, сезонах і видах робіт."],
    ],
  },
  {
    slug: "gps-dlya-budtekhniky",
    icon: "🏗",
    name: "Будтехніка",
    short: "Екскаватори, крани, бетономішалки",
    title: "GPS-моніторинг будівельної техніки",
    description:
      "GPS для будтехніки: контроль мотогодин, простоїв, пального і геозон будмайданчиків у 4 областях Заходу України.",
    intro:
      "Будівельна техніка має працювати на об'єкті, а не простоювати або виїжджати без дозволу. GPS допомагає контролювати завантаженість і витрати дорогого дизелю.",
    features: [
      ["Облік мотогодин", "Планування ТО за фактичним часом роботи двигуна."],
      ["Контроль простоїв", "Видно, коли техніка стоїть із заведеною технікою або не використовується."],
      ["Геозони об'єктів", "Сповіщення при виїзді з будмайданчика або нічному запуску."],
      ["Пальне і заправки", "Контроль ДП для екскаваторів, кранів, міксерів і генераторів."],
    ],
  },
  {
    slug: "gps-dlya-taksi",
    icon: "🚕",
    name: "Таксі і маршрутки",
    short: "Пасажирський транспорт",
    title: "GPS-моніторинг для таксі і маршрутного транспорту",
    description:
      "GPS для таксі, маршруток і пасажирського транспорту: контроль розкладу, швидкості, маршрутів і безпеки.",
    intro:
      "Для пасажирських перевезень GPS — це контроль дотримання маршруту, безпеки пасажирів і чесної роботи водіїв у зміні.",
    features: [
      ["Контроль маршруту", "Порівняння фактичного руху з маршрутом або зміною."],
      ["Швидкість і стиль водіння", "Сповіщення про перевищення, різкі гальмування і небезпечні маневри."],
      ["Диспетчеризація", "Диспетчер бачить парк онлайн і може швидко реагувати на затримки."],
      ["Звіти по змінах", "Пробіг, час роботи, зупинки і простої по кожному водію."],
    ],
  },
  {
    slug: "gps-dlya-dostavky",
    icon: "📦",
    name: "Доставка",
    short: "Кур'єри, e-commerce, остання миля",
    title: "GPS-моніторинг для служб доставки",
    description:
      "GPS для кур'єрів і доставки: оптимізація маршрутів, контроль запізнень, пробігу і службового транспорту.",
    intro:
      "Службам доставки важливо скорочувати час у дорозі, бачити кур'єрів онлайн і зменшувати кількість скарг клієнтів на запізнення.",
    features: [
      ["Оптимізація маршрутів", "Менше зайвих кілометрів і швидше виконання доставки."],
      ["Контроль кур'єрів", "Видно фактичний шлях, стоянки і час на кожній адресі."],
      ["Повідомлення клієнтам", "Дані GPS можна використовувати для прозорого трекінгу."],
      ["Мобільний контроль", "Керівник бачить парк у Wialon з телефону."],
    ],
  },
  {
    slug: "gps-dlya-korporatyvnoho-parku",
    icon: "🏭",
    name: "Корпоративний парк",
    short: "Підприємства, торгові команди",
    title: "GPS-моніторинг корпоративного автопарку",
    description:
      "GPS для корпоративних авто: контроль службових поїздок, пробігу, пального, графіків і звітності для бухгалтерії.",
    intro:
      "Компанії зі службовими авто часто переплачують через особисті поїздки, накручений пробіг і хаотичне планування маршрутів. GPS робить використання транспорту прозорим.",
    features: [
      ["Службові маршрути", "Фіксація фактичних поїздок і відхилень від плану."],
      ["Звіти для бухгалтерії", "Пробіг, пальне, простої і робочий час у готових звітах."],
      ["Особисті поїздки", "Контроль використання авто після роботи або у вихідні."],
      ["Персональний менеджер", "Один контакт для керівника, бухгалтера і диспетчера."],
    ],
  },
  {
    slug: "gps-dlya-azs",
    icon: "⛽",
    name: "АЗС і паливна логістика",
    short: "Бензовози, заправки, контроль зливів",
    title: "GPS-моніторинг для АЗС і паливної логістики",
    description:
      "GPS для бензовозів і паливної логістики: контроль маршрутів, зливів, геозон АЗС і безпеки перевезень.",
    intro:
      "Для паливної логістики потрібен суворий контроль маршруту, стоянок, заправок, зливів і відповідальності водія на кожному етапі перевезення.",
    features: [
      ["Геозони АЗС", "Контроль прибуття, виїзду і простою на точках."],
      ["Маршрут бензовоза", "Фіксація відхилень від погодженого маршруту."],
      ["Контроль пального", "Аналітика витрат і підозрілих операцій."],
      ["Безпека", "Сповіщення про зупинки у небезпечних або непогоджених місцях."],
    ],
  },
  {
    slug: "gps-dlya-mizhnarodnykh-reysiv",
    icon: "🌍",
    name: "Міжнародні рейси",
    short: "Рейси Україна-ЄС",
    title: "GPS-моніторинг міжнародних рейсів",
    description:
      "GPS для міжнародних перевезень: моніторинг рейсів за кордоном, контроль маршруту, стоянок і температури.",
    intro:
      "У міжнародних рейсах важливо бачити транспорт не тільки в Україні, а й за кордоном: черги, стоянки, відхилення, температурні ризики і час прибуття.",
    features: [
      ["Моніторинг за кордоном", "Контроль маршруту у міжнародних рейсах через Wialon."],
      ["ETA і стоянки", "Прогноз прибуття, історія зупинок і затримок."],
      ["Температура вантажу", "Для рефрижераторів — контроль температурного режиму."],
      ["Звіти для клієнта", "Прозора історія рейсу для замовника і диспетчера."],
    ],
  },
];

const articles = [
  {
    slug: "kontrol-palnoho",
    icon: "⛽",
    category: "Пальне",
    date: "Квітень 2026",
    title: "Як зупинити злив пального: покроковий гід для власника автопарку",
    description:
      "Як виявити і зупинити злив пального за допомогою GPS, датчиків рівня пального, геозон і звітів Wialon.",
    excerpt:
      "Реальні способи виявлення та запобігання несанкціонованим зливам пального з GPS і датчиками рівня пального.",
    body: [
      ["h2", "Як відбувається злив пального"],
      ["p", "Основні схеми однакові для більшості автопарків: злив під час стоянки, завищення витрат у шляхових листах, неповні заправки при повному чеку або несанкціоновані заїзди на АЗС."],
      ["h2", "Що дає GPS-моніторинг"],
      ["ul", ["Фіксує маршрут, зупинки і пробіг кожного авто.", "Показує заправки і різкі падіння рівня пального.", "Надсилає сповіщення при зливі або виїзді з геозони.", "Формує звіт по водію, авто і періоду."]],
      ["h2", "Як швидко окупається"],
      ["p", "Для парку з 5-10 авто навіть один підтверджений злив часто перекриває місячну абонплату. У більшості клієнтів економія формується за рахунок дисципліни водіїв уже в перший місяць."],
    ],
  },
  {
    slug: "shcho-take-wialon",
    icon: "🛰",
    category: "Технологія",
    date: "Березень 2026",
    title: "Що таке Wialon і чому його обирають для GPS-моніторингу",
    description:
      "Огляд Wialon Local і Wialon Hosting: можливості платформи для контролю транспорту, пального і звітності.",
    excerpt:
      "Wialon — платформа GPS-моніторингу, якій довіряють компанії у 130+ країнах. Пояснюємо, як вона працює.",
    body: [
      ["h2", "Wialon простими словами"],
      ["p", "Wialon — це програмна платформа для GPS-моніторингу транспорту. Трекер у авто передає координати, швидкість, стан запалювання, дані датчиків пального та інші параметри на сервер, а власник бачить це в браузері або мобільному застосунку."],
      ["h2", "Wialon Hosting і Wialon Local"],
      ["ul", ["Wialon Hosting — хмарний варіант для малого і середнього бізнесу.", "Wialon Local — серверне рішення для великих компаній або вимог до власної інфраструктури.", "Обидва варіанти підтримують звіти, геозони, сповіщення і мобільний доступ."]],
      ["h2", "Чому КМ-Трейд використовує Wialon"],
      ["p", "Платформа підтримує тисячі моделей обладнання, гнучкі звіти, API-інтеграції і масштабування від кількох авто до великих автопарків."],
    ],
  },
  {
    slug: "okupnist-gps-monitoringu",
    icon: "💰",
    category: "Бізнес",
    date: "Лютий 2026",
    title: "За скільки окупиться GPS-моніторинг: розрахунок для бізнесу",
    description:
      "Пояснюємо ROI GPS-моніторингу: економія пального, пробігу, ТО, штрафів і контроль службового транспорту.",
    excerpt:
      "Розрахунок окупності GPS-моніторингу для автопарку: де саме виникає економія і як рахувати ROI.",
    body: [
      ["h2", "З чого складається економія"],
      ["ul", ["Пальне: контроль зливів і норм витрат.", "Пробіг: менше особистих поїздок і зайвих маршрутів.", "ТО: менше зносу через контроль швидкості і стилю водіння.", "Диспетчеризація: швидше планування і менше ручної звітності."]],
      ["h2", "Приклад"],
      ["p", "Якщо 5 вантажівок проїжджають по 5 000 км на місяць з витратою 30 л/100 км, навіть 15-20% економії пального перекриває абонплату у кілька разів."],
      ["h2", "Як перевірити на своєму парку"],
      ["p", "Найпростіший шлях — тест-драйв на 1 авто. За 14 днів видно маршрути, стоянки, витрати пального і типові порушення."],
    ],
  },
  {
    slug: "gps-dlya-traktora-zakhid-ukraina",
    icon: "🌾",
    category: "Агро",
    date: "Квітень 2026",
    title: "GPS для трактора на Заході України: контроль поля, дизелю і механізатора",
    description:
      "Як GPS-моніторинг допомагає агропідприємствам контролювати трактори, поля, мотогодини і витрати дизелю.",
    excerpt:
      "Для агро GPS — це не тільки точка на карті, а контроль площ, мотогодин, пального і нічних виїздів.",
    body: [
      ["h2", "Що контролювати в агро"],
      ["p", "Для трактора важливі маршрут по полю, оброблена площа, мотогодини, паливо, швидкість виконання робіт і час простою."],
      ["h2", "Практична користь"],
      ["ul", ["Агроном бачить, де техніка працювала фактично.", "Власник контролює дизель і несанкціоновані виїзди.", "Бухгалтерія отримує звіти по мотогодинах і пробігу."]],
      ["h2", "Де працюємо"],
      ["p", "КМ-Трейд виїжджає до агропідприємств у Чернівецькій, Івано-Франківській, Тернопільській і Хмельницькій областях."],
    ],
  },
  {
    slug: "yak-pereviryty-vodiya-gps",
    icon: "🧭",
    category: "Водії",
    date: "Травень 2026",
    title: "Як перевірити водія через GPS без конфліктів і ручних дзвінків",
    description:
      "GPS-звіти для контролю водія: маршрут, швидкість, стоянки, пробіг, зливи пального і робочий час.",
    excerpt:
      "GPS прибирає суперечки: у звіті видно маршрут, швидкість, стоянки, пробіг і час роботи водія.",
    body: [
      ["h2", "Що видно у Wialon"],
      ["ul", ["Місцезнаходження авто онлайн.", "Історію маршруту за будь-який день.", "Швидкість, стоянки, запалювання і пробіг.", "Відхилення від геозон і заданих маршрутів."]],
      ["h2", "Чому це працює"],
      ["p", "Коли водій знає, що маршрут і паливо прозорі, дисципліна зростає без щоденних дзвінків диспетчера."],
      ["h2", "Як почати"],
      ["p", "Почніть з 1 авто на тест-драйві: за 14 днів буде достатньо даних для першого управлінського рішення."],
    ],
  },
  {
    slug: "gps-monitoring-u-zakhidniy-ukraini",
    icon: "📍",
    category: "Регіони",
    date: "Червень 2026",
    title: "GPS-моніторинг на Заході України: чому локальний монтаж важливий",
    description:
      "Пояснюємо, чому для GPS-моніторингу важливий локальний партнер у Чернівцях, Івано-Франківську, Тернополі і Хмельницькому.",
    excerpt:
      "Не завжди варто чекати майстра з Києва або Черкас: локальна команда швидше монтує, навчає і підтримує.",
    body: [
      ["h2", "Швидкість монтажу"],
      ["p", "Автопарк не повинен стояти тиждень у черзі. Локальна команда може приїхати швидше, оглянути авто і встановити трекери без зупинки операцій."],
      ["h2", "Підтримка після запуску"],
      ["p", "GPS-моніторинг — це не тільки обладнання. Потрібні налаштування звітів, навчання диспетчера, підтримка і сервіс обладнання."],
      ["h2", "Покриття КМ-Трейд"],
      ["p", "КМ-Трейд працює по Чернівецькій, Івано-Франківській, Тернопільській і Хмельницькій областях."],
    ],
  },
];

const painCards = [
  ["⛽", "Зливають пальне", "Несанкціоновані зливи з бака та махінації з чеками на АЗС.", "До 8 000 грн/авто/рік"],
  ["🚗", "Їздять у особистих цілях", "Службовий транспорт використовується після роботи або у вихідні.", "До 5 000 грн/авто/рік"],
  ["🗺", "Відхиляються від маршруту", "Водії змінюють маршрут, затримують доставку і пояснюють це постфактум.", "Штрафи від клієнтів"],
  ["🔢", "Накручують пробіг", "Фіктивні кілометри збільшують витрати на пальне і ТО.", "До 4 000 грн/авто/рік"],
  ["🚦", "Порушують ПДР", "Перевищення швидкості та ризики штрафів для компанії.", "Штрафи за ваш рахунок"],
  ["⚠️", "Небезпечно водять", "Різкі гальмування і прискорення зношують техніку швидше.", "Ремонт + амортизація"],
];

const prices = [
  {
    name: "Стандарт",
    price: "250 грн",
    note: "за 1 авто / місяць",
    featured: true,
    features: ["GPS-моніторинг онлайн 24/7", "Платформа Wialon", "Маршрути, зупинки, швидкість", "Push-сповіщення", "Гарантійний сервіс 1 рік безкоштовно"],
  },
  {
    name: "Комуналка",
    price: "від 150 грн",
    note: "за 1 авто / місяць",
    featured: false,
    features: ["Для ЖКГ, ОСББ і комунальних служб", "Специфічні звіти для бухгалтерів", "Доступ керівника і диспетчера", "Умови обладнання уточнюються"],
  },
  {
    name: "VIP",
    price: "250 грн",
    note: "за авто від 50 авто",
    featured: false,
    features: ["Весь сервіс безкоштовний з першого дня", "Персональний менеджер", "Пріоритетна підтримка", "Пост-гарантійний сервіс включено"],
  },
];

const compare = [
  ["Локація офісу", "Черкаси", "Київ", "Черкаси", "Чернівці"],
  ["Виїзд по Заходу", "Тиждень+", "Тиждень+", "Тиждень+", "Сьогодні або завтра"],
  ["Персональний менеджер", "Колл-центр", "Колл-центр", "Немає", "Особисто"],
  ["Платформа", "Wialon", "Власна", "Wialon", "Wialon"],
  ["Ціна підписки", "~400 грн", "~450 грн", "~350 грн", "від 250 грн"],
  ["Гарантія сервісу", "Платний", "Платний", "Платний", "1 рік безкоштовно"],
  ["Тест-драйв", "Обмежений", "10 днів", "Немає", "14 днів безкоштовно"],
  ["Регіон Захід UA", "Немає офісу", "Немає офісу", "Немає офісу", "Головний регіон"],
];

function html(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function url(pathname = "") {
  const cleaned = pathname.replace(/^\/+|\/+$/g, "");
  return cleaned ? `${siteUrl}/${cleaned}/` : `${siteUrl}/`;
}

function pagePath(route) {
  if (route === "/") return path.join(outDir, "index.html");
  return path.join(outDir, route.replace(/^\/+|\/+$/g, ""), "index.html");
}

function logo() {
  return `<a class="logo" href="/">
    <span class="logo-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></span>
    <span><span class="logo-text">KM-Trade</span><span class="logo-sub">GPS-моніторинг · Захід України</span></span>
  </a>`;
}

function header() {
  const regionLinks = regions.map((r) => `<a href="/${r.slug}/"><span class="di">📍</span>${r.city}</a>`).join("");
  const industryLinks = industries.slice(0, 6).map((i) => `<a href="/${i.slug}/"><span class="di">${i.icon}</span>${i.name}</a>`).join("");
  const articleLinks = articles.slice(0, 3).map((a) => `<a href="/statti/${a.slug}/"><span class="di">${a.icon}</span>${a.category}</a>`).join("");
  return `<header>
    <div class="container">
      <div class="header-inner">
        ${logo()}
        <nav aria-label="Головна навігація">
          <div class="nav-dropdown"><a href="/#industries">Рішення</a><div class="dropdown-menu">${industryLinks}</div></div>
          <div class="nav-dropdown"><a href="/statti/">Статті</a><div class="dropdown-menu"><a href="/statti/"><span class="di">📚</span>Всі статті</a>${articleLinks}</div></div>
          <a href="/#pricing">Ціни</a>
          <a href="/#cases">Кейси</a>
          <div class="nav-dropdown"><a href="/#regions">Регіони</a><div class="dropdown-menu">${regionLinks}</div></div>
          <a href="/#contacts">Контакти</a>
        </nav>
        <div class="header-cta">
          <a class="header-phone js-call" href="tel:${phonePrimary}">📞 ${phoneDisplay}</a>
          <a class="btn btn-primary" href="#lead-form" data-scroll-form>Залишити заявку</a>
        </div>
      </div>
    </div>
  </header>`;
}

function footer() {
  return `<footer id="contacts">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">${logo()}</div>
          <p class="footer-desc">GPS-моніторинг транспорту на платформі Wialon Local / Wialon Hosting. Виїзд і сервіс по Чернівецькій, Івано-Франківській, Тернопільській та Хмельницькій областях.</p>
          <div class="footer-phones">
            <a class="footer-phone js-call" href="tel:${phonePrimary}">${phoneDisplay}</a>
            <a class="footer-phone js-call" href="tel:${phoneSecondary}">${phoneDisplay2}</a>
            <a class="footer-phone" href="mailto:${email}">${email}</a>
          </div>
        </div>
        <div><div class="footer-col-title">Рішення</div><div class="footer-links">${industries.slice(0, 6).map((i) => `<a href="/${i.slug}/">${i.name}</a>`).join("")}</div></div>
        <div><div class="footer-col-title">Статті</div><div class="footer-links">${articles.slice(0, 5).map((a) => `<a href="/statti/${a.slug}/">${a.category}</a>`).join("")}</div></div>
        <div><div class="footer-col-title">Регіони</div><div class="footer-links">${regions.map((r) => `<a href="/${r.slug}/">${r.city}</a>`).join("")}</div></div>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-bottom">
        <span class="footer-copy">© 2026 КМ-Трейд. GPS-моніторинг транспорту на Заході України.</span>
        <div class="footer-bottom-links"><a href="/oferta/">Оферта</a><a href="/konfidentsiynist/">Конфіденційність</a></div>
      </div>
    </div>
  </footer>
  <div class="sticky-cta">
    <a href="tel:${phonePrimary}" class="btn btn-outline js-call">📞 Дзвінок</a>
    <a href="#lead-form" class="btn btn-primary" data-scroll-form>Залишити заявку</a>
  </div>
  <div class="notification" id="notification" role="status" aria-live="polite">✓ Заявку отримано! Передзвонимо за 15 хвилин</div>`;
}

function leadForm({ title = "Залишити заявку", region = "", compact = false } = {}) {
  const regionOptions = [`<option value="">Оберіть регіон</option>`]
    .concat(regions.map((r) => `<option value="${r.city}" ${region === r.city ? "selected" : ""}>${r.city}</option>`))
    .concat(`<option value="Інше">Інше місто</option>`)
    .join("");
  return `<form class="trial-form lead-form" id="lead-form" data-form-name="trial">
    <input type="text" name="company_site" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <h3>${html(title)}</h3>
    <div class="form-row">
      <div class="form-field"><label for="lead-name">Ім'я</label><input id="lead-name" name="name" type="text" placeholder="Іван Коваленко" required></div>
      <div class="form-field"><label for="lead-phone">Телефон</label><input id="lead-phone" name="phone" type="tel" placeholder="+38 096 ..." required></div>
    </div>
    <div class="form-row ${compact ? "form-row-compact" : ""}">
      <div class="form-field"><label for="lead-cars">Кількість авто</label><select id="lead-cars" name="cars" required><option value="">Оберіть</option><option>1-3 авто</option><option>4-10 авто</option><option>11-30 авто</option><option>31-50 авто</option><option>50+ авто</option></select></div>
      <div class="form-field"><label for="lead-region">Регіон</label><select id="lead-region" name="region" required>${regionOptions}</select></div>
    </div>
    <input type="hidden" name="savings" id="lead-savings">
    <input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign"><input type="hidden" name="utm_content"><input type="hidden" name="utm_term">
    <button class="btn btn-primary form-submit" type="submit">Отримати безкоштовний тест-драйв →</button>
    <p class="form-note">Передзвонимо за 15 хвилин · Дані заявки передаються менеджеру в Telegram</p>
  </form>`;
}

function trialSection(region = "") {
  return `<section class="trial-section" id="trial">
    <div class="container">
      <h2 class="trial-title">14 днів безкоштовно</h2>
      <p class="trial-sub">Встановимо на 1 авто без оплати. Ви побачите маршрути, витрати, стоянки і звіти Wialon — і тільки тоді вирішите щодо всього парку.</p>
      <div class="trial-perks">
        <span class="trial-perk">Без передоплати</span>
        <span class="trial-perk">Встановлення за 1 день</span>
        <span class="trial-perk">Особистий менеджер</span>
        <span class="trial-perk">Повний доступ Wialon</span>
        <span class="trial-perk">Звіт після тесту</span>
      </div>
      ${leadForm({ region })}
    </div>
  </section>`;
}

function ctaBox(title = "Готові спробувати на своєму автопарку?", text = "14 днів тест-драйву на 1 авто. Виїжджаємо по 4 областях Заходу України.") {
  return `<div class="article-cta-box"><h3>${html(title)}</h3><p>${html(text)}</p><a class="btn btn-primary" href="#lead-form" data-scroll-form>Спробувати безкоштовно →</a></div>`;
}

function mockup() {
  return `<div class="hero-visual">
    <div class="hero-mockup">
      <div class="mockup-header"><span class="mockup-title">Wialon Live Map</span><span class="mockup-status">Онлайн — 14 авто</span></div>
      <div class="mockup-map"><div class="map-grid"></div><svg class="route-svg" viewBox="0 0 300 200"><polyline points="60,160 90,120 130,100 170,80 210,90 250,60" fill="none" stroke="#2D6BE4" stroke-width="2.5" stroke-dasharray="6 3"/></svg><div class="map-car">🚛</div></div>
      <div class="mockup-vehicles">
        <div class="vehicle-row"><span>СЕ 1234 АА</span><b class="status-active">▶ Рухається</b></div>
        <div class="vehicle-row"><span>АТ 5678 ВВ</span><b class="status-stop">⏸ Стоянка</b></div>
        <div class="vehicle-row"><span>ВО 9012 СС</span><b class="status-active">▶ 82 км/год</b></div>
        <div class="vehicle-row"><span>ВХ 3456 DD</span><b class="status-active">▶ Рухається</b></div>
      </div>
    </div>
    <div class="hero-float-card float-1"><div class="float-icon fi-green">📉</div><div><b>−20%</b><span>Економія пального</span></div></div>
    <div class="hero-float-card float-2"><div class="float-icon fi-blue">⚡</div><div><b>14 днів</b><span>Безкоштовний тест</span></div></div>
  </div>`;
}

function homePage() {
  return `<section class="hero">
    <div class="container">
      <div class="hero-inner">
        <div>
          <div class="hero-badge"><span></span> Чернівці · Івано-Франківськ · Тернопіль · Хмельницький</div>
          <h1>GPS-моніторинг автопарку на Заході України — <em>встановлення сьогодні</em></h1>
          <p class="hero-sub">КМ-Трейд — авторизований партнер Wialon / Gurtam з Чернівців. Виїжджаємо по Чернівецькій, Івано-Франківській, Тернопільській та Хмельницькій областях, підключаємо транспорт і допомагаємо економити пальне.</p>
          <div class="region-badges">${regions.map((r) => `<a href="/${r.slug}/">${r.city}</a>`).join("")}</div>
          <div class="hero-actions"><a class="btn btn-primary" href="#trial">Спробувати 14 днів безкоштовно →</a><a class="btn btn-outline" href="#calc">Порахувати економію</a></div>
          <p class="hero-price">Від <strong>250 грн / авто / місяць</strong> · Виїзд сьогодні або завтра</p>
          <div class="hero-stats"><div><b>350+</b><span>Клієнтів</span></div><div><b>3 200+</b><span>Авто обслужено</span></div><div><b>10 р.</b><span>Досвіду</span></div><div><b>4 обл.</b><span>Покриття</span></div></div>
        </div>
        ${mockup()}
      </div>
    </div>
  </section>
  <div class="trust-bar"><div class="container"><div class="trust-bar-inner"><span>📍 Чернівці · Івано-Франківськ · Тернопіль · Хмельницький</span><span>🛰 Авторизований партнер Gurtam (Wialon)</span><span>⚡ Встановлення за 1 день</span><span>🔧 Підтримка 24/7</span><span>✅ 10 років досвіду</span></div></div></div>
  <section class="section">
    <div class="container">
      <div class="tag">⚠️ Болі клієнта</div>
      <h2 class="title">Вам потрібен GPS-моніторинг, якщо водії...</h2>
      <p class="subtitle">Кожна проблема коштує бізнесу тисячі гривень на рік. Wialon робить маршрут, пальне і стиль водіння прозорими.</p>
      <div class="pain-grid">${painCards.map(([icon, title, text, cost]) => `<article class="pain-card"><div class="pain-icon">${icon}</div><h3>${title}</h3><p>${text}</p><strong>${cost}</strong></article>`).join("")}</div>
      <div class="center-cta"><a class="btn btn-outline" href="#calc">Впізнали своїх водіїв? Порахуємо збитки →</a></div>
    </div>
  </section>
  <section class="calc-section" id="calc">
    <div class="container">
      <div class="calc-inner">
        <div><div class="tag tag-dark">💰 Калькулятор</div><h2 class="title calc-title">Порахуйте вашу економію</h2><p class="calc-sub">Тип авто, кількість, витрата і пробіг дають орієнтир економії від контролю пального, маршрутів і дисципліни водіїв.</p><div class="calc-benefits"><span>⛽ Контроль пального: 15-25%</span><span>🛣 Оптимізація пробігу: до 10%</span><span>🔧 Менше зносу: до 20%</span></div></div>
        <div class="calc-box">
          <label>Тип транспорту<select id="calcType"><option value="truck">Вантажівка / фура</option><option value="car">Легковий автомобіль</option><option value="tractor">Трактор / спецтехніка</option><option value="minibus">Мікроавтобус / маршрутка</option></select></label>
          <label>Кількість авто: <span id="countVal">5</span><input type="range" min="1" max="80" value="5" id="calcCount"></label>
          <label>Витрата пального, л/100 км: <span id="fuelVal">30</span><input type="range" min="6" max="60" value="30" id="calcFuel"></label>
          <label>Пробіг, тис. км/місяць: <span id="kmVal">5</span><input type="range" min="1" max="30" value="5" id="calcKm"></label>
          <div class="calc-result"><b id="calcResultNum">14 250</b><span>грн економії щомісяця</span><small id="calcSubResult">Підписка КМ-Трейд: 1 250 грн/міс · ROI: 11.4x</small></div>
          <a class="btn btn-primary calc-cta" href="#lead-form" data-scroll-form id="calcCta">Хочу заощадити ці гроші →</a>
          <p class="info-note">Вартість трекера на 1 авто потребує уточнення від КМ-Трейд; калькулятор показує абонплату і орієнтовну економію.</p>
        </div>
      </div>
    </div>
  </section>
  <section class="section" id="why">
    <div class="container">
      <div class="tag">✓ Чому КМ-Трейд</div>
      <h2 class="title">Єдиний авторизований партнер Wialon на Заході України з виїздом сьогодні</h2>
      <p class="subtitle">Не чекайте тиждень на майстра з Києва або Черкас. Ми поруч: Чернівці, Івано-Франківськ, Тернопіль, Хмельницький.</p>
      <div class="usp-grid">
        ${[
          ["📍", "Локальність", "Ми з Чернівців і працюємо по всіх 4 областях Заходу України."],
          ["⚡", "Виїзд сьогодні", "Сьогодні зателефонували — сьогодні або завтра встановили."],
          ["🛰", "Wialon №1", "Платформа, якій довіряють 45 000+ компаній у 130 країнах."],
          ["💰", "Від 250 грн", "Менше ніж вартість 6 літрів пального за місяць контролю."],
          ["🔧", "Гарантія 1 рік", "Беремо на себе сервіс протягом першого року без доплат."],
          ["🤝", "Персональний менеджер", "Не колл-центр і не чат-бот — конкретна людина для вашого парку."],
        ].map(([icon, title, text]) => `<article class="usp-card"><span>${icon}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}
      </div>
      <div class="compare-wrap"><table><thead><tr><th>Параметр</th><th>Overseer</th><th>GPS Партнер</th><th>FreeTrack</th><th>КМ-Трейд ✓</th></tr></thead><tbody>${compare.map((row) => `<tr>${row.map((cell, index) => `<td${index === 4 ? ' class="best"' : ""}>${html(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    </div>
  </section>
  <section class="section" id="cases">
    <div class="container">
      <div class="tag">📊 Кейси</div><h2 class="title">Реальні результати клієнтів</h2><p class="subtitle">Публікуємо тільки підтверджені цифри. Два додаткові кейси потребують даних від КМ-Трейд.</p>
      <div class="grid-3 case-grid">
        <article class="case-card"><span class="case-tag">Чернівці · 10 авто</span><h3>«Два відра»: диспетчеризація і контроль автопарку</h3><div class="case-metrics"><b>−20%<span>пального</span></b><b>200 л<span>економія/міс</span></b><b>1 рік<span>окупність</span></b></div><p class="case-quote">Потрібно отримати проблему ДО підключення GPS і цитату власника або диспетчера.</p></article>
        <article class="case-card placeholder"><span class="case-tag">Івано-Франківська обл.</span><h3>Кейс 2 після отримання даних</h3><p>Потрібні: галузь, кількість авто, проблема, результат у цифрах, термін окупності і цитата клієнта.</p></article>
        <article class="case-card placeholder"><span class="case-tag">Тернопільська або Хмельницька обл.</span><h3>Кейс 3 після отримання даних</h3><p>Бажано показати іншу галузь, щоб підтвердити локальну присутність у 4 областях.</p></article>
      </div>
    </div>
  </section>
  <section class="section stats-section"><div class="container"><div class="stats-grid"><div><b>350+</b><span>клієнтів</span></div><div><b>3 200+</b><span>авто обслужено</span></div><div><b>10 років</b><span>на ринку</span></div><div><b>4 області</b><span>виїзд і сервіс</span></div></div><p class="info-note center">Якщо є статистика клієнтів по областях — її можна вивести в цьому блоці та на регіональних сторінках.</p></div></section>
  <section class="section" id="industries"><div class="container"><div class="tag">🏭 Галузеві рішення</div><h2 class="title">8 SEO-лендінгів під ваш бізнес</h2><div class="industry-grid">${industries.map((i) => `<a class="industry-card" href="/${i.slug}/"><span>${i.icon}</span><b>${i.name}</b><small>${i.short}</small></a>`).join("")}</div></div></section>
  <section class="section region-section" id="regions"><div class="container"><div class="tag">📍 Регіони</div><h2 class="title">Виїжджаємо у 4 області Заходу України</h2><div class="grid-4">${regions.map((r) => `<a class="region-card" href="/${r.slug}/"><b>${r.city}</b><span>${r.oblast}</span><small>Локальна SEO-сторінка →</small></a>`).join("")}</div></div></section>
  <section class="section how-section"><div class="container"><div class="center"><div class="tag">⚡ Процес</div><h2 class="title">Як ми працюємо</h2><p class="subtitle">Від заявки до запуску — за 1 день, техніка не зупиняється.</p></div><div class="steps-grid">${[
    ["1", "Заявка", "Передзвонюємо за 15 хвилин і уточнюємо регіон, тип транспорту та кількість авто."],
    ["2", "Виїзд і аудит", "Безкоштовний виїзд по всіх 4 областях: огляд техніки і підбір обладнання."],
    ["3", "Встановлення", "Монтаж трекерів за 1 день, налаштування Wialon і навчання відповідальних."],
    ["4", "Підтримка 24/7", "Особистий менеджер, гарантія 1 рік і допомога зі звітами."],
  ].map(([n, t, d]) => `<article class="step-card"><b>${n}</b><h3>${t}</h3><p>${d}</p></article>`).join("")}</div></div></section>
  <section class="section" id="pricing"><div class="container"><div class="tag">💳 Тарифи</div><h2 class="title">3 пакети під будь-який бізнес</h2><p class="subtitle">Абонплата від 250 грн/авто/міс. Повний перелік функцій і вартість трекера потребують підтвердження від клієнта.</p><div class="pricing-grid">${prices.map((p) => `<article class="pricing-card ${p.featured ? "featured" : ""}"><span>${p.name}</span><h3>${p.price}</h3><small>${p.note}</small><ul>${p.features.map((f) => `<li>${f}</li>`).join("")}</ul><a class="btn ${p.featured ? "btn-primary" : "btn-outline"}" href="#lead-form" data-scroll-form>Обрати пакет</a></article>`).join("")}</div><div class="mini-cost"><label>Кількість авто для місячного платежу<input id="priceCars" type="number" min="1" value="10"></label><strong id="priceTotal">2 500 грн/міс</strong></div></div></section>
  ${trialSection()}
  <section class="section"><div class="container"><div class="tag">💬 Відгуки</div><h2 class="title">Відгуки клієнтів</h2><div class="content-needed"><b>Потрібно отримати від КМ-Трейд</b><p>3 реальні відгуки: ім'я, посада, компанія, регіон і текст 2-3 речення. До отримання даних блок не імітує вигаданих клієнтів.</p></div></div></section>
  <section class="section local-section" id="about"><div class="container"><div class="local-inner"><div><div class="tag">📍 Про компанію</div><h2 class="title">10 років на ринку Заходу України</h2><p class="subtitle">Офіс у Чернівцях, виїзд по 4 областях, персональний менеджер і сервіс обладнання протягом першого року.</p><div class="local-features"><div><b>🛰 Сертифікований партнер Gurtam</b><span>Потрібен сертифікат або номер сертифікату для публікації.</span></div><div><b>📷 Фото команди / офісу</b><span>Реальні фото підвищать довіру і замінять цей службовий блок.</span></div><div><b>📞 Регіональні телефони</b><span>Якщо окремих номерів немає — використовується загальний телефон.</span></div></div></div><div class="contact-card"><h3>Контакти</h3><p>м. Чернівці, головний офіс</p><a class="js-call" href="tel:${phonePrimary}">${phoneDisplay}</a><a class="js-call" href="tel:${phoneSecondary}">${phoneDisplay2}</a><a href="mailto:${email}">${email}</a><a class="btn btn-primary" href="#lead-form" data-scroll-form>Залишити заявку →</a></div></div></div></section>
  <section class="section"><div class="container"><div class="section-head"><div><div class="tag">📚 Блог</div><h2 class="title">SEO-статті для запуску</h2></div><a class="btn btn-outline" href="/statti/">Всі статті →</a></div><div class="articles-grid">${articles.slice(0, 4).map(articleCard).join("")}</div></div></section>`;
}

function articleCard(article) {
  return `<a class="article-card" href="/statti/${article.slug}/"><div class="article-img"><span>${article.icon}</span></div><div class="article-body-card"><div class="article-meta"><span>${article.category}</span><small>${article.date}</small></div><h3>${html(article.title)}</h3><p>${html(article.excerpt)}</p></div></a>`;
}

function regionPage(region) {
  const relatedIndustries = industries.slice(0, 4).map((i) => `<a class="related-card" href="/${i.slug}/"><span>${i.icon}</span><b>${i.name}</b></a>`).join("");
  return `<section class="page-hero">
    <div class="container">
      <div class="breadcrumb"><a href="/">Головна</a><span>›</span><a href="/#regions">Регіони</a><span>›</span>${region.city}</div>
      <div class="tag">📍 ${region.oblast}</div>
      <h1 class="title title-lg">${region.hero}</h1>
      <p class="subtitle">${region.local} Підключаємо Wialon Local / Hosting, налаштовуємо звіти і супроводжуємо клієнта після монтажу.</p>
      <div class="hero-actions"><a class="btn btn-primary" href="#lead-form" data-scroll-form>Заявка на виїзд →</a><a class="btn btn-outline js-call" href="tel:${phonePrimary}">Подзвонити</a></div>
    </div>
  </section>
  <section class="section"><div class="container"><div class="page-inner"><main class="article-body"><h2>GPS-моніторинг ${region.inCity}: що входить</h2><p>КМ-Трейд працює з автопарками від 3 авто: логістика, агро, будтехніка, таксі, доставка і корпоративний транспорт. Ми не просто продаємо трекер — встановлюємо, налаштовуємо Wialon, навчаємо диспетчера і допомагаємо читати звіти.</p><h2>Локальні ключі для пошуку</h2><ul>${region.keys.map((k) => `<li>${html(k)}</li>`).join("")}</ul><h2>Чому локальний партнер важливий</h2><p>Якщо обладнання потрібно встановити або перевірити терміново, локальна команда реагує швидше за провайдера з іншого регіону. Ваш автопарк не простоює, а менеджер знає специфіку маршруту і техніки.</p>${ctaBox(`Підключити автопарк ${region.inCity}`, "Залиште заявку — уточнимо кількість авто, тип транспорту і найближчий час виїзду.")}<h2>Рішення для регіону</h2><div class="related-articles">${relatedIndustries}</div></main><aside class="sidebar">${sidebar(region.city)}</aside></div></div></section>${trialSection(region.city)}`;
}

function industryPage(industry) {
  return `<section class="page-hero">
    <div class="container">
      <div class="breadcrumb"><a href="/">Головна</a><span>›</span><a href="/#industries">Рішення</a><span>›</span>${industry.name}</div>
      <div class="tag">${industry.icon} ${industry.name}</div>
      <h1 class="title title-lg">${industry.title} на Заході України</h1>
      <p class="subtitle">${industry.intro}</p>
      <div class="hero-actions"><a class="btn btn-primary" href="#lead-form" data-scroll-form>Спробувати 14 днів →</a><a class="btn btn-outline" href="/#calc">Порахувати економію</a></div>
    </div>
  </section>
  <section class="section"><div class="container"><div class="page-inner"><main class="article-body"><h2>Функції для напряму «${industry.name}»</h2><div class="feature-grid">${industry.features.map(([title, text]) => `<div class="feature-item"><span>${industry.icon}</span><div><h3>${title}</h3><p>${text}</p></div></div>`).join("")}</div><h2>Як це впроваджує КМ-Трейд</h2><p>Ми підбираємо трекер і датчики під конкретну техніку, монтуємо без тривалої зупинки роботи, налаштовуємо Wialon, геозони, сповіщення і звіти для керівника, диспетчера або бухгалтера.</p><h2>Покриття</h2><p>Виїжджаємо у Чернівецьку, Івано-Франківську, Тернопільську та Хмельницьку області. Для кожного регіону є окрема SEO-сторінка з локальними запитами.</p>${ctaBox(`GPS для ${industry.name.toLowerCase()} — тест 14 днів`, "Почніть з 1 авто або одиниці техніки. Після тесту отримаєте звіт і рекомендації.")}</main><aside class="sidebar">${sidebar()}</aside></div></div></section>${trialSection()}`;
}

function articlePage(article) {
  const body = article.body
    .map(([type, value]) => {
      if (type === "h2") return `<h2>${html(value)}</h2>`;
      if (type === "p") return `<p>${html(value)}</p>`;
      if (type === "ul") return `<ul>${value.map((item) => `<li>${html(item)}</li>`).join("")}</ul>`;
      return "";
    })
    .join("");
  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3).map((a) => `<a class="related-card" href="/statti/${a.slug}/"><span>${a.icon}</span><b>${a.title}</b></a>`).join("");
  return `<section class="page-hero"><div class="container"><div class="breadcrumb"><a href="/">Головна</a><span>›</span><a href="/statti/">Статті</a><span>›</span>${article.category}</div><div class="article-meta"><span>${article.category}</span><small>${article.date} · 5 хв читання</small></div><h1 class="title title-lg">${html(article.title)}</h1></div></section><section class="section"><div class="container"><div class="page-inner"><main class="article-body"><p class="lead">${html(article.excerpt)}</p>${body}${ctaBox("Хочете перевірити це на своєму автопарку?", "Залиште заявку на 14-денний тест-драйв Wialon для 1 авто.")}<h2>Читайте також</h2><div class="related-articles">${related}</div></main><aside class="sidebar">${sidebar()}</aside></div></div></section>${trialSection()}`;
}

function articlesListPage() {
  return `<section class="page-hero"><div class="container"><div class="breadcrumb"><a href="/">Головна</a><span>›</span>Статті</div><div class="tag">📚 Блог</div><h1 class="title title-lg">Корисні статті про GPS-моніторинг</h1><p class="subtitle">Галузеві, локальні й проблемні матеріали для SEO та прогріву власників автопарків.</p></div></section><section class="section"><div class="container"><div class="articles-grid">${articles.map(articleCard).join("")}</div></div></section>${trialSection()}`;
}

function sidebar(city = "Захід України") {
  return `<div class="sidebar-card"><h3>КМ-Трейд поруч</h3><div class="sidebar-stat"><span>Регіон</span><b>${city}</b></div><div class="sidebar-stat"><span>Абонплата</span><b>від 250 грн</b></div><div class="sidebar-stat"><span>Тест-драйв</span><b>14 днів</b></div><div class="sidebar-stat"><span>Сервіс</span><b>1 рік безкоштовно</b></div><a class="btn btn-primary" href="#lead-form" data-scroll-form>Залишити заявку</a></div>`;
}

function legalPage(title, body) {
  return `<section class="page-hero"><div class="container"><div class="breadcrumb"><a href="/">Головна</a><span>›</span>${title}</div><h1 class="title title-lg">${title}</h1><p class="subtitle">Шаблонний текст потребує юридичного погодження перед публікацією.</p></div></section><section class="section"><div class="container"><main class="article-body">${body}</main></div></section>${trialSection()}`;
}

function layout({ route, title, description, body, type = "website", schema }) {
  const canonical = url(route);
  const jsonLd = schema || localBusinessSchema();
  return `<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${html(title)}</title>
  <meta name="description" content="${html(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="${type}">
  <meta property="og:title" content="${html(title)}">
  <meta property="og:description" content="${html(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="uk_UA">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/styles.css">
  <script>
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "page_view_init", page_type: "${type}", page_path: "${route}" });
  </script>
  <!-- GTM placeholder: add container ID in production through the hosting template or tag manager snippet. -->
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body data-page-type="${type}" data-route="${route}">
  ${header()}
  <main>${body}</main>
  ${footer()}
  <script src="/assets/main.js" defer></script>
</body>
</html>`;
}

function localBusinessSchema(region) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "КМ-Трейд",
    url: siteUrl,
    telephone: phoneDisplay,
    email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Чернівці",
      addressCountry: "UA",
    },
    areaServed: (region ? [region.oblast] : regions.map((r) => r.oblast)).map((name) => ({ "@type": "AdministrativeArea", name })),
    priceRange: "від 250 грн/авто/міс",
    knowsAbout: ["GPS-моніторинг транспорту", "Wialon", "контроль пального", "диспетчеризація автопарку"],
  };
}

const css = String.raw`
:root{--navy:#0B1C3D;--navy-mid:#152B5C;--blue:#1B4FD8;--blue-light:#2D6BE4;--accent:#FF5C1A;--accent-light:#FF7A40;--teal:#00B4A6;--gray-900:#0F1117;--gray-800:#1A1F2E;--gray-700:#2A3244;--gray-400:#6B7A99;--gray-200:#D1D9EC;--gray-100:#EEF2FA;--gray-50:#F7F9FF;--white:#fff;--text-primary:#0B1C3D;--text-secondary:#4A5578;--radius:12px;--radius-lg:20px;--shadow:0 4px 24px rgba(11,28,61,.10);--shadow-lg:0 12px 48px rgba(11,28,61,.16)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Manrope,system-ui,-apple-system,Segoe UI,sans-serif;color:var(--text-primary);background:#fff;-webkit-font-smoothing:antialiased}a{color:inherit}.container{max-width:1180px;margin:0 auto;padding:0 24px}.section{padding:96px 0}.tag{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--blue);background:rgba(27,79,216,.08);padding:6px 14px;border-radius:999px;margin-bottom:20px}.tag-dark{background:rgba(255,255,255,.1);color:rgba(255,255,255,.82)}.title{font-family:"Space Grotesk",Manrope,sans-serif;font-size:clamp(32px,4vw,52px);font-weight:700;line-height:1.12;color:var(--navy);margin:0}.title-lg{font-size:clamp(38px,5vw,70px)}.subtitle{font-size:18px;color:var(--text-secondary);line-height:1.7;margin:16px 0 0;max-width:760px}.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:14px 28px;border-radius:10px;border:0;text-decoration:none;font-weight:800;font-size:15px;cursor:pointer;transition:.22s}.btn-primary{background:var(--accent);color:#fff;box-shadow:0 4px 16px rgba(255,92,26,.35)}.btn-primary:hover{background:var(--accent-light);transform:translateY(-1px)}.btn-outline{background:transparent;color:var(--navy);border:1.5px solid var(--gray-200)}.btn-outline:hover{border-color:var(--blue);color:var(--blue);background:rgba(27,79,216,.04)}.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}.center{text-align:center}.center .subtitle{margin-left:auto;margin-right:auto}.center-cta{text-align:center;margin-top:32px}.section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap}
header{position:sticky;top:0;z-index:1000;background:rgba(255,255,255,.96);backdrop-filter:blur(12px);border-bottom:1px solid rgba(209,217,236,.55)}.header-inner{height:72px;display:flex;align-items:center;justify-content:space-between;gap:20px}.logo{display:flex;align-items:center;gap:10px;text-decoration:none}.logo-mark{width:38px;height:38px;background:var(--blue);border-radius:10px;display:grid;place-items:center;flex:0 0 auto}.logo-mark svg{width:22px;height:22px;fill:#fff}.logo-text{display:block;font-family:"Space Grotesk",sans-serif;font-size:20px;font-weight:700;color:var(--navy);letter-spacing:-.02em}.logo-sub{display:block;font-size:10px;font-weight:800;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em;line-height:1.1}nav{display:flex;align-items:center;gap:4px}nav a{font-size:14px;font-weight:700;color:var(--text-secondary);text-decoration:none;padding:8px 12px;border-radius:8px}nav a:hover{color:var(--blue);background:rgba(27,79,216,.06)}.nav-dropdown{position:relative}.nav-dropdown>a:after{content:" ▾";font-size:10px}.dropdown-menu{position:absolute;top:calc(100% + 8px);left:0;min-width:250px;background:#fff;border:1px solid var(--gray-100);border-radius:var(--radius);box-shadow:var(--shadow-lg);padding:8px;opacity:0;visibility:hidden;transform:translateY(-6px);transition:.18s}.nav-dropdown:hover .dropdown-menu{opacity:1;visibility:visible;transform:translateY(0)}.dropdown-menu a{display:flex;gap:10px;align-items:center;padding:10px 12px;white-space:nowrap}.di{width:28px;height:28px;border-radius:6px;background:var(--gray-100);display:grid;place-items:center}.header-cta{display:flex;align-items:center;gap:12px}.header-phone{font-size:14px;font-weight:800;color:var(--navy);text-decoration:none}
.hero{padding:88px 0 100px;background:linear-gradient(135deg,#F7F9FF 0%,#EEF2FA 50%,#E8EEFF 100%);position:relative;overflow:hidden}.hero:before{content:"";position:absolute;top:-220px;right:-220px;width:700px;height:700px;background:radial-gradient(circle,rgba(27,79,216,.08),transparent 70%);border-radius:50%}.hero-inner{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;position:relative}.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(27,79,216,.1);border:1px solid rgba(27,79,216,.2);color:var(--blue);padding:8px 16px;border-radius:999px;font-size:13px;font-weight:800;margin-bottom:24px}.hero-badge span{width:6px;height:6px;background:var(--teal);border-radius:50%;animation:pulse 2s infinite}@keyframes pulse{50%{opacity:.55;transform:scale(1.35)}}.hero h1{font-family:"Space Grotesk",sans-serif;font-size:clamp(36px,4.6vw,60px);font-weight:700;line-height:1.08;color:var(--navy);letter-spacing:-.02em;margin:0}.hero h1 em{font-style:normal;color:var(--blue)}.hero-sub{font-size:17px;line-height:1.7;color:var(--text-secondary);margin:20px 0 24px}.region-badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px}.region-badges a{font-size:12px;font-weight:800;text-decoration:none;color:var(--navy);background:#fff;border:1px solid var(--gray-200);border-radius:999px;padding:8px 12px}.hero-actions{display:flex;gap:16px;flex-wrap:wrap;align-items:center}.hero-price{font-size:13px;color:var(--text-secondary);margin:16px 0 0}.hero-price strong{color:var(--navy);font-size:15px}.hero-stats{display:flex;gap:26px;margin-top:36px;padding-top:30px;border-top:1px solid var(--gray-200);flex-wrap:wrap}.hero-stats b{display:block;font-family:"Space Grotesk",sans-serif;font-size:28px;color:var(--navy)}.hero-stats span{display:block;font-size:12px;color:var(--text-secondary);margin-top:2px}
.hero-mockup{background:var(--navy);border-radius:20px;padding:20px;box-shadow:var(--shadow-lg);overflow:hidden}.mockup-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.mockup-title{color:rgba(255,255,255,.6);font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.mockup-status{display:flex;align-items:center;gap:6px;background:rgba(0,180,166,.15);color:var(--teal);font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px}.mockup-map{height:200px;background:#162040;border-radius:12px;position:relative;overflow:hidden;display:grid;place-items:center}.map-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(27,79,216,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(27,79,216,.12) 1px,transparent 1px);background-size:30px 30px}.route-svg{position:absolute;width:100%;height:100%;opacity:.45}.map-car{position:absolute;width:28px;height:28px;background:var(--accent);border-radius:50%;display:grid;place-items:center;box-shadow:0 0 0 6px rgba(255,92,26,.2);animation:carMove 4s ease-in-out infinite alternate}@keyframes carMove{from{top:40%;left:30%}to{top:55%;left:60%}}.mockup-vehicles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.vehicle-row{background:rgba(255,255,255,.05);border-radius:8px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:rgba(255,255,255,.82)}.vehicle-row b{font-size:11px}.status-active{color:var(--teal)}.status-stop{color:#ffa500}.hero-float-card{position:absolute;background:#fff;border-radius:12px;padding:12px 16px;box-shadow:0 8px 32px rgba(11,28,61,.2);display:flex;gap:10px;align-items:center}.float-1{top:-20px;right:-20px}.float-2{bottom:20px;left:-30px}.float-icon{width:36px;height:36px;border-radius:8px;display:grid;place-items:center}.fi-green{background:#E7F9F0}.fi-blue{background:#E6EFFF}.hero-float-card b{display:block;color:var(--navy)}.hero-float-card span{font-size:11px;color:var(--text-secondary)}
.trust-bar{background:var(--navy);padding:22px 0}.trust-bar-inner{display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap;color:rgba(255,255,255,.78);font-size:13px;font-weight:700}.pain-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}.pain-card{border:1px solid var(--gray-100);border-radius:var(--radius-lg);padding:28px;transition:.22s}.pain-card:hover{border-color:var(--blue);background:var(--gray-50);transform:translateY(-2px)}.pain-icon{width:48px;height:48px;border-radius:12px;background:var(--gray-100);display:grid;place-items:center;font-size:22px;margin-bottom:16px}.pain-card h3{font-size:16px;color:var(--navy);margin:0 0 8px}.pain-card p{font-size:13px;color:var(--text-secondary);line-height:1.55;margin:0 0 12px}.pain-card strong{display:inline-block;font-size:12px;color:var(--accent);background:rgba(255,92,26,.08);padding:5px 10px;border-radius:999px}
.calc-section{background:var(--navy);padding:96px 0}.calc-inner{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start}.calc-title{color:#fff}.calc-sub{color:rgba(255,255,255,.65);font-size:17px;line-height:1.7}.calc-benefits{display:flex;flex-direction:column;gap:16px;margin-top:36px;color:rgba(255,255,255,.74);font-size:14px}.calc-box{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:var(--radius-lg);padding:36px}.calc-box label{display:block;font-size:13px;font-weight:800;color:rgba(255,255,255,.74);text-transform:uppercase;letter-spacing:.04em;margin-bottom:20px}.calc-box select,.calc-box input[type=range]{width:100%;margin-top:10px}.calc-box select{padding:12px 16px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:10px;color:#fff;font:600 15px Manrope}.calc-box option{background:var(--navy-mid)}.calc-box input[type=range]{accent-color:var(--accent)}.calc-result{text-align:center;background:rgba(255,92,26,.12);border:1px solid rgba(255,92,26,.25);border-radius:12px;padding:24px;margin-top:24px}.calc-result b{display:block;font-family:"Space Grotesk",sans-serif;font-size:48px;line-height:1;color:var(--accent)}.calc-result span,.calc-result small{display:block;color:rgba(255,255,255,.66);margin-top:8px}.calc-cta{width:100%;margin-top:20px}.info-note{font-size:12px;color:var(--gray-400);line-height:1.55}.info-note.center{text-align:center;margin-top:24px}
.usp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:44px}.usp-card{border:1px solid var(--gray-100);border-radius:var(--radius-lg);box-shadow:var(--shadow);padding:28px;background:#fff}.usp-card span{font-size:28px}.usp-card h3{margin:12px 0 8px;color:var(--navy)}.usp-card p{margin:0;color:var(--text-secondary);font-size:14px;line-height:1.6}.compare-wrap{overflow:auto;margin-top:40px;border:1px solid var(--gray-100);border-radius:var(--radius-lg);box-shadow:var(--shadow)}table{width:100%;border-collapse:collapse;background:#fff;min-width:760px}th,td{padding:15px 16px;text-align:left;border-bottom:1px solid var(--gray-100);font-size:14px}th{background:var(--gray-50);color:var(--navy);font-weight:800}td{color:var(--text-secondary)}tr:last-child td{border-bottom:0}.best{font-weight:800;color:var(--blue);background:rgba(27,79,216,.04)}
.case-card{border:1px solid var(--gray-100);border-radius:var(--radius-lg);padding:30px;background:#fff;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:16px}.case-tag{align-self:flex-start;font-size:12px;font-weight:800;color:var(--blue);background:rgba(27,79,216,.08);padding:5px 12px;border-radius:999px}.case-card h3{font-size:18px;line-height:1.4;color:var(--navy);margin:0}.case-card p{font-size:14px;line-height:1.65;color:var(--text-secondary);margin:0}.case-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.case-metrics b{font-family:"Space Grotesk",sans-serif;font-size:26px;color:var(--blue)}.case-metrics span{display:block;font-family:Manrope,sans-serif;font-size:11px;font-weight:600;color:var(--text-secondary)}.case-quote{border-left:3px solid var(--blue);padding-left:14px;font-style:italic}.placeholder{border:2px dashed rgba(255,92,26,.45);background:rgba(255,92,26,.03)}
.stats-section{background:var(--gray-50)}.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center}.stats-grid b{display:block;font-family:"Space Grotesk",sans-serif;font-size:48px;color:var(--blue);line-height:1}.stats-grid span{display:block;margin-top:8px;color:var(--text-secondary);font-size:14px}.industry-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:48px}.industry-card,.region-card{text-decoration:none;border:1px solid var(--gray-100);border-radius:var(--radius-lg);padding:24px;text-align:center;background:#fff;transition:.22s}.industry-card:hover,.region-card:hover{border-color:var(--blue);transform:translateY(-3px);box-shadow:var(--shadow)}.industry-card span{display:block;font-size:32px;margin-bottom:12px}.industry-card b,.region-card b{display:block;color:var(--navy);font-size:15px}.industry-card small,.region-card span,.region-card small{display:block;color:var(--text-secondary);font-size:12px;margin-top:5px}.region-section{background:var(--gray-50)}.how-section{background:var(--gray-50)}.steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:56px}.step-card{text-align:center}.step-card b{width:64px;height:64px;background:var(--blue);color:#fff;border-radius:50%;display:grid;place-items:center;margin:0 auto 20px;font-family:"Space Grotesk";font-size:22px;box-shadow:0 4px 16px rgba(27,79,216,.3)}.step-card h3{margin:0 0 8px;color:var(--navy)}.step-card p{margin:0;color:var(--text-secondary);font-size:13px;line-height:1.55}
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:48px}.pricing-card{border:2px solid var(--gray-100);border-radius:var(--radius-lg);padding:34px;background:#fff;position:relative}.pricing-card.featured{border-color:var(--blue);background:rgba(27,79,216,.03)}.pricing-card.featured:before{content:"Популярний";position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--blue);color:#fff;font-size:12px;font-weight:800;padding:5px 16px;border-radius:999px}.pricing-card>span{font-size:13px;font-weight:800;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.08em}.pricing-card h3{font-family:"Space Grotesk";font-size:40px;margin:12px 0 4px;color:var(--navy)}.pricing-card small{color:var(--text-secondary)}.pricing-card ul{padding:22px 0 0;margin:22px 0;border-top:1px solid var(--gray-100);list-style:none}.pricing-card li{font-size:14px;color:var(--text-secondary);margin:0 0 12px;display:flex;gap:8px}.pricing-card li:before{content:"✓";color:var(--teal);font-weight:900}.pricing-card .btn{width:100%}.mini-cost{display:flex;align-items:center;justify-content:center;gap:20px;margin:32px auto 0;padding:18px;border:1px solid var(--gray-100);border-radius:var(--radius-lg);background:var(--gray-50);max-width:560px}.mini-cost label{font-weight:800;color:var(--navy)}.mini-cost input{margin-left:12px;width:90px;padding:10px;border:1px solid var(--gray-200);border-radius:8px;font-size:16px}.mini-cost strong{font-family:"Space Grotesk";font-size:26px;color:var(--blue)}
.trial-section{background:linear-gradient(135deg,var(--blue),#0F3AA8);padding:96px 0;text-align:center;position:relative;overflow:hidden}.trial-title{font-family:"Space Grotesk";font-size:clamp(32px,4vw,52px);color:#fff;margin:0 0 16px}.trial-sub{max-width:660px;margin:0 auto 36px;color:rgba(255,255,255,.76);font-size:18px;line-height:1.7}.trial-perks{display:flex;justify-content:center;gap:22px 32px;flex-wrap:wrap;margin-bottom:40px}.trial-perk{color:rgba(255,255,255,.84);font-weight:700;font-size:14px}.trial-perk:before{content:"✓";display:inline-grid;place-items:center;width:20px;height:20px;background:rgba(255,255,255,.15);border-radius:50%;margin-right:8px}.trial-form{background:#fff;border-radius:var(--radius-lg);padding:36px;max-width:560px;margin:0 auto;text-align:left}.trial-form h3{font-family:"Space Grotesk";font-size:22px;margin:0 0 24px;color:var(--navy)}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}.form-field{margin-bottom:16px}.form-field label{display:block;font-size:12px;font-weight:800;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}.form-field input,.form-field select{width:100%;min-height:46px;padding:12px 16px;border:1.5px solid var(--gray-200);border-radius:10px;font:500 16px Manrope;color:var(--navy);background:#fff}.form-field input:focus,.form-field select:focus{outline:0;border-color:var(--blue)}.form-submit{width:100%;padding:16px}.form-note{font-size:12px;color:var(--text-secondary);text-align:center;margin:12px 0 0}.hp{position:absolute;left:-9999px;opacity:0}.content-needed{margin-top:24px;border:2px dashed rgba(255,92,26,.45);background:rgba(255,92,26,.04);border-radius:var(--radius-lg);padding:24px;color:var(--accent)}.content-needed p{color:var(--text-secondary);margin:8px 0 0;line-height:1.6}
.local-section{background:var(--gray-50)}.local-inner{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}.local-features{display:flex;flex-direction:column;gap:18px;margin-top:30px}.local-features div{display:flex;flex-direction:column;gap:5px;background:#fff;border:1px solid var(--gray-100);border-radius:var(--radius);padding:18px}.local-features b{color:var(--navy)}.local-features span{font-size:13px;color:var(--text-secondary);line-height:1.5}.contact-card{background:var(--navy);border-radius:var(--radius-lg);padding:36px;color:#fff;display:flex;flex-direction:column;gap:14px}.contact-card h3{margin:0;font-family:"Space Grotesk";font-size:28px}.contact-card p{color:rgba(255,255,255,.65);margin:0}.contact-card a:not(.btn){color:#fff;text-decoration:none;font-weight:800}.contact-card .btn{margin-top:12px}
.page-hero{padding:64px 0 56px;background:var(--gray-50);border-bottom:1px solid var(--gray-100)}.breadcrumb{display:flex;gap:8px;align-items:center;font-size:13px;color:var(--text-secondary);margin-bottom:20px;flex-wrap:wrap}.breadcrumb a{color:var(--blue);text-decoration:none}.breadcrumb span{color:var(--gray-200)}.page-inner{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:48px;align-items:start}.article-body{max-width:780px}.article-body .lead{font-size:18px;color:var(--text-secondary);line-height:1.75}.article-body h2{font-family:"Space Grotesk";font-size:28px;color:var(--navy);margin:40px 0 16px}.article-body h3{font-size:17px;color:var(--navy);margin:0 0 6px}.article-body p,.article-body li{font-size:15px;color:var(--text-secondary);line-height:1.8}.article-body ul{padding-left:22px}.feature-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:26px}.feature-item{display:flex;gap:14px;align-items:flex-start;border:1px solid var(--gray-100);border-radius:var(--radius);padding:18px;background:#fff}.feature-item>span{width:40px;height:40px;border-radius:10px;background:rgba(27,79,216,.1);display:grid;place-items:center;flex:0 0 auto}.feature-item p{font-size:13px;line-height:1.55;margin:0}.article-cta-box{background:var(--gray-50);border:1px solid var(--gray-100);border-radius:var(--radius-lg);padding:32px;margin:40px 0;text-align:center}.article-cta-box h3{font-size:22px;margin:0 0 8px}.article-cta-box p{font-size:14px;margin:0 0 20px}.related-articles{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px}.related-card{display:flex;flex-direction:column;gap:8px;text-decoration:none;border:1px solid var(--gray-100);border-radius:var(--radius);padding:18px;background:#fff}.related-card:hover{border-color:var(--blue)}.related-card b{font-size:14px;line-height:1.45;color:var(--navy)}.sidebar{position:sticky;top:96px}.sidebar-card{background:var(--gray-50);border:1px solid var(--gray-100);border-radius:var(--radius-lg);padding:24px}.sidebar-card h3{margin:0 0 16px;color:var(--navy)}.sidebar-stat{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid var(--gray-100);padding:9px 0;font-size:13px;color:var(--text-secondary)}.sidebar-stat b{color:var(--navy);text-align:right}.sidebar-card .btn{width:100%;margin-top:18px}
.articles-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;margin-top:40px}.article-card{display:block;text-decoration:none;border:1px solid var(--gray-100);border-radius:var(--radius-lg);overflow:hidden;background:#fff;transition:.22s}.article-card:hover{border-color:var(--blue);transform:translateY(-3px);box-shadow:var(--shadow)}.article-img{height:180px;background:linear-gradient(135deg,var(--navy),var(--blue));display:grid;place-items:center;color:#fff;font-size:48px}.article-body-card{padding:24px}.article-meta{display:flex;gap:12px;align-items:center;margin-bottom:12px}.article-meta span{font-size:11px;font-weight:800;color:var(--blue);text-transform:uppercase;letter-spacing:.06em}.article-meta small{font-size:11px;color:var(--text-secondary)}.article-card h3{font-size:18px;line-height:1.4;color:var(--navy);margin:0 0 10px}.article-card p{font-size:13px;line-height:1.65;color:var(--text-secondary);margin:0}
footer{background:var(--gray-900);padding:64px 0 32px}.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px}.footer-logo .logo-sub{color:rgba(255,255,255,.35)}.footer-logo .logo-text{color:#fff}.footer-desc{font-size:14px;color:rgba(255,255,255,.45);line-height:1.7}.footer-phones{display:flex;flex-direction:column;gap:6px}.footer-phone{color:#fff;text-decoration:none;font-weight:700}.footer-col-title{font-size:12px;font-weight:800;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:20px}.footer-links{display:flex;flex-direction:column;gap:10px}.footer-links a{font-size:14px;color:rgba(255,255,255,.55);text-decoration:none}.footer-links a:hover{color:#fff}.footer-divider{height:1px;background:rgba(255,255,255,.08);margin-bottom:24px}.footer-bottom{display:flex;justify-content:space-between;gap:20px;align-items:center;flex-wrap:wrap}.footer-copy,.footer-bottom-links a{font-size:13px;color:rgba(255,255,255,.3);text-decoration:none}.footer-bottom-links{display:flex;gap:22px}.sticky-cta{display:none;position:fixed;left:0;right:0;bottom:0;z-index:999;background:var(--navy);padding:12px 20px;gap:10px}.sticky-cta .btn{flex:1;padding:12px}.sticky-cta .btn-outline{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3);color:#fff}.notification{position:fixed;top:90px;right:24px;z-index:9999;background:var(--teal);color:#fff;border-radius:12px;padding:14px 20px;font-weight:800;box-shadow:var(--shadow-lg);transform:translateX(130%);transition:.35s}.notification.show{transform:translateX(0)}
@media (max-width:980px){nav{display:none}.hero-inner,.calc-inner,.local-inner,.page-inner{grid-template-columns:1fr}.hero-visual{display:none}.pain-grid,.usp-grid,.pricing-grid,.grid-3{grid-template-columns:1fr 1fr}.industry-grid,.grid-4,.steps-grid,.stats-grid{grid-template-columns:1fr 1fr}.footer-grid{grid-template-columns:1fr 1fr}.sidebar{position:static}.sticky-cta{display:flex}.header-cta .btn{display:none}.section{padding:68px 0}.related-articles{grid-template-columns:1fr}.articles-grid{grid-template-columns:1fr}}@media (max-width:640px){.container{padding:0 18px}.header-phone{display:none}.hero{padding:56px 0 72px}.pain-grid,.usp-grid,.pricing-grid,.industry-grid,.grid-4,.steps-grid,.stats-grid,.footer-grid,.form-row,.feature-grid{grid-template-columns:1fr}.hero-actions .btn{width:100%}.hero-stats{gap:18px}.calc-box,.trial-form{padding:24px}.case-metrics{grid-template-columns:1fr}.mini-cost{flex-direction:column;text-align:center}.footer-bottom{padding-bottom:72px}.notification{left:16px;right:16px;top:auto;bottom:88px;transform:translateY(160%)}.notification.show{transform:translateY(0)}}`;

const clientJs = String.raw`
(function(){
  var utmKeys = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"];
  var params = new URLSearchParams(window.location.search);
  var stored = {};
  utmKeys.forEach(function(key){
    var value = params.get(key) || localStorage.getItem("km_" + key) || "";
    if (params.get(key)) localStorage.setItem("km_" + key, value);
    stored[key] = value;
  });

  function pushEvent(name, payload){
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({event:name}, payload || {}));
  }

  if (document.body.dataset.pageType === "region") {
    pushEvent("region_page_view", {region: document.querySelector("#lead-region") && document.querySelector("#lead-region").value});
  }
  pushEvent("ViewContent", {page_type: document.body.dataset.pageType || "website", page_path: window.location.pathname});

  document.querySelectorAll(".js-call").forEach(function(link){
    link.addEventListener("click", function(){
      var payload = {phone: link.getAttribute("href")};
      pushEvent("call_click", payload);
      pushEvent("Contact", payload);
    });
  });

  document.querySelectorAll("[data-scroll-form]").forEach(function(link){
    link.addEventListener("click", function(event){
      var target = document.querySelector("#lead-form");
      if (target) {
        event.preventDefault();
        target.scrollIntoView({behavior:"smooth", block:"start"});
        setTimeout(function(){ var first = target.querySelector("input:not(.hp),select"); if(first) first.focus(); }, 400);
      }
    });
  });

  function money(num){ return Math.round(num).toLocaleString("uk-UA"); }
  function calc(){
    var type = document.getElementById("calcType");
    var count = document.getElementById("calcCount");
    var fuel = document.getElementById("calcFuel");
    var km = document.getElementById("calcKm");
    if (!type || !count || !fuel || !km) return;
    document.getElementById("countVal").textContent = count.value;
    document.getElementById("fuelVal").textContent = fuel.value;
    document.getElementById("kmVal").textContent = km.value;
    var pricePerL = type.value === "car" ? 58 : 55;
    var fuelMonth = (Number(fuel.value) / 100) * (Number(km.value) * 1000) * Number(count.value);
    var savings = fuelMonth * pricePerL * 0.2;
    var subscription = Number(count.value) * 250;
    var roi = subscription ? (savings / subscription).toFixed(1) : "0";
    document.getElementById("calcResultNum").textContent = money(savings);
    document.getElementById("calcSubResult").textContent = "Підписка КМ-Трейд: " + money(subscription) + " грн/міс · ROI: " + roi + "x";
    var hidden = document.getElementById("lead-savings");
    if (hidden) hidden.value = money(savings) + " грн/міс";
    var cta = document.getElementById("calcCta");
    if (cta) cta.textContent = "Хочу заощадити " + money(savings) + " грн →";
  }
  ["calcType","calcCount","calcFuel","calcKm"].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", function(){ calc(); pushEvent("calculator_used", {field:id}); });
  });
  calc();

  var priceCars = document.getElementById("priceCars");
  var priceTotal = document.getElementById("priceTotal");
  function priceCalc(){
    if (!priceCars || !priceTotal) return;
    priceTotal.textContent = money(Math.max(1, Number(priceCars.value || 1)) * 250) + " грн/міс";
  }
  if (priceCars) priceCars.addEventListener("input", priceCalc);
  priceCalc();

  document.querySelectorAll(".lead-form").forEach(function(form){
    utmKeys.forEach(function(key){
      var field = form.querySelector("[name='" + key + "']");
      if (field) field.value = stored[key] || "";
    });
    form.addEventListener("submit", async function(event){
      event.preventDefault();
      if (form.querySelector(".hp") && form.querySelector(".hp").value) return;
      var data = Object.fromEntries(new FormData(form).entries());
      data.page = window.location.pathname;
      pushEvent("form_submit", {region:data.region || "", cars:data.cars || "", form_name:form.dataset.formName || "lead"});
      pushEvent("Lead", {region:data.region || "", cars:data.cars || "", form_name:form.dataset.formName || "lead"});
      try {
        await fetch("/api/lead", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)});
      } catch (error) {
        console.warn("Lead endpoint unavailable", error);
      }
      var notification = document.getElementById("notification");
      if (notification) {
        notification.classList.add("show");
        setTimeout(function(){ notification.classList.remove("show"); }, 4200);
      }
      form.reset();
      utmKeys.forEach(function(key){
        var field = form.querySelector("[name='" + key + "']");
        if (field) field.value = stored[key] || "";
      });
    });
  });

  var maxDepth = 0;
  window.addEventListener("scroll", function(){
    var doc = document.documentElement;
    var depth = Math.round(((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100);
    [25,50,75,90].forEach(function(mark){
      if (depth >= mark && maxDepth < mark) {
        maxDepth = mark;
        pushEvent("scroll_depth", {percent:mark});
      }
    });
  }, {passive:true});
})();`;

function sitemapXml(routes) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${url(route)}</loc><changefreq>weekly</changefreq><priority>${route === "/" ? "1.0" : "0.8"}</priority></url>`).join("\n")}\n</urlset>\n`;
}

const pages = [
  {
    route: "/",
    title: "КМ-Трейд — GPS-моніторинг автопарку на Заході України",
    description:
      "GPS-моніторинг транспорту Wialon у Чернівецькій, Івано-Франківській, Тернопільській та Хмельницькій областях. Від 250 грн/авто/міс, тест 14 днів.",
    body: homePage(),
    type: "home",
  },
  ...regions.map((region) => ({
    route: `/${region.slug}/`,
    title: `${region.title} — КМ-Трейд Wialon`,
    description: region.description,
    body: regionPage(region),
    type: "region",
    schema: localBusinessSchema(region),
  })),
  ...industries.map((industry) => ({
    route: `/${industry.slug}/`,
    title: `${industry.title} — КМ-Трейд`,
    description: industry.description,
    body: industryPage(industry),
    type: "industry",
  })),
  {
    route: "/statti/",
    title: "Статті про GPS-моніторинг транспорту — КМ-Трейд",
    description: "Практичні статті про Wialon, контроль пального, GPS для агро, вантажівок і автопарків Заходу України.",
    body: articlesListPage(),
    type: "blog",
  },
  ...articles.map((article) => ({
    route: `/statti/${article.slug}/`,
    title: `${article.title} — КМ-Трейд`,
    description: article.description,
    body: articlePage(article),
    type: "article",
  })),
  {
    route: "/oferta/",
    title: "Оферта — КМ-Трейд",
    description: "Публічна оферта КМ-Трейд щодо GPS-моніторингу транспорту. Текст потребує юридичного погодження.",
    body: legalPage("Оферта", "<p>Ця сторінка зарезервована для публічної оферти КМ-Трейд. Перед запуском потрібно додати погоджений юридичний текст із реквізитами компанії, умовами послуг, оплатою, гарантією та відповідальністю сторін.</p>"),
    type: "legal",
  },
  {
    route: "/konfidentsiynist/",
    title: "Політика конфіденційності — КМ-Трейд",
    description: "Політика конфіденційності КМ-Трейд. Опис обробки заявок, UTM-міток, аналітики і контактних даних.",
    body: legalPage("Політика конфіденційності", "<p>Ця сторінка зарезервована для політики конфіденційності. Перед запуском потрібно погодити текст про обробку і зберігання персональних даних, UTM-параметрів, подій аналітики, Telegram-передачі заявок і використання cookies.</p>"),
    type: "legal",
  },
];

async function writeOutput() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(path.join(outDir, "assets"), { recursive: true });
  await writeFile(path.join(outDir, "assets", "styles.css"), css);
  await writeFile(path.join(outDir, "assets", "main.js"), clientJs);
  for (const page of pages) {
    const file = pagePath(page.route);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, layout(page));
  }
  const routes = pages.map((p) => p.route);
  await writeFile(path.join(outDir, "sitemap.xml"), sitemapXml(routes));
  await writeFile(path.join(outDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
}

await writeOutput();
console.log(`Built ${pages.length} pages into ${path.relative(root, outDir)}`);
