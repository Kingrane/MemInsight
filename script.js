// Переменные для плавного скролла
let currentScroll = 0;
let targetScroll = 0;
const smoothness = 0.1; // Коэффициент плавности (меньше = плавнее)

// Функция для плавного скролла фона
function smoothScrollBackground() {
    // Получаем текущий процент скролла
    targetScroll = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    
    // Плавно приближаем текущее значение к целевому
    currentScroll += (targetScroll - currentScroll) * smoothness;
    
    // Обновляем позицию фона
    const yPosition = currentScroll * 40;
    document.body.style.backgroundPositionY = `${yPosition}%`;
    
    // Продолжаем анимацию
    requestAnimationFrame(smoothScrollBackground);
}

// Запускаем анимацию
smoothScrollBackground();

// Обработчик загрузки файла

document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const uploadBtn = document.getElementById('uploadBtn');
    const loading = document.getElementById('loading');
    const response = document.getElementById('response');
    const analysisOutput = document.getElementById('analysisOutput');

    // Открыть диалог выбора файла при клике на зону загрузки
    dropZone.addEventListener('click', function() {
        imageInput.click();
    });

    // Обработка выбора файла
    imageInput.onchange = function(event) {
        var reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            dropZone.classList.add('has-image');
        };
        if (event.target.files.length > 0) {
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    // Обработка перетаскивания файлов
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');

        if (e.dataTransfer.files.length) {
            imageInput.files = e.dataTransfer.files;
            const changeEvent = new Event('change');
            imageInput.dispatchEvent(changeEvent);
        }
    });

    // Обработка клика на кнопку "Анализировать"
    uploadBtn.onclick = function() {
        if (imageInput.files.length === 0) {
            alert('Пожалуйста, выберите изображение');
            return;
        }

        var promptText = document.getElementById('promptInput').value.trim() || "Опиши подробно, что ты видишь на этом изображении, объясни смысл мема и его происхождение.";

        var formData = new FormData();
        formData.append('file', imageInput.files[0]);
        formData.append('message', promptText);

        loading.style.display = 'block';
        response.textContent = '';
        analysisOutput.classList.remove('visible');

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            loading.style.display = 'none';
            analysisOutput.classList.add('visible');

            if (data.error) {
                response.textContent = 'Ошибка: ' + data.error;
            } else {
                response.textContent = data.analysis;
            }
        })
        .catch(error => {
            loading.style.display = 'none';
            analysisOutput.classList.add('visible');
            response.textContent = 'Произошла ошибка: ' + error;
        });
    };

    // Начать анализ при нажатии кнопки "Начать"
    document.querySelector('.start-button').addEventListener('click', function() {
        document.querySelector('.upload-section').scrollIntoView({
            behavior: 'smooth'
        });
    });
});

