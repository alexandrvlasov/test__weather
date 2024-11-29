import dictionary from './dictionary.js';
console.log(dictionary)
const apiKey = 'ed9b19c86d874da68b5161953242611';

const inputLatitude = document.querySelector('#inputLatitude');
const inputLongitude = document.querySelector('#inputLongitude');
const header = document.querySelector('.header');
const searchButton = document.querySelector('.search__button');

searchButton.onclick = handleSearch;

function handleSearch() {
    const latitude = inputLatitude.value.trim();
    const longitude = inputLongitude.value.trim();

    if (!isInputValid(latitude, longitude)) return;
    
    fetchWeatherData(latitude, longitude);
}

function isInputValid(lat, lon) {
    if (!lat || !lon) {
        alert("Пожалуйста, введите как широту, так и долготу.");
        return false;
    } else if (!isValidLatitude(lat)) {
        alert("Пожалуйста, введите широту в верном формате. Должно быть число от -90 до 90.");
        return false;
    } else if (!isValidLongitude(lon)) {
        alert("Пожалуйста, введите долготу в верном формате. Должно быть число от -180 до 180.");
        return false;
    }
    return true;
}

function isValidLatitude(lat) {
    const parsedLat = parseFloat(lat);
    return !isNaN(parsedLat) && parsedLat >= -90 && parsedLat <= 90;
}

function isValidLongitude(lon) {
    const parsedLon = parseFloat(lon);
    return !isNaN(parsedLon) && parsedLon >= -180 && parsedLon <= 180;
}

async function fetchWeatherData(lat, lon) {
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat}, ${lon}`;

    const response = await fetch(url);
    const data = await response.json();
    
    displayWeatherData(data);
}

function displayWeatherData(data) {
    if (data.error) {
        alert("Такой широты и долготы не существует.");
        return;
    }

    const info = dictionary.find((obj) => obj.code === data.current.condition.code);
    const filePath = `./img/${data.current.is_day ? 'day/' : 'night/'}`;
    const fileName = `${data.current.is_day ? info.day : info.night}.png`;
    const imgPath = filePath + fileName;

    const html = createWeatherCard(data, info, imgPath);
    header.insertAdjacentHTML('afterend', html);

    initMap(data.location.lat, data.location.lon);
    
    const deleteButton = header.nextElementSibling.querySelector('.del__button');
    
    deleteButton.onclick = function() {
        const card = deleteButton.closest('.card');
        if (card) {
            card.remove();
        }
    };
}

function createWeatherCard(data, info, imgPath) {
    return `<div class="card">
                <div class="card__info">
                    <div class="card__important_info">
                        <p class="degrees">${data.current.temp_c}°</p>
                        <p>${data.location.name}, ${data.location.country}</p>
                        <p>${data.location.localtime}</p>
                        <p>${data.current.is_day ? info.languages[23]['day_text'] : info.languages[23]['night_text']}</p>
                    </div>
                    <img class="card__weather" src="${imgPath}" width="318" height="318" alt="Погода">
                </div>
                <div id="map"></div>
                <button class="del__button">Удалить карточку</button>
            </div>`;
}

function initMap(lat, lon) {
    const map = new ymaps.Map("map", {
        center: [lat, lon],
        zoom: 12
    });

    const placemark = new ymaps.Placemark([lat, lon]);
    map.geoObjects.add(placemark);
}
