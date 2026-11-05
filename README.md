# Автоматизация разбора файлов


[![hexlet-check](https://github.com/andrei0783-prog/ai-automation-project-439/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/andrei0783-prog/ai-automation-project-439/actions)

Напишите консольную программу на JavaScript, которая разбирает папку с документами
компании: определяет тип каждого файла, находит дубликаты, отделяет полезные документы
от посторонних и собирает реестр. Отдельная команда сводит выгрузки контактов из разных
источников в одну таблицу — приводит колонки к единому виду, нормализует телефоны
и email, убирает повторы.

Учебный проект Хекслета: https://ru.hexlet.io/programs/ai-automation


## Стек

- JavaScript

## Установка

Понадобятся Git и Node.js 24 с npm. Выполните в терминале:

```bash
git clone https://github.com/andrei0783-prog/ai-automation-project-439.git
cd ai-automation-project-439
npm ci
npm link
```

`npm ci` устанавливает зависимости, а `npm link` делает доступной команду
`file-automation`.

## Использование

Показать справку:

```bash
file-automation --help
```

Запуск без аргументов также выводит справку:

```bash
file-automation
```

Показать версию:

```bash
file-automation --version
```

Если вы не выполняли `npm link`, запустите справку из папки проекта напрямую:

```bash
node bin/file-automation.js --help
```

Сейчас доступны справка и версия. Команды `files` и `contacts` объявлены,
но обработка файлов и контактов пока не реализована.

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
