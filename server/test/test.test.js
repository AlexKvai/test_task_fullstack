const request = require('supertest')
const app = require('../index.js') // Путь к вашему Express приложению

beforeAll(done => {
	done()
})

describe('URL Shortener API Tests', () => {
	// Тест создания короткой ссылки
	test('should create a short URL', async () => {
		const response = await request(app).post('/shorten').send({
			originalUrl: 'https://example.com',
			alias: 'testAlias',
			expiresAt: '2024-12-25T12:00:00Z',
		})

		expect(response.status).toBe(201)
		expect(response.body).toHaveProperty('shortUrl')
	})

	// Тест получения информации о ссылке
	test('should get info about a short URL', async () => {
		const response = await request(app).get('/info/testAlias')

		expect(response.status).toBe(200)
		expect(response.body).toHaveProperty('originalUrl')
		expect(response.body).toHaveProperty('createdAt')
		expect(response.body).toHaveProperty('clickCount')
	})

	// Тест на срок действия ссылки
	test('should return 410 if the short URL is expired', async () => {
		await request(app).post('/shorten').send({
			originalUrl: 'https://expired.com',
			alias: 'expiredAlias',
			expiresAt: '2023-01-01T00:00:00Z',
		})

		const response = await request(app).get('/expiredAlias')

		expect(response.status).toBe(410)
		expect(response.body).toHaveProperty('error', 'Срок действия ссылки истёк.')
	})

	// Тест удаления ссылки
	test('should delete the short URL', async () => {
		const response = await request(app).delete('/delete/testAlias')

		expect(response.status).toBe(200)
		expect(response.body).toHaveProperty('message', 'Ссылка удалена.')
	})

	// Тест получения аналитики (после удаления)
	test('should return 404 for analytics after deletion', async () => {
		const response = await request(app).get('/analytics/testAlias')

		expect(response.status).toBe(404) // после удаления ссылки она недоступна
	})
})

afterAll(done => {
	done()
})
