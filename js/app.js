// app.js

// Эта часть кода инициализирует работу с базой данных (IndexedDB) и служит для всех страниц приложения
const dbName = 'OpenCBTDatabase';
const dbVersion = 1;
let db;

// Функция для открытия базы данных
const openDatabase = () => {
  const request = indexedDB.open(dbName, dbVersion);

  request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains('notes')) {
      db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
    }
  };

  request.onsuccess = (event) => {
    db = event.target.result;
  };

  request.onerror = (error) => {
    console.error('Ошибка базы данных:', error);
  };
};

// Инициализация базы данных при загрузке
openDatabase();
