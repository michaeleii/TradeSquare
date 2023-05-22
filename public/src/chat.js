let msgContainer = document.getElementById("msgContainer");
let chatInput = document.getElementById("chatInput");
let sendBtn = document.getElementById("sendBtn");
let chatForm = document.getElementById("chatInputForm");
let typingIndicator = document.getElementById("typingIndicator");

function createMessage({ sender, text, timestamp }) {
  //create the DOM nodes to print the message to the screen
  const dayOfWeek = document.querySelector("#msgContainer > p:last-of-type");
  const msgDayOfWeek = new Date(timestamp).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });
  msgContainer.innerHTML +=
    !dayOfWeek || dayOfWeek.innerText !== msgDayOfWeek
      ? `<p class="text-md text-darkgrey flex justify-center mt-2 ml-16">${msgDayOfWeek}</p>`
      : "";
  const dateOfMessage = new Date(timestamp).toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  let checkIfSenderIsUser = sender.name === userFullName;
  const msgElement = checkIfSenderIsUser
    ? `<div class="flex flex-col py-8 px-8 items-end justify-end">
    <div class="flex items-center gap-4">
        <div
          class="flex justify-center place-items-center bg-primary text-white rounded-3xl px-5 py-2"
        >
          <p>${text}</p>
        </div>
         <img
            class="rounded-full w-[40px] object-cover"
            src="${sender.img}"
            alt=""
          />
              </div>
           <p class="text-sm text-grey justify-start mt-2 mr-16">${dateOfMessage}</p>
       
      </div>
     
      `
    : `
    <div class="flex flex-col py-8 px-8 items-start justify-start">
     <div class="flex items-center gap-4">
          <img
            class="rounded-full w-[40px] object-cover"
            src="${sender.img}"
            alt=""
          />
        <div
          class="flex justify-center place-items-center bg-slate-400 text-white rounded-3xl px-5 py-2"
        >
          <p class="">${text}</p>
        </div>
    </div>
     <p class="text-sm text-grey justify-start mt-2 ml-16">${dateOfMessage}</p>
    </div>
      `;
  //add the message to the DOM
  msgContainer.innerHTML += msgElement;
  msgContainer.scrollTop = msgContainer.scrollHeight;
}

pubnub.objects.getAllChannelMetadata({}, (status, response) => {
  const { data: receiverChannels } = response;
  const filteredReceiverChannel = receiverChannels
    .filter(
      (receiverChannel) =>
        receiverChannel.name === `tradesquare.${userId}${receiverId}` ||
        receiverChannel.name === `tradesquare.${receiverId}${userId}`
    )
    .map((filteredChannel) => filteredChannel.name);
  const currentChannel = filteredReceiverChannel.length
    ? filteredReceiverChannel[0]
    : `tradesquare.${userId}${receiverId}`;

  pubnub.subscribe({
    channels: [currentChannel],
  });

  pubnub.fetchMessages(
    {
      channels: [currentChannel],
      count: 25,
    },
    function (status, response) {
      if (status.error) {
        console.log(status);
        return;
      }
      if (!response.channels) return;
      const { channels } = response;
      const channel = channels[currentChannel.split("|").join("%7C")];
      channel.forEach(({ message }) => {
        createMessage(message);
      });
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
  );

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
      if (!(message.sender === userFullName)) {
        typingIndicator.innerText = message.typing
          ? `${message.sender} is typing a message...`
          : "";
      }
    },
  };
  pubnub.addListener(listener);

  // send message
  async function publishMessage(msg) {
    clearTimeout(typingTimeout);
    isTyping = false;

    await pubnub.signal({
      channel: currentChannel,
      message: {
        sender: userFullName,
        typing: false,
      },
    });

    await pubnub.publish({
      channel: currentChannel,
      message: {
        sender: {
          name: userFullName,
          img: userProfileImg,
        },
        text: msg,
        timestamp: Date.now(),
      },
    });
  }

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    //=========== set channel metadata ==============
    pubnub.objects.setChannelMetadata({
      channel: currentChannel,
      data: {
        name: currentChannel,
        custom: {
          userId,
          userFullName,
          userProfileImg,
          receiverId,
          receiverFullName,
          receiverProfileImg,
        },
      },
    });

    //=========== add receiver to channel ==============
    pubnub.objects.setChannelMembers({
      channel: currentChannel,
      uuids: [receiverId],
    });

    // =========== send signal for live Mailbox update ==============
    await pubnub.signal({
      channel: currentChannel,
      message: {
        updateMailbox: true,
      },
    });

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
        channel: currentChannel,
        message: {
          sender: userFullName,
          typing: false,
        },
      });
    } else {
      // User is typing a message
      if (!isTyping) {
        await pubnub.signal({
          channel: currentChannel,
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
          channel: currentChannel,
          message: {
            sender: userFullName,
            typing: false,
          },
        });
        isTyping = false;
      }, 5000);
    }
  });
});
