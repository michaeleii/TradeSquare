let msgContainer = document.getElementById("msgContainer");
let chatInput = document.getElementById("chatInput");
let sendBtn = document.getElementById("sendBtn");
let profileImg = document.getElementById("profilePic").src;
let userFullName = document.getElementById("userFullName").innerText;
let chatForm = document.getElementById("chatInputForm");

function createMessage({ sender, text, timestamp }) {
  //create the DOM nodes to print the message to the screen
  let checkIfSenderIsUser = sender.name === userFullName;
  const msgElement = checkIfSenderIsUser
    ? `<div class="flex justify-start py-8 px-8">
        <div class="pr-5">
          <img
            class="rounded-full object-cover w-[80px] h-[80px]"
            src="${sender.img}"
            alt=""
          />
        </div>
        <div
          class="flex justify-center place-items-center h-[70px] bg-slate-400 rounded-full py-8 px-5 text-white"
        >
          <span>${text}</span>
        </div>
      </div>`
    : `
     <div class="flex justify-end px-8 py-8">
        <div
          class="flex justify-center place-items-center h-[70px] bg-primary text-white rounded-full py-2 px-5"
        >
          <p class="">${text}</p>
        </div>
        <div class="pl-5">
          <img
            class="rounded-full w-[80px] h-[80px] object-cover"
            src="${sender.img}"
            alt=""
          />
        </div>
      </div>
    </div>
      `;
  //add the message to the DOM
  msgContainer.innerHTML += msgElement;
  msgContainer.scrollTop = msgContainer.scrollHeight;
}

pubnub.subscribe({
  channels: ["chatroom-1"],
});

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
};
pubnub.addListener(listener);

// send message

async function publishMessage(msg) {
  await pubnub.publish({
    channel: "chatroom-1",
    message: {
      sender: {
        name: userFullName,
        img: profileImg,
      },
      text: msg,
      timestamp: Date.now(),
    },
    signal: ({ message }) => {
      if (message.sender === msgSender.value) return;
      if (message.typing) {
        feedback.innerHTML = `<p><em>${message.sender} is typing a message...</em></p>`;
      } else {
        feedback.innerHTML = "";
      }
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

let isTyping = false;
let typingTimeout;

chatInput.addEventListener("keydown", async (e) => {
  if (e.key === "Backspace" || e.key === "Delete") {
    // User removed the message they were typing
    clearTimeout(typingTimeout);
    isTyping = false;

    await pubnub.signal({
      channel: "chatroom-1",
      message: {
        sender: msgSender.value,
        typing: false,
      },
    });
  } else {
    // User is typing a message
    if (!isTyping) {
      await pubnub.signal({
        channel: "chatroom-1",
        message: {
          sender: msgSender.value,
          typing: true,
        },
      });
    }

    isTyping = true;

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(async () => {
      await pubnub.signal({
        channel: "chatroom-1",
        message: {
          sender: msgSender.value,
          typing: false,
        },
      });
      isTyping = false;
    }, 1000);
  }
});
