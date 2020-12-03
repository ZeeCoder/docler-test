// A factory function for chat messages.
// Could be improved to be able to keep state, and re-render on prop changes,
// but that's not necessary for this exercise.
export default function ChatMessage({ user, message, isMe }) {
  const rootElement = document.createElement("div");
  rootElement.classList.add("ChatMessage");
  if (isMe) {
    rootElement.classList.add("ChatMessage--me");
  } else {
    const userElement = document.createElement("span");
    userElement.innerText = user;
    userElement.classList.add("ChatMessage__user");
    rootElement.appendChild(userElement);
  }

  const messageElement = document.createElement("span");
  messageElement.innerText = message;
  messageElement.classList.add("ChatMessage__message");
  rootElement.appendChild(messageElement);

  return rootElement;
}
