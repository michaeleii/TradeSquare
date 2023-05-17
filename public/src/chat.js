let msgContainer = document.getElementById("msgContainer");
let chatInput = document.getElementById("chatInput");
let sendBtn = document.getElementById("sendBtn");
let chatForm = document.getElementById("chatInputForm");
let typingIndicator = document.getElementById("typingIndicator");

function createMessage({ sender, text, timestamp }) {
  //create the DOM nodes to print the message to the screen
  let checkIfSenderIsUser = sender.name === userFullName;
  const msgElement = checkIfSenderIsUser
    ? `<div class="flex justify-start items-center py-8 px-8 gap-4">
          <img
            class="rounded-full w-[40px] object-cover"
            src="${sender.img}"
            alt=""
          />
        <div
          class="flex justify-center place-items-center bg-slate-400 text-white rounded-3xl px-5 py-2"
        >
          <p>${text}</p>
        </div>
      </div>`
    : `
     <div class="flex justify-end px-8 py-8 items-center gap-4">
        <div
          class="flex justify-center place-items-center bg-primary text-white rounded-3xl px-5 py-2"
        >
          <p class="">${text}</p>
        </div>
          <img
            class="rounded-full w-[40px] object-cover"
            src="${sender.img}"
            alt=""
          />
      </div>
    </div>
      `;
  //add the message to the DOM
  msgContainer.innerHTML += msgElement;
  msgContainer.scrollTop = msgContainer.scrollHeight;
}

pubnub.subscribe({
  channels: [channel],
});

let isTyping = false;
let typingTimeout;

// add listener
const listener = {
  status: (statusEvent) => {
    if (statusEvent.category === "PNConnectedCategory") {
      console.log("Connected");
    }
  },
  message: ({ message }) => {
    createMessage(message);
  },
  signal: ({ message }) => {
    if (message.sender === userFullName) return;
    typingIndicator.innerText = message.typing
      ? `${message.sender} is typing a message...`
      : "";
  },
  objects: (objectEvent) => {
    console.log(objectEvent);
  },
};
pubnub.addListener(listener);

pubnub.objects.setChannelMetadata({
  channel,
  data: {
    name: channel,
    custom: {
      id: userId,
      name: userFullName,
      img: profileImg,
    },
  },
});
// send message

async function publishMessage(msg) {
  clearTimeout(typingTimeout);
  isTyping = false;

  await pubnub.signal({
    channel,
    message: {
      sender: userFullName,
      typing: false,
    },
  });
  await pubnub.publish({
    channel,
    message: {
      sender: {
        name: userFullName,
        img: profileImg,
      },
      text: msg,
      timestamp: Date.now(),
    },
  });
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = chatInput.value;
  if (!msg.trim().length) return;
  await publishMessage(msg);
  chatInput.value = "";
});

chatInput.addEventListener("keydown", async (e) => {
  if (e.key === "Backspace" || e.key === "Delete") {
    // User removed the message they were typing
    clearTimeout(typingTimeout);
    isTyping = false;

    await pubnub.signal({
      channel,
      message: {
        sender: userFullName,
        typing: false,
      },
    });
  } else {
    // User is typing a message
    if (!isTyping) {
      await pubnub.signal({
        channel,
        message: {
          sender: userFullName,
          typing: true,
        },
      });
    }

    isTyping = true;

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(async () => {
      await pubnub.signal({
        channel,
        message: {
          sender: userFullName,
          typing: false,
        },
      });
      isTyping = false;
    }, 5000);
  }
});
