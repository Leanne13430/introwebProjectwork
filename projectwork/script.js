let currentTempCelsius; // store the temperature in this variable in Celsius
let currentHourlyData; // store the hourly forecast data
let currentDailyData; // store the 7-day forecast data

// Get favorite locations from localStorage, fetch the favorite locations list
// and convert it from JSON format to array
let favoriteLocations = JSON.parse(localStorage.getItem('favoriteLocations')) || [];

// This function adds the current location to favorites
// It also checks if the location is valid and if it's not already in the favorites list
function addToFavorites() {
    const location = document.getElementById('locationInput').value.trim();
    if (location && !favoriteLocations.includes(location)) {
        favoriteLocations.push(location);
        localStorage.setItem('favoriteLocations', JSON.stringify(favoriteLocations));
        updateFavoritesList();
    } else if (favoriteLocations.includes(location)) {
        alert('Location is already in your favorites.');
    } else {
        alert('Please enter a valid location.');
    }
}

// This function updates the favorites list display
// It creates and displays list items for each favorite location stored in the favorites array
function updateFavoritesList() {
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = '';

    favoriteLocations.forEach(location => {
        const li = document.createElement('li');
        li.textContent = location;

        // Add a remove button for each favorite location
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.classList.add('remove-favorite-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // This prevents fetching weather when clicking the remove button
            removeFavorite(location);
        });

        li.appendChild(removeBtn);
        favoritesList.appendChild(li);

        // Add click event to the location name to fetch the weather
        li.addEventListener('click', () => {
            fetchWeatherByLocation(location);
        });
    });
}

// This function removes a location from favorites
function removeFavorite(location) {
    favoriteLocations = favoriteLocations.filter(fav => fav !== location);
    localStorage.setItem('favoriteLocations', JSON.stringify(favoriteLocations));
    updateFavoritesList();
}

// Initial call to populate the favorites list on page load
updateFavoritesList();

// Function to update the background color based on the temperature
function updateBackgroundColor(temp) {
    const container = document.querySelector('.container');
    
    if (temp <= 0) {
        container.style.backgroundColor = 'rgba(0, 123, 255, 0.8)'; // Blue shade
    } else if (temp > 0 && temp <= 15) {
        container.style.backgroundColor = 'rgba(123, 50, 255, 0.8)'; // Purple shade
    } else if (temp > 15 && temp <= 30) {
        container.style.backgroundColor = 'rgba(255, 165, 0, 0.8)'; // Orange shade
    } else {
        container.style.backgroundColor = 'rgba(255, 69, 0, 0.8)'; // Red shade
    }
}

// Function to convert Celsius to Fahrenheit, and return the new value in Fahrenheit
function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

// Function to convert Celsius to Kelvin, and return the new value in Kelvin
function celsiusToKelvin(celsius) {
    return celsius + 273.15;
}

// This function updates the temperature display based on the selected unit
// For example, if the selected unit is Fahrenheit, the display will be Fahrenheit
function updateTemperatureDisplay(unit) {
    const tempElement = document.getElementById('temperature');
    
    if (unit === 'F') {
        const tempFahrenheit = celsiusToFahrenheit(currentTempCelsius);
        tempElement.innerHTML = `${tempFahrenheit.toFixed(2)}°F`;
    } else if (unit === 'K') {
        const tempKelvin = celsiusToKelvin(currentTempCelsius);
        tempElement.innerHTML = `${tempKelvin.toFixed(2)}K`;
    } else {
        tempElement.innerHTML = `${currentTempCelsius.toFixed(2)}°C`;
    }
    
    // This function updates hourly forecast with the selected unit
    updateHourlyForecast(unit);

    // This function updates the 7-day forecast with the selected unit
    updateSevenDayForecast(unit);
}

// Add an event listener for the temperature unit dropdown
// When the user changes the temperature unit, update the temperature display accordingly
document.getElementById('unitSelector').addEventListener('change', function() {
    const unit = this.value;
    updateTemperatureDisplay(unit);
});

// Function to update the hourly forecast based on the unit
// It displays the hourly temperature forecast in the selected unit
// For example, if the selected unit is Celsius, it displays in Celsius
function updateHourlyForecast(unit) {
    const forecast = document.getElementById('forecast');
    let forecastHTML = '<h3>Next 24 Hours</h3>';
    forecastHTML += '<div class="hourly-forecast-container">'; // Create a scrollable container, so the user can scroll through it

    currentHourlyData.slice(0, 24).forEach(hour => {
        const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const temp = unit === 'F' ? celsiusToFahrenheit(hour.temp) : (unit === 'K' ? celsiusToKelvin(hour.temp) : hour.temp);
        const description = hour.weather[0].description;
        const iconUrl = `https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`;

        forecastHTML += `
            <div class="hourly-forecast">
                <p>${time}</p>
                <img src="${iconUrl}" alt="${description} icon">
                <p>${temp.toFixed(2)}°${unit}</p>
                <p>${description}</p>
            </div>
        `;
    });

    forecastHTML += '</div>'; // Close the scrollable container
    forecast.innerHTML = forecastHTML;
}

