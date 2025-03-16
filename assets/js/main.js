let typing = 0;
const recommendations = [];

const searchInput = document.querySelector('.search-input');
const recommendationsContainer = document.querySelector('.recommendations');
const settingsBtn = document.querySelector('.settings-btn');
const settingsPanel = document.querySelector('.settings-panel');
const closeBtn = document.querySelector('.close-btn');
const overlay = document.querySelector('.overlay');
const antiCloseToggle = document.getElementById('antiClose');

const savedAntiCloseState = localStorage.getItem('antiCloseState');
if (savedAntiCloseState === 'true') {
    antiCloseToggle.checked = true;
    window.addEventListener('beforeunload', beforeUnloadHandler);
} else {
    antiCloseToggle.checked = false;
    window.removeEventListener('beforeunload', beforeUnloadHandler);
}

searchInput.addEventListener('input', (e) => {
    const userData = e.target.value.trim();
    if (!userData) {
        recommendationsContainer.style.display = 'none';
        return;
    }

    fetch("https://corsproxy.io/https://google.com/complete/search?client=firefox&hl=en&q=" + encodeURIComponent(userData))
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            try {
                const jsonData = JSON.parse(data);
                const suggestions = jsonData[1];
                if (suggestions && suggestions.length) {
                    recommendationsContainer.innerHTML = suggestions
                        .slice(0, 5)
                        .map(suggestion => {
                            const suggestionText = Array.isArray(suggestion) ? suggestion[0] : suggestion;
                            return `<div class="recommendation-item">${suggestionText}</div>`;
                        })
                        .join('');
                    recommendationsContainer.style.display = 'block';
                } else {
                    recommendationsContainer.style.display = 'none';
                }
            } catch (error) {
                console.error("Error parsing JSON:", error, data);
                recommendationsContainer.style.display = 'none';
            }
        })
        .catch(error => {
            console.error("Error fetching or processing autocomplete data:", error);
            recommendationsContainer.style.display = 'none';
        });
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch(e.target.value.trim());
    }
});

function handleSearch(query) {
    if (!query.includes(".") && !query.startsWith("https://")) {
        query = "https://duckduckgo.com/?q=" + encodeURIComponent(query);
    }
    document.getElementById("display").style.display = "block";
    document.getElementById("mainFrame").style.display = "block";

    const encodedQuery = __uv$config.encodeUrl(query);
    document.getElementById("mainFrame").src = `/service/${encodedQuery}`;
}

recommendationsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('recommendation-item')) {
        searchInput.value = e.target.textContent;
        recommendationsContainer.style.display = 'none';
    }
});

settingsBtn.addEventListener('click', () => {
    settingsPanel.style.display = 'block';
    overlay.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    settingsPanel.style.display = 'none';
    overlay.style.display = 'none';
});

overlay.addEventListener('click', () => {
    settingsPanel.style.display = 'none';
    overlay.style.display = 'none';
});

antiCloseToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        window.addEventListener('beforeunload', beforeUnloadHandler);
        localStorage.setItem('antiCloseState', 'true');
    } else {
        window.removeEventListener('beforeunload', beforeUnloadHandler);
        localStorage.setItem('antiCloseState', 'false');
    }
});

function beforeUnloadHandler(e) {
    e.preventDefault();
    e.returnValue = '';
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        recommendationsContainer.style.display = 'none';
    }
});
