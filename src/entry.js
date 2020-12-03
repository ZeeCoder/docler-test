import ChatMessage from "./components/ChatMessage.js";

const socket = io("http://35.157.80.184:8080/");

const formElement = document.getElementById("Chat__controls");
const errorElement = document.getElementById("Chat__error");
const messagesElement = document.getElementById("Chat__messages");
const userInputElement = document.getElementById("Chat__username-input");
const messageInputElement = document.getElementById("Chat__message-input");
const submitButtonElement = document.getElementById("Chat__submit-button");

const showError = (errorMessage) => {
  errorElement.innerText = errorMessage;
};

const hideError = () => {
  errorElement.innerText = "";
};

const resetMessageInput = () => (messageInputElement.value = "");

const getCurrentUser = () => {
  let user = userInputElement.value;
  if (user.trim() === "") {
    user = "Guest";
  }

  return user;
};

const disableChat = (errorMessage) => {
  userInputElement.disabled = true;
  messageInputElement.disabled = true;
  submitButtonElement.disabled = true;
  if (errorMessage) {
    showError(errorMessage);
  }
};

const enableChat = () => {
  userInputElement.disabled = false;
  messageInputElement.disabled = false;
  submitButtonElement.disabled = false;
  hideError();
};

const handleSubmission = () => {
  const user = getCurrentUser();
  const message = messageInputElement.value;
  if (message.trim() === "") {
    return showError("Please write a message");
  }

  // Seems like the server is not broadcasting these messages across to other
  // clients. It's probable that upon connection a unique channel is created
  // for each client.
  socket.emit("message", { user, message });
  resetMessageInput();
};

socket.on("connect", () => {
  enableChat();
});

socket.on("connect_error", () => {
  disableChat("Failed to connect.");
});

// @see https://socket.io/docs/v3/client-api/#Event-%E2%80%98disconnect%E2%80%99
socket.on("disconnect", (reason) => {
  disableChat(`Disconnected. Reason: ${reason}`);
});

messageInputElement.addEventListener("keydown", () => hideError());

formElement.addEventListener("submit", (event) => {
  event.preventDefault();
  handleSubmission();

  return false;
});

// You may only want to render a certain amount of messages, not all.
const addMessage = ({ message, user }) => {
  // Note that this is a bad solution as you can "impersonate" anyone on the
  // frontend. Normally we would have a user uuid to work with at least.
  const isMe = getCurrentUser() === user;
  const newMessageElement = ChatMessage({ user, message, isMe });
  messagesElement.appendChild(newMessageElement);

  // Always scrolling to bottom if it's our message
  ensureScrollToBottomIfNeeded(isMe);
};

let scrolledToBottom = true;
const ensureScrollToBottomIfNeeded = (forceScroll = false) => {
  if (!forceScroll && !scrolledToBottom) {
    return;
  }

  messagesElement.scrollTo(0, messagesElement.scrollHeight);
};

messagesElement.addEventListener("scroll", () => {
  const sensitivityInPixels = 5;
  const { scrollHeight, scrollTop, clientHeight } = messagesElement;

  scrolledToBottom =
    clientHeight >= scrollHeight ||
    scrollTop + clientHeight + sensitivityInPixels >= scrollHeight;
});

window.addEventListener("resize", (event) => {
  event.stopPropagation();
  ensureScrollToBottomIfNeeded(true);
});

socket.on("message", (message) => addMessage(message));
