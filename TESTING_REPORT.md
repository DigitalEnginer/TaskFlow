# TaskFlow — Testing Report

Все 10 тестов проходят успешно. Скриншот вывода Jest ниже.

![Jest Output](./jest-output.png)

---

**Тест 1 — Валидация User: email обязателен**
Тип: Unit | Файл: `tests/unit/user.model.test.js`
Mongoose выбрасывает ошибку если email не указан
Результат: **PASS**

---

**Тест 2 — Валидация User: name обязателен**
Тип: Unit | Файл: `tests/unit/user.model.test.js`
Mongoose выбрасывает ошибку если name не указан
Результат: **PASS**

---

**Тест 3 — Валидация Card: title обязателен**
Тип: Unit | Файл: `tests/unit/card.model.test.js`
Mongoose выбрасывает ошибку если title не указан
Результат: **PASS**

---

**Тест 4 — generateToken возвращает валидный JWT**
Тип: Unit | Файл: `tests/unit/generateToken.test.js`
Функция возвращает строку и декодируется с правильным userId
Результат: **PASS**

---

**Тест 5 — hashPassword хэширует и comparePassword верифицирует**
Тип: Unit | Файл: `tests/unit/hashPassword.test.js`
Верный пароль проходит проверку, неверный — нет
Результат: **PASS**

---

**Тест 6 — authMiddleware пропускает валидный токен**
Тип: Unit | Файл: `tests/unit/authMiddleware.test.js`
Middleware вызывает next() и кладёт user на req при валидном JWT
Результат: **PASS**

---

**Тест 7 — POST /api/auth/register создаёт пользователя**
Тип: Integration | Файл: `tests/integration/auth.test.js`
Эндпоинт возвращает 201, token и данные пользователя
Результат: **PASS**

---

**Тест 8 — POST /api/auth/login возвращает токен**
Тип: Integration | Файл: `tests/integration/auth.test.js`
Эндпоинт возвращает 200 и JWT токен при верных данных
Результат: **PASS**

---

**Тест 9 — GET /api/boards возвращает 401 без токена**
Тип: Integration | Файл: `tests/integration/auth.test.js`
Защищённый роут отклоняет запрос без авторизации
Результат: **PASS**

---

**Тест 10 — POST /api/boards создаёт доску с токеном**
Тип: Integration | Файл: `tests/integration/boards.test.js`
Авторизованный пользователь может создать доску
Результат: **PASS**

---

Test Suites: **7 passed**, 7 total
Tests: **10 passed**, 10 total
Time: 7.181s
