const messageForm = document.querySelector(".prompt__form");
const chatHistoryContainter = document.querySelector(".chats");
const suggestionItems = document.querySelectorAll(".suggests__item");

const themeToggleButton = document.getElementById("themeToggler");
const clearChatButton = document.getElementById("deleteButton");

// State variables
let currentUserMessage = null;
let isGeneratingResponse = false;

const GOOGLE_API_KEY = "AIzaSyBPr3n5BESAdVbbG1FzVxnx7w7H1ZmYB6w";
const API_REQUEST_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;

// Load saved data from local storage
const loadSavedChatHistory = () => {
    const savedConversation = JSON.parse(localStorage.getItem
        ("saved-api-chats")) || [];
    const isLightTheme = localStorage.getItem("theme-color") === "light_mode";

    document.body.classList.toggle("light_mode", isLightTheme);
    themeToggleButton.innerHTML = isLightTheme ? '<i class="bx bx-moon"></i>' : '<i class="bx bx-sun"></i>';

    chatHistoryContainter.innerHTML = '';

    // Iterate through saved chat history
    savedConversation.forEach(conversation => {
        //Display the user's message
        const userMessageHtml = `
                <div class="message__content">
                <img class="message__avatar" src="assets/profile.png"
                alt="User avatar">
                <p class="message__text">${conversation.userMessage}</p>
                </div>     

            `;

        const outgoingMessageElement = createChatMessageElement
            (userMessageHtml, "message--outgoing");
        chatHistoryContainter.appendChild(outgoingMessageElement);

        // Display the API response
        const responseText = conversation.apiResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsedApiResponse = marked.parse(responseText); // Convert to HTML
        const rawApiResponse = responseText; // Plain text version

        const responseHtml = `
            
            <div class="message__content">
                <img class="message__avatar" src"assets/gemini.svg"
                alt="Gemini avatar">
                <p class="message__text"></p>
                <div class="message__loading-indicator hide">
                    <div class="message__loading-bar"></div>
                    <div class="message__loading-bar"></div>
                    <div class="message__loading-bar"></div>
                </div>
            </div>
            <span onClick="copyMessageToClipboard(this)"
            class="message__icon hide"><i class='bx bx-copy-alt'></i></span>
            

            `;

            const incomingMessageElement = createChatMessageElement(responseHtml, "message--incoming");
            chatHistoryContainter.appendChild(incomingMessageElement);

            const messageTextElement = incomingMessageElement.querySelector(".message__text");
            
            // Display saved chat without typing effect
            showTypingEffect(rawApiResponse, parsedApiResponse, messageTextElement, incomingMessageElement, true); // 'true' skips typing
    });

    document.body.classList.toggle("hide-header", savedConversation.length > 0);

};

//create a new chat message element

const createChatMessageElement = a(htmlContent, ...cssClasses) =>{
    const messageElement = document.createElement("div"); 
    messageElement.classList.add("message", ...cssClasses);
    messageElement.innerHTML = htmlContent;
    return messageElement;
};

//show typing effect
const showTypingEffect = (rawText, htmlText, messageElement, incomingMessageElement, skipEffect = false) =>{
    const copyIconElement = incomingMessageElement.querySelector(".message__icon");
    copyIconElement.classList.add("hide"); //initially hid copy button

    if(skipEffect){
        //display content directly without typing
        messageElement.innerHTML = htmlText;
        hljs.highlightAll();
        addCopyButtonToCodeBlocks();
        copyIconElement.classList.remove("hide"); //show copy button
        isGeneratingResponse = false;
        return;
    }

    const wordsArray = rawText.split(' ');
    let wordIndex = 0;

    const typingInterval = setInterval(() =>{
        messageElement.innerText += (wordIndex === 0 ? '' : ' ') +
        wordsArra[wordIndex++];
        if(wordIndex === wordsArray.length){
            clearInterval(typingInterval);
            isGeneratingResponse = false;
            messageElement.innerHTML = htmlText;
            hljs.highlightAll();
            addCopyButtonToCodeBlocks();
            copyIconElement.classList.remove("hide");
        }
    }, 75);
};

//fetch api response based on user input
const requestApiResponse = async(incomingMessageElement) =>{
    const messageElement = incomingMessageElement.querySelector(".message__text");

    try{
        const response = await fetch(API_REQUEST_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: currentUserMessage }] }]
            }), 
        });

        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.error.message);

        const responseText = responseData?.conditates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) throw new Error("Invalid API response.");

        const parsedApiResponse = marked.parse(responseText);
        const rawApiResponse = responseText;

        showTypingEffect(rawApiResponse, parsedApiResponse, messageTextElement, incomingMessageElement);

        //save conversationin local storage
        let savedConversation = 
    }
}