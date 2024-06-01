const messageContainer = document.getElementById('message-container');
const queryInput = document.getElementById('query');
const sendButton = document.querySelector('#input-bar button');

document.addEventListener('DOMContentLoaded', (event) => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const queryText = card.textContent;
            hideWelcomeCards();
            sendQuery(queryText);
        });
    });

    const queryInput = document.getElementById('query');
    queryInput.addEventListener('keydown', handleKeyPress);
});

function hideWelcomeCards() {
    const welcomeCards = document.querySelector('.welcome-cards');
    welcomeCards.classList.add('hidden');
}

function showWelcomeCards() {
    return; // Disable welcome cards for now
    const welcomeCards = document.querySelector('.welcome-cards');
    setTimeout(() => {
        welcomeCards.classList.remove('hidden');
    }, 50); // Small delay to ensure visibility change is noticed by the browser
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

function addResultBoxToUI() {
    const icon = document.createElement('div');
    icon.className = 'icon';
    const appIcon = document.createElement('div');
    const aiIcon = document.createElement('div');
    aiIcon.className = 'ai-icon';
    icon.appendChild(appIcon);
    icon.appendChild(aiIcon);
    const result = document.createElement('div');
    result.className = 'result';
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
        aiIcon[i].classList.add('hidden');
    }
    // todo remove shimmer effect 
}

async function sendQuery(queryText) {
    // Disable input and button
    queryInput.disabled = true;
    sendButton.disabled = true;

    addUserMessageToUI(queryText);
    // let loadingDiv = addLoaderToUI();
    // Removed this loading animation.

    let isResultReceived = false;
    let planDisplayed = false;
    let receivedResult = "";
    let receivedPlanData = "";

    let resultBox = addResultBoxToUI();
    console.log(resultBox);


    mockDoQuery(queryText, async (planData) => {
        /// onPlanReceived
        receivedPlanData = planData;
        await displayPlanData(resultBox, planData);
        planDisplayed = true;
        if (isResultReceived) {
            displayExecuteData(resultBox, receivedResult);
        }
    }, (result) => {
        /// onResultReceived
        isResultReceived = true;
        receivedResult = result;
        if (planDisplayed) {
            displayExecuteData(resultBox, receivedResult);
        }
    }, () => {
        /// onError
        // loadingDiv.remove();

        // Enable input and button in case of error
        queryInput.disabled = false;
        sendButton.disabled = false;
        queryInput.focus();

        // Show welcome cards again in case of error
        showWelcomeCards();
    });

    async function displayPlanData(box, planData) {
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
        box.parentElement.style.minHeight = '0';

        // Remove loading animation
        // loadingDiv.remove();

        // Enable input and button
        queryInput.disabled = false;
        sendButton.disabled = false;
        queryInput.focus();

        // Show welcome cards again
        showWelcomeCards();
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
