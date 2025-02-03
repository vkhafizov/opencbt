document.addEventListener("DOMContentLoaded", () => {
  const notesContainer = document.getElementById("notes-container");

  const dbRequest = indexedDB.open("openCBT", 1);

  dbRequest.onupgradeneeded = function (event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("notes")) {
      db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
    }
  };

  dbRequest.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(["notes"], "readonly");
    const notesStore = transaction.objectStore("notes");

    const request = notesStore.openCursor();
    notesContainer.innerHTML = "";

    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        const note = cursor.value;

        // Проверяем, что хотя бы одно поле заполнено, чтобы не выводить пустые записи
        if (
          note.situation ||
          note.emotions ||
          note.automaticThought ||
          note.physicalSensations ||
          note.actions ||
          note.rationalResponse ||
          note.distortions.length > 0
        ) {
          const noteElement = document.createElement("div");
          noteElement.className = "note";

          // Заменяем английские искажения на русские
          const distortionMap = {
            "all-or-nothing": "Всё или ничего",
            "overgeneralization": "Сверхобобщение",
            "negative-filter": "Негативный фильтр",
            "discount-positive": "Обесценивание положительного",
            "jumping-to-conclusions": "Поспешные выводы",
            "magnification": "Преувеличение и преуменьшение",
            "emotional-reasoning": "Эмоциональное обоснование",
            "shoulds": "Долженствования",
            "labeling": "Ярлыки",
            "personalization": "Персонализация"
          };

          const distortionsText = note.distortions
            .map(distortion => distortionMap[distortion] || distortion)
            .join(", ");

          let date = new Date(note.dateTime);
let options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
let formattedDate = date.toLocaleString('ru-RU', options).replace(',', '');
noteHTML = `<p class="date-time">${formattedDate}</p>`;


          // Добавляем искажения сразу после даты
          if (distortionsText) {
            noteHTML += `<p class="distortions">${distortionsText}</p>`;
          }

          // Добавляем только те поля, которые не пустые
         if (note.emotions) {
            noteHTML += `<p class="emotions"><strong>Эмоции:</strong> ${note.emotions}</p>`;
          }

 	if (note.situation) {
            noteHTML += `<p><strong>Ситуация:</strong> ${note.situation}</p>`;
          }
          
          if (note.automaticThought) {
            noteHTML += `<p><strong>Мысль:</strong> "${note.automaticThought}"</p>`;
          }
          if (note.discomfort) {
            noteHTML += `<p><strong>Дискомфорт:</strong> ${note.discomfort}%</p>`;
          }
          if (note.physicalSensations) {
            noteHTML += `<p><strong>Ощущения:</strong> ${note.physicalSensations}</p>`;
          }
          if (note.actions) {
            noteHTML += `<p><strong>Действия:</strong> ${note.actions}</p>`;
          }
          if (note.rationalResponse) {
            noteHTML += `<p class="response"><strong>Ответ:</strong> ${note.rationalResponse}</p>`;
          }

          noteElement.innerHTML = noteHTML;
          noteElement.addEventListener("click", () => {
            window.location.href = `new-note.html?edit=${note.id}`;
          });

          notesContainer.appendChild(noteElement);
        }

        cursor.continue();
      }
    };

    request.onerror = function () {
      alert("Ошибка при загрузке записей.");
    };
  };

  dbRequest.onerror = function () {
    alert("Ошибка при открытии базы данных.");
  };

  document.getElementById("new-note-button").addEventListener("click", () => {
    window.location.href = "new-note.html";
  });
});
