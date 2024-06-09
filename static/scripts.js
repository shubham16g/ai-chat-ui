const messageContainer = document.getElementById('message-container');
const queryInput = document.getElementById('query');
const sendButton = document.querySelector('#input-bar button');

document.addEventListener('DOMContentLoaded', (event) => {
    setupWelcomeCards([
        'Suggest Some cheap stocks',
        'What is the market cap of TCS',
        'Top 10 stocks in automotive industry',
        'Most invested Stock',
        'Most invested Stock',
        'Most invested Stock',
        'Most invested Stock',
        'Most invested Stock',
    ]);
});

function setupWelcomeCards(suggestions) {
    const welcomeCards = document.querySelector('.welcome-cards');
    for (let i = 0; i < suggestions.length; i++) {
        addWelcomeCardToUI(welcomeCards, suggestions[i], i * 50);
    }
    // const cards = document.querySelectorAll('.card');
    // cards.forEach(card => {
    //     card.addEventListener('click', () => {
    //         const queryText = card.textContent;
    //         hideWelcomeCards();
    //         sendQuery(queryText);
    //     });
    // });

    const queryInput = document.getElementById('query');
    queryInput.addEventListener('keydown', handleKeyPress);
}

function addWelcomeCardToUI(welcomeCardsDiv, suggestion, delay) {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = suggestion;
    card.addEventListener('click', () => {
        sendQuery(suggestion);
    });
    setTimeout(() => {
        welcomeCardsDiv.appendChild(card);
    }, delay);
}

function hideWelcomeCards() {
    const welcomeCards = document.querySelector('.welcome-cards');
    welcomeCards.classList.add('hidden');
}

function addUserMessageToUI(queryText) {
    const div = document.createElement('div');
    div.textContent = queryText;
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'user-message';
    setTimeout(() => {
        userMessageDiv.appendChild(div);
    }, 400);
    messageContainer.appendChild(userMessageDiv);
}

function addLoaderToUI() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = `
        <div class="siri-loader">
            <div></div><div></div><div></div><div></div><div></div>
        </div>`;
    messageContainer.appendChild(loadingDiv);
    return loadingDiv;
}

function createShimmerDiv() {
    const shimmer = document.createElement('div');
    shimmer.className = 'shimmer';
    addShimmerItem(shimmer, 1600);
    addShimmerItem(shimmer, 2000);
    addShimmerItem(shimmer, 2400);
    return shimmer;
}

async function hideShimmerDiv() {
    const shimmer = document.getElementsByClassName('shimmer');
    for (let i = 0; i < shimmer.length; i++) {
        shimmer[i].classList.add('hidden');
    }
    await new Promise(resolve => setTimeout(resolve, 600));
    for (let i = 0; i < shimmer.length; i++) {
        shimmer[i].classList.remove('shimmer');
    }
}

function addShimmerItem(shimmer, delay) {
    const div = document.createElement('div');
    setTimeout(() => {
        shimmer.appendChild(div);
    }, delay);
}

function addResultBoxToUI() {
    const icon = document.createElement('div');
    icon.className = 'icon';
    const aiIcon = document.createElement('div');
    aiIcon.className = 'ai-icon';
    icon.appendChild(aiIcon);
    const appIcon = document.createElement('div');
    appIcon.className = 'app-icon';
    icon.appendChild(appIcon);
    const result = document.createElement('div');
    result.className = 'result';
    result.appendChild(createShimmerDiv());
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.className = 'result-message';
    setTimeout(() => {
        aiMessageDiv.appendChild(icon);
        aiMessageDiv.appendChild(result);
    }, 1000);
    messageContainer.appendChild(aiMessageDiv);
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
    return result;
}

function hideAiLoading() {
    let aiIcon = document.getElementsByClassName('ai-icon');
    for (let i = 0; i < aiIcon.length; i++) {
        const ai = aiIcon[i];
        const appIcon = ai.nextElementSibling;
        ai.classList.add('hidden');
        appIcon.classList.add('visible');
        setTimeout(() => {
            ai.classList.remove('ai-icon');
        }, 800);
    }
    // todo remove shimmer effect 
}

async function sendQuery(queryText) {
    // Disable input and button
    queryInput.disabled = true;
    sendButton.disabled = true;

    hideWelcomeCards();

    const aiMessageDiv = messageContainer.lastElementChild;

    addUserMessageToUI(queryText);
    // let loadingDiv = addLoaderToUI();
    // Removed this loading animation.

    let isResultReceived = false;
    let planDisplayed = false;
    let receivedResult = "";
    let receivedPlanData = "";
    let suggestions = [];

    let resultBox = addResultBoxToUI();
    if (aiMessageDiv) {
        aiMessageDiv.style.minHeight = '0';
    }

    mockDoQuery(queryText, async (planData) => {
        /// onPlanReceived
        receivedPlanData = planData;
        await displayPlanData(resultBox, planData);
        planDisplayed = true;
        if (isResultReceived) {
            displayExecuteData(resultBox, receivedResult);
            tryShowSuggestions();
        }
    }, (result) => {
        /// onResultReceived
        isResultReceived = true;
        receivedResult = result;
        if (planDisplayed) {
            displayExecuteData(resultBox, receivedResult);
            tryShowSuggestions();
        }
    }, (mSuggestions) => {
        suggestions = mSuggestions;
        tryShowSuggestions();
    }, (error) => {
        displayErrorData(resultBox, error);
    });

    async function tryShowSuggestions() {
        if (!(isResultReceived && planDisplayed && suggestions.length > 0)) return;
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'suggestions';
        resultBox.appendChild(suggestionsDiv);
        for (let i = 0; i < suggestions.length; i++) {
            await addSuggestionItem(suggestionsDiv, suggestions[i], i * 100 + 100);
        }
    }
    async function addSuggestionItem(suggestionsDiv, suggestion, delay) {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'sug';
        suggestionDiv.textContent = suggestion;
        suggestionDiv.addEventListener('click', () => {
            const queryText = suggestionDiv.textContent;
            sendQuery(queryText);
        });
        await new Promise(resolve => setTimeout(resolve, delay));
        suggestionsDiv.appendChild(suggestionDiv);
    }

    async function displayErrorData(box, errorData) {
        setTimeout(() => {
            hideAiLoading();
        }, 200);
        await hideShimmerDiv();
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'error-message';
        aiMessageDiv.innerHTML = `${errorData}`;
        box.appendChild(aiMessageDiv);

        queryInput.disabled = false;
        sendButton.disabled = false;
        queryInput.focus();
    }

    async function displayPlanData(box, planData) {
        await hideShimmerDiv();
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        box.appendChild(aiMessageDiv);

        let index = 0;
        await printCharByChar();
        async function printCharByChar() {
            if (index >= planData.length) {
                return;
            }
            aiMessageDiv.textContent += planData.charAt(index);
            index++;
            await new Promise(resolve => setTimeout(resolve, isResultReceived ? 5 : 50));
            await printCharByChar();
        }
    }

    function displayExecuteData(box, executeData) {
        hideAiLoading();
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        aiMessageDiv.innerHTML = `${executeData}`;
        box.appendChild(aiMessageDiv);

        // Remove loading animation
        // loadingDiv.remove();

        // Enable input and button
        queryInput.disabled = false;
        sendButton.disabled = false;
        queryInput.focus();
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

async function sendMessage() {
    const queryInput = document.getElementById('query');
    const queryText = queryInput.value;
    if (queryText.trim() === "") return;
    hideWelcomeCards();
    sendQuery(queryText);
    queryInput.value = '';
}
