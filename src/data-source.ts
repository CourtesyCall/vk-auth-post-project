import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Загружаем переменные окружения из файла .env
config();

// Экспортируем DataSource, который будет использоваться CLI
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: 'yourpassword',
  database: process.env.POSTGRES_DB,

  // Указываем пути к вашим сущностям (entities) и миграциям.
  // Пути могут потребовать корректировки в зависимости от вашей структуры.
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  // Важно для продакшена:
  synchronize: false,
  migrationsTableName: 'migrations', // Имя таблицы для хранения истории миграций
});