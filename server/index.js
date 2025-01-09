const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')

const app = express()
app.use(bodyParser.json())
app.use(cors())
const PORT = 3000

// База данных (в памяти)
const urlDatabase = {}

// Создание короткой ссылки
app.post('/shorten', (req, res) => {
	const { originalUrl, alias, expiresAt } = req.body

	if (!originalUrl) {
		return res.status(400).json({ error: 'Поле originalUrl обязательно.' })
	}

	// Проверка длины alias
	if (alias && alias.length > 20) {
		return res
			.status(400)
			.json({ error: 'Alias не может быть длиннее 20 символов.' })
	}

	// Генерация уникального короткого URL (хэш)
	const shortUrl = alias || uuidv4().slice(0, 6)

	// Проверка уникальности alias
	if (alias && urlDatabase[alias]) {
		return res.status(400).json({ error: 'Alias уже используется.' })
	}

	const now = new Date()
	const record = {
		originalUrl,
		shortUrl,
		createdAt: now.toISOString(),
		expiresAt: expiresAt || null,
		clickCount: 0,
		analytics: [], // массив аналитики
	}

	urlDatabase[shortUrl] = record

	// Возвращаем полный объект записи
	res.status(201).json(record)
})

// Переадресация
app.get('/:shortUrl', (req, res) => {
	const { shortUrl } = req.params
	const record = urlDatabase[shortUrl]

	if (!record) {
		return res.status(404).json({ error: 'Ссылка не найдена.' })
	}

	// Проверка времени жизни
	const now = new Date()
	if (record.expiresAt && new Date(record.expiresAt) < now) {
		return res.status(410).json({ error: 'Срок действия ссылки истёк.' })
	}

	record.clickCount += 1
	record.analytics.push({ date: now.toISOString(), ip: req.ip })
	res.redirect(record.originalUrl)
})

// Получение информации о ссылке
app.get('/info/:shortUrl', (req, res) => {
	const { shortUrl } = req.params
	const record = urlDatabase[shortUrl]

	if (!record) {
		return res.status(404).json({ error: 'Ссылка не найдена.' })
	}

	res.json({
		originalUrl: record.originalUrl,
		createdAt: record.createdAt,
		clickCount: record.clickCount,
	})
})

// Удаление короткой ссылки
app.delete('/delete/:shortUrl', (req, res) => {
	const { shortUrl } = req.params
	if (!urlDatabase[shortUrl]) {
		return res.status(404).json({ error: 'Ссылка не найдена.' })
	}

	delete urlDatabase[shortUrl]
	res.status(200).json({ message: 'Ссылка удалена.' })
})

// Аналитика переходов
app.get('/analytics/:shortUrl', (req, res) => {
	const { shortUrl } = req.params
	const record = urlDatabase[shortUrl]

	if (!record) {
		return res.status(404).json({ error: 'Ссылка не найдена.' })
	}

	res.json({
		clickCount: record.clickCount,
		lastFiveIPs: record.analytics.slice(-5),
	})
})

// Запуск сервера
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`)
})

module.exports = app
