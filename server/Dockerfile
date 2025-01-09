# Основной образ для Node.js приложения
FROM node:16

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем приложение в образ
COPY . .

# Экспонируем порт, на котором будет работать приложение
EXPOSE 3000

# Запускаем приложение
CMD [ "npm", "run", "start:dev" ]
