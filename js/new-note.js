document.querySelectorAll('textarea').forEach(textarea => {
  textarea.addEventListener('input', function () {
    this.style.height = 'auto'; // Сброс высоты
    this.style.height = this.scrollHeight + 'px'; // Установка новой высоты
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const dateTimeInput = document.getElementById("date-time");
  const currentDate = new Date().toISOString().slice(0, 16);
  dateTimeInput.value = localStorage.getItem("dateTime") || currentDate;

  const discomfortSlider = document.getElementById("discomfort");
  const discomfortValue = document.getElementById("discomfort-value");
  discomfortSlider.value = localStorage.getItem("discomfort") || 0;
  discomfortValue.textContent = `${discomfortSlider.value}%`;

  const fields = [
    "situation",
    "emotions",
    "automatic-thought",
    "physical-sensations",
    "actions",
    "rational-response"
  ];

  fields.forEach(id => {
    const element = document.getElementById(id);
    element.value = localStorage.getItem(id) || "";
    element.addEventListener("input", () => {
      localStorage.setItem(id, element.value);
    });
  });

  discomfortSlider.addEventListener("input", function () {
    discomfortValue.textContent = `${this.value}%`;
    localStorage.setItem("discomfort", this.value);
  });

  dateTimeInput.addEventListener("input", () => {
    localStorage.setItem("dateTime", dateTimeInput.value);
  });

  document.querySelectorAll('input[name="distortions"]').forEach(checkbox => {
    checkbox.checked = JSON.parse(localStorage.getItem(checkbox.id)) || false;
    checkbox.addEventListener("change", () => {
      localStorage.setItem(checkbox.id, checkbox.checked);
    });
  });

  // Обработка редактирования записи
  const urlParams = new URLSearchParams(window.location.search);
  const editNoteId = urlParams.get('edit');

  if (editNoteId) {
    const dbRequest = indexedDB.open("openCBT", 1);

    dbRequest.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(["notes"], "readonly");
      const notesStore = transaction.objectStore("notes");
      
      const request = notesStore.get(Number(editNoteId));
      request.onsuccess = function () {
        const note = request.result;
        if (note) {
          // Заполняем форму данными из выбранной записи
          dateTimeInput.value = note.dateTime;
          document.getElementById("situation").value = note.situation;
          document.getElementById("emotions").value = note.emotions;
          document.getElementById("automatic-thought").value = note.automaticThought;
          document.getElementById("discomfort").value = note.discomfort;
          discomfortValue.textContent = `${note.discomfort}%`;
          document.getElementById("physical-sensations").value = note.physicalSensations;
          document.getElementById("actions").value = note.actions;
          document.getElementById("rational-response").value = note.rationalResponse;
          
          // Устанавливаем искажения
          note.distortions.forEach(distortion => {
            const checkbox = document.getElementById(distortion);
            if (checkbox) {
              checkbox.checked = true;
            }
          });
        }
      };
    };
  }
});

// Обработка формы при сохранении записи
document.getElementById("new-note-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const note = {
    dateTime: document.getElementById("date-time").value,
    situation: document.getElementById("situation").value,
    emotions: document.getElementById("emotions").value,
    automaticThought: document.getElementById("automatic-thought").value,
    discomfort: document.getElementById("discomfort").value,
    physicalSensations: document.getElementById("physical-sensations").value,
    actions: document.getElementById("actions").value,
    rationalResponse: document.getElementById("rational-response").value,
    distortions: Array.from(document.querySelectorAll('input[name="distortions"]:checked'))
      .map(checkbox => checkbox.value)
  };

  const dbRequest = indexedDB.open("openCBT", 1);

  dbRequest.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(["notes"], "readwrite");
    const notesStore = transaction.objectStore("notes");

    // Если есть ID, обновляем запись, иначе добавляем новую
    const urlParams = new URLSearchParams(window.location.search);
    const editNoteId = urlParams.get('edit');

    if (editNoteId) {
      note.id = Number(editNoteId);
      notesStore.put(note);  // Обновляем запись
    } else {
      notesStore.add(note);  // Добавляем новую запись
    }

    transaction.oncomplete = function () {
      localStorage.clear(); // Очищаем сохранённые данные после успешного сохранения
      window.location.href = "index.html";
    };

    transaction.onerror = function () {
      alert("Ошибка при сохранении записи");
    };
  };

  dbRequest.onerror = function () {
    alert("Ошибка при открытии базы данных");
  };
});
