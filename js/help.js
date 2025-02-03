document.addEventListener('DOMContentLoaded', () => {
  const closeHelpButton = document.getElementById('close-help-button');

  // Обработчик для кнопки "Ок"
  closeHelpButton.addEventListener('click', () => {
    window.location.href = 'new-note.html'; // Переход обратно на страницу создания записи
  });
});