// This function updates the 7-day forecast based on the unit
// Similar to "updateHourlyForecast", but this is for displaying a 7-day forecast
function updateSevenDayForecast(unit) {
    const weatherDetails = document.getElementById('weatherDetails');
    let forecastHTML = '<h3>7-Day Forecast</h3>';
    forecastHTML += '<div class="seven-day-forecast-container">'; // Scrollable container

    currentDailyData.slice(0, 7).forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString();
        const maxTemp = unit === 'F' ? celsiusToFahrenheit(day.temp.max) : (unit === 'K' ? celsiusToKelvin(day.temp.max) : day.temp.max);
        const minTemp = unit === 'F' ? celsiusToFahrenheit(day.temp.min) : (unit === 'K' ? celsiusToKelvin(day.temp.min) : day.temp.min);
        const weatherCondition = day.weather[0].main;
        const customIconUrl = getCustomIcon(weatherCondition);

        forecastHTML += `
            <div class="daily-forecast">
                <p>${date}</p>
                <img src="${customIconUrl}" alt="${weatherCondition} icon">
                <p>Max: ${maxTemp.toFixed(2)}°${unit}</p>
                <p>Min: ${minTemp.toFixed(2)}°${unit}</p>
            </div>
        `;
    });

    forecastHTML += '</div>'; // Close the scrollable container

    weatherDetails.innerHTML = forecastHTML;
}

// Function to fetch weather by city name 
// It takes a city name and fetches the current weather for that city
async function fetchWeatherByLocation(location) {
    const apiKey = "d4e55389f95d3887b76e6c8093f340c6";
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.cod === 200) {
            const lat = data.coord.lat;
            const lon = data.coord.lon;

            // Set the city name in the UI
            document.getElementById('cityName').innerText = data.name;

            await fetchWeatherByCoordinates(lat, lon);
            await fetchHourlyForecast(lat, lon);
        } else {
            alert('Location not found. Please try again.');
        }
    } catch (error) {
        console.log("Error fetching weather data:", error);
    }
}

// This function fetches weather data using coordinates
// Retrieves detailed weather information including hourly and daily forecasts
async function fetchWeatherByCoordinates(lat, lon) {
    const apiKey = "d4e55389f95d3887b76e6c8093f340c6";
    const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        currentHourlyData = data.hourly;  // Store hourly data
        currentDailyData = data.daily;    // Store 7-day forecast data
        displayWeatherData(data);         // Display current weather
        updateHourlyForecast('C');        // Display hourly forecast in Celsius
        updateSevenDayForecast('C');      // Display 7-day forecast in Celsius
    } catch (error) {
        console.log("Error fetching weather data:", error);
    }
}

// Function to display current weather data on the User interface
// It updates different weather parameters on the page
function displayWeatherData(data) {
    const weatherCondition = data.current.weather[0].main; 
    const customIconUrl = getCustomIcon(weatherCondition);

    // Store the temperature in Celsius
    currentTempCelsius = data.current.temp;

    // Update the User interface with the fetched data
    updateTemperatureDisplay('C');

    document.getElementById('description').innerHTML = data.current.weather[0].description;
    document.getElementById('humidity').innerHTML = `${data.current.humidity}%`;
    document.getElementById('windSpeed').innerHTML = `${data.current.wind_speed}Km/h`;
    document.getElementById('weatherIcon').src = customIconUrl; // Update the weather icon

    // Update background color based on temperature
    updateBackgroundColor(currentTempCelsius);
}

// This function returns a custom icon URL based on weather condition
// It selects a specific icon depending on the current weather condition
function getCustomIcon(weatherCondition) {
    const weatherIcons = {
        'Clear': 'images/clear.png',
        'Clouds': 'images/cloud.png',
        'Rain': 'images/rain.png',
        'Snow': 'images/snow.png',
        'Mist': 'images/mist.png',
    };

    return weatherIcons[weatherCondition] || 'images/default.png'; // Returns default icon if condition not found
}

// This function gets the user's location
// Uses the browser's geolocation API to locate the current position of the user
async function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            await fetchCityName(lat, lon);
            await fetchWeatherByCoordinates(lat, lon);
        }, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Function to fetch the city name by latitude and longitude
async function fetchCityName(lat, lon) {
    const apiKey = "d4e55389f95d3887b76e6c8093f340c6";
    const apiUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data && data.length > 0) {
            document.getElementById('cityName').innerText = data[0].name;
        }
    } catch (error) {
        console.log("Error fetching city name:", error);
    }
}

// Function to handle errors in geolocation
// Prints different messages based on the error, explaining the error
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

// Add an event listener for manual location search
// When the search button is clicked, fetch the weather data for the entered location
document.getElementById('searchBtn').addEventListener('click', function() {
    const location = document.getElementById('locationInput').value;
    if (location) {
        fetchWeatherByLocation(location);
    } else {
        alert('Please enter a location');
    }
});

// Add an event listener for "Add to Favorites" button
document.getElementById('addToFavoritesBtn').addEventListener('click', addToFavorites);

// Call getLocation on page load
window.onload = getLocation;
