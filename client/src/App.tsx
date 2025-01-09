import { useState } from 'react'
import './App.css'

function App() {
	const [originalUrl, setOriginalUrl] = useState('')
	const [shortUrl, setShortUrl] = useState('')
	const [error, setError] = useState('')

	const handleSubmit = async e => {
		e.preventDefault()

		try {
			const response = await fetch('http://localhost:3000/shorten', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ originalUrl }),
			})

			if (!response.ok) {
				const errorData = await response.json()
				setError(errorData.error || 'Неизвестная ошибка')
				setShortUrl('')
				return
			}

			const data = await response.json()
			setShortUrl(data.shortUrl)
			setError('')
		} catch (err) {
			setError('Ошибка соединения с сервером')
		}
	}

	return (
		<div className='App'>
			<h1>Сервис сокращения URL</h1>
			<form onSubmit={handleSubmit}>
				<label>
					Оригинальный URL:
					<input
						type='url'
						value={originalUrl}
						onChange={e => setOriginalUrl(e.target.value)}
						placeholder='Введите URL'
						required
					/>
				</label>
				<button type='submit'>Сократить</button>
			</form>

			{shortUrl && (
				<div className='result'>
					<p>Короткая ссылка:</p>
					{shortUrl}
				</div>
			)}

			{error && <p className='error'>{error}</p>}
		</div>
	)
}

export default App
