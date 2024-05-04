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
    const result = document.createElement('div');
    result.className = 'result';
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.className = 'result-message';
    aiMessageDiv.appendChild(icon);
    aiMessageDiv.appendChild(result);
    messageContainer.appendChild(aiMessageDiv);
    return result;
}

async function sendQuery(queryText) {
    // Disable input and button
    queryInput.disabled = true;
    sendButton.disabled = true;

    addUserMessageToUI(queryText);
    let loadingDiv = addLoaderToUI();
    // Show loading animation

    let isResultReceived = false;
    let planDisplayed = false;
    let receivedResult = "";
    let receivedPlanData = "";

    let resultBox = addResultBoxToUI();
    // scroll to bottom body 
    // window.scrollTo(0, document.body.scrollHeight);
    // make it smooth
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });


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
        loadingDiv.remove();

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
            await new Promise(resolve => setTimeout(resolve, isResultReceived ? 10 : 50));
            await printCharByChar();
        }
    }

    function displayExecuteData(box, executeData) {
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        aiMessageDiv.innerHTML = `${executeData}`;
        box.appendChild(aiMessageDiv);
        box.style.minHeight = '0';

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
