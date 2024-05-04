const messageContainer = document.getElementById('message-container');
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
    setTimeout(() => {
        welcomeCards.style.display = 'hidden';
    }, 500); // Match this duration to your CSS transition duration
}

function showWelcomeCards() {
    const welcomeCards = document.querySelector('.welcome-cards');
    welcomeCards.style.display = 'flex';
    setTimeout(() => {
        welcomeCards.classList.remove('hidden');
    }, 50); // Small delay to ensure visibility change is noticed by the browser
}

function addUserMessageToUI(queryText) {
    const div = document.createElement('div');
    div.textContent = queryText;
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'user-message';
    userMessageDiv.appendChild(div);
    messageContainer.appendChild(userMessageDiv);
}

async function sendQuery(queryText) {
    const messageContainer = document.getElementById('message-container');
    const queryInput = document.getElementById('query');
    const sendButton = document.querySelector('#input-bar button');

    // Disable input and button
    queryInput.disabled = true;
    sendButton.disabled = true;

    addUserMessageToUI(queryText);

    // Show loading animation
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = `
        <div class="siri-loader">
            <div></div><div></div><div></div><div></div><div></div>
        </div>`;
    messageContainer.appendChild(loadingDiv);
    let isResultReceived = false;
    let planDisplayed = false;
    let receivedResult = "";
    let receivedPlanData = "";

    mockDoQuery(queryText, async (planData) => {
        /// onPlanReceived
        receivedPlanData = planData;
        await displayPlanData(planData);
        planDisplayed = true;
        if (isResultReceived) {
            displayExecuteData(receivedResult);
        }
    }, (result) => {
        /// onResultReceived
        isResultReceived = true;
        receivedResult = result;
        if (planDisplayed) {
            displayExecuteData(receivedResult);
        }
    }, () => {
        /// onError
        loadingDiv.remove();

        // Enable input and button in case of error
        queryInput.disabled = false;
        sendButton.disabled = false;
        queryInput.focus();

        // Show welcome cards again in case of error
        showWelcomeCards();
    });

    async function displayPlanData(planData) {
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        messageContainer.appendChild(aiMessageDiv);
        aiMessageDiv.textContent += 'AI: ';

        let index = 0;
        await printCharByChar();
        async function printCharByChar() {
            if (index >= planData.length) {
                return;
            }
            aiMessageDiv.textContent += planData.charAt(index);
            index++;
            await new Promise(resolve => setTimeout(resolve, isResultReceived ? 10 : 50));
            await printCharByChar();
        }
    }

    function displayExecuteData(executeData) {
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        aiMessageDiv.innerHTML = `${executeData}`;
        messageContainer.appendChild(aiMessageDiv);

        // Remove loading animation
        loadingDiv.remove();

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
