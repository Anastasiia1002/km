// script.js
document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  const form = document.getElementById("supportForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn?.querySelector(".btn-text");
  const btnLoader = submitBtn?.querySelector(".btn-loader");
  const messageTextarea = document.getElementById("message");
  const messageCounter = document.getElementById("message-count");
  const MAX_FILE_SIZE = 1048576; // 1MB
  const MAX_FILES_COUNT = 5;
  const MAX_MESSAGE_LENGTH = 5000;

  // Підрахунок символів для textarea
  if (messageTextarea && messageCounter) {
    function updateCharCount() {
      const length = messageTextarea.value.length;
      messageCounter.textContent = length;
      if (length > MAX_MESSAGE_LENGTH * 0.9) {
        messageCounter.parentElement.classList.add("warning");
      } else {
        messageCounter.parentElement.classList.remove("warning");
      }
    }
    messageTextarea.addEventListener("input", updateCharCount);
    updateCharCount(); // Початковий підрахунок
  }

  // Обробка файлів
  if (fileInput && fileList) {
    fileInput.addEventListener("change", function () {
      fileList.innerHTML = "";
      const files = this.files;
      const fileHelp = document.getElementById("file-help");

      if (files.length === 0) {
        if (fileHelp) fileHelp.textContent = "Оберіть файли для завантаження";
        return;
      }

      if (files.length > MAX_FILES_COUNT) {
        alert("Максимальна кількість файлів - " + MAX_FILES_COUNT);
        this.value = "";
        fileList.innerHTML = "";
        if (fileHelp) fileHelp.textContent = "Оберіть файли для завантаження";
        return;
      }

      let listHtml = "<ul>";
      let hasError = false;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Перевірка розміру (1MB)
        if (file.size > MAX_FILE_SIZE) {
          alert(`Файл "${file.name}" занадто великий. Максимум 1МБ.`);
          this.value = "";
          fileList.innerHTML = "";
          if (fileHelp) fileHelp.textContent = "Оберіть файли для завантаження";
          hasError = true;
          break;
        }

        const fileSize = (file.size / 1024).toFixed(1);
        const fileIcon = getFileIcon(file.name);
        listHtml += `<li role="listitem">
                    <span class="file-icon">${fileIcon}</span>
                    <span class="file-name">${escapeHtml(file.name)}</span>
                    <span class="file-size">(${fileSize} KB)</span>
                </li>`;
      }

      if (!hasError) {
        listHtml += "</ul>";
        fileList.innerHTML = listHtml;
        if (fileHelp) {
          fileHelp.textContent = `Обрано файлів: ${files.length}`;
        }
      }
    });
  }

  // Функція для отримання іконки файлу
  function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    const icons = {
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      pdf: "📄",
      doc: "📝",
      docx: "📝",
    };
    return icons[ext] || "📎";
  }

  // Екранування HTML
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Валідація форми на клієнті
  if (form) {
    form.addEventListener("submit", function (e) {
      let isValid = true;
      const fields = form.querySelectorAll(
        "input[required], select[required], textarea[required]",
      );

      // Очищаємо попередні помилки
      form.querySelectorAll(".field-error-client").forEach((el) => el.remove());
      form
        .querySelectorAll(".error-field")
        .forEach((el) => el.classList.remove("error-field"));

      fields.forEach((field) => {
        field.setAttribute("aria-invalid", "false");

        // Перевірка на порожнє значення
        if (!field.value.trim()) {
          showFieldError(field, "Це поле обов'язкове для заповнення");
          isValid = false;
        }

        if (field.id === "phone" && field.value.trim()) {
          const phoneError = getPhoneError(field.value);
          if (phoneError) {
            showFieldError(field, phoneError);
            isValid = false;
          }
        }

        if (field.id === "message" && field.value.length > MAX_MESSAGE_LENGTH) {
          showFieldError(
            field,
            `Максимальна довжина повідомлення: ${MAX_MESSAGE_LENGTH} символів`,
          );
          isValid = false;
        }
      });

      // Перевірка файлів
      if (fileInput && fileInput.files.length > MAX_FILES_COUNT) {
        alert("Максимальна кількість файлів - " + MAX_FILES_COUNT);
        isValid = false;
      }

      if (!isValid) {
        e.preventDefault();
        // Прокрутка до першої помилки
        const firstError = form.querySelector(".error-field");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
          firstError.focus();
        }
        return false;
      }

      // Показуємо індикатор завантаження
      if (submitBtn && btnText && btnLoader) {
        submitBtn.disabled = true;
        btnText.style.display = "none";
        btnLoader.style.display = "inline";
      }
    });
  }

  // Функція для відображення помилки поля
  function showFieldError(field, message) {
    field.classList.add("error-field");
    field.setAttribute("aria-invalid", "true");

    const errorSpan = document.createElement("span");
    errorSpan.className = "field-error field-error-client";
    errorSpan.setAttribute("role", "alert");
    errorSpan.setAttribute("aria-live", "polite");
    errorSpan.textContent = message;

    field.parentElement.appendChild(errorSpan);
  }

  // Валідація телефону (український номер)
  function normalizeUaPhoneDigits(phone) {
    return String(phone || "").replace(/\D/g, "");
  }

  function isValidPhone(phone) {
    const digits = normalizeUaPhoneDigits(phone);
    return /^0\d{9}$/.test(digits) || /^380\d{9}$/.test(digits);
  }

  function getPhoneError(phone) {
    const trimmed = String(phone || "").trim();
    if (!trimmed) return "Це поле обов'язкове для заповнення";
    if (!isValidPhone(trimmed)) {
      return "Невірний формат. Вкажіть український номер: +380..., 380... або 0...";
    }
    return "";
  }

  // Функція для видалення помилок поля
  function clearFieldError(field) {
    // Видаляємо всі помилки (і клієнтські, і серверні)
    const allErrors = field.parentElement.querySelectorAll(".field-error");
    allErrors.forEach((error) => error.remove());

    // Видаляємо клас помилки
    field.classList.remove("error-field");
    field.setAttribute("aria-invalid", "false");
  }

  // Видалення помилок при введенні для всіх полів
  if (form) {
    const allFields = form.querySelectorAll("input, select, textarea");
    allFields.forEach((field) => {
      // Видаляємо помилки одразу при будь-якій зміні значення
      field.addEventListener("input", function () {
        clearFieldError(this);
      });

      // Для select також обробляємо change (на випадок якщо input не спрацює)
      if (field.tagName === "SELECT") {
        field.addEventListener("change", function () {
          clearFieldError(this);
        });
      }

      // Також видаляємо помилки при фокусі на поле (для кращого UX)
      field.addEventListener("focus", function () {
        clearFieldError(this);
      });
    });
  }

  // Real-time валідація при втраті фокусу
  const fieldsToValidate = ["phone", "message"];
  fieldsToValidate.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener("blur", function () {
        if (this.value.trim()) {
          let isValid = true;
          let errorMsg = "";

          if (fieldId === "phone") {
            const phoneError = getPhoneError(this.value);
            if (phoneError) {
              isValid = false;
              errorMsg = phoneError;
            }
          } else if (
            fieldId === "message" &&
            this.value.length > MAX_MESSAGE_LENGTH
          ) {
            isValid = false;
            errorMsg = `Максимальна довжина: ${MAX_MESSAGE_LENGTH} символів`;
          }

          // Видаляємо попередні клієнтські помилки для цього поля
          const existingError = this.parentElement.querySelector(
            ".field-error-client",
          );
          if (existingError) {
            existingError.remove();
          }

          if (isValid) {
            this.classList.remove("error-field");
            this.setAttribute("aria-invalid", "false");
          } else {
            showFieldError(this, errorMsg);
          }
        }
      });
    }
  });
});
