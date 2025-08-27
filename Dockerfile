# Dockerfile

# --- Стадия 1: Установка зависимостей ---
FROM node:20-alpine AS dependencies
WORKDIR /usr/src/app
# Копируем только файлы, нужные для установки зависимостей
COPY package*.json ./
# Устанавливаем только production-зависимости
RUN npm ci --omit=dev

# --- Стадия 2: Сборка приложения ---
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
# Копируем package*.json И устанавливаем ВСЕ зависимости (включая devDependencies для сборки)
COPY package*.json ./
RUN npm ci
# Копируем исходный код
COPY . .
# Собираем приложение
RUN npm run build

# --- Стадия 3: Финальный образ ---
FROM node:20-alpine AS final
WORKDIR /usr/src/app
# Копируем production-зависимости из стадии 'dependencies'
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
# Копируем собранное приложение из стадии 'builder'
COPY --from=builder /usr/src/app/dist ./dist
# Копируем package.json (может быть нужен для некоторых библиотек)
COPY package.json .

# Укажи порт, который слушает твое приложение (обычно 3000 или из ConfigService)
# Убедись, что он совпадает с тем, что в main.ts и docker-compose.yml
EXPOSE 3000

# Команда для запуска приложения
CMD ["node", "dist/main"]