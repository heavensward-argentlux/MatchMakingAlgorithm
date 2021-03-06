function  pushText(text,  side,  sending = false)  {    
    let  container  =  document.createElement("div");    
    container.className  =  "container";    
    let  bubble  =  document.createElement("div");    
    if  (sending  ==  true)  {         bubble.className  =  `${side} sending`;     } 
    else  {         bubble.className  =  side;     }    
    let  message  =  document.createElement("p");    
    message.textContent  =  text;

        
    bubble.appendChild(message);    
    container.appendChild(bubble);    
    chat.appendChild(container);

        
    chat.scrollTop  =  chat.scrollHeight;

        
    return  bubble;
}

var counter = 0;
setInterval(function() {
    if (counter > 10) {
        alert("You have been spamming the chat. You will now be redirected back to our homepage.");
        setTimeout(function() {
            window.location.pathname = '/';
        }, 3000);
    }
    counter = 0;
}, 5000);

function  sendMessage()  {    
    if  (content.textContent  !=  "")  {
        counter++;
        console.log("content" + content.textContent);        
        receipt_queue.push(pushText(content.textContent,  "right", false));        
        rainbowSDK.im.sendMessageToConversation(conversation,  content.textContent);
        msg += `${user_id}: ${content.textContent} ${new Date(Date.now()).toLocaleDateString("en-US") + " " + new Date(Date.now()).toLocaleTimeString("en-US")}\n`    
    }    
    content.textContent  =  "";
}

function  keyPress(e)  {    
    if  (e.key  ==  "Enter")  {         sendMessage();     }    
    if  (content.textContent  !=  "")  {         send.disabled  =  false;     } 
    else  {         send.disabled  =  true;     }
}

// end chat and close conversation
function  endChat()  {
    if (confirm('Are you sure you want to exit the chat?')) {
        if (confirm('Do you want a copy of the chat logs?')) {
            downloadLogs();
            let msg = "User has left the chat"    
            rainbowSDK.im.sendMessageToConversation(conversation,  msg);
            window.location.pathname = '/';
        } else {
            let msg = "User has left the chat"    
            rainbowSDK.im.sendMessageToConversation(conversation,  msg);
            window.location.pathname = '/';
        }
    } else {
        // Do nothing!
    }

}

const user_stays = async function user_stays() {
    try {
        let msg = "User has been disconnected from the chat"    
        rainbowSDK.im.sendMessageToConversation(conversation,  msg);
        // RainbowSDK.im.sendMessageToConversation(conversation, leftChatMsg);
        disconnect('/chat/disconnect', id).then(() => {
            closeConversation().then(() => {
                window.location.pathname = '/'
            });
        })
    } catch (err) {}
}


window.addEventListener('beforeunload', async function onBeforeUnload(e) {
    setTimeout(user_stays, 500);
    try {
        let msg = "User has been disconnected from the chat"    
        rainbowSDK.im.sendMessageToConversation(conversation,  msg);
        // RainbowSDK.im.sendMessageToConversation(conversation, leftChatMsg);
        disconnect('/chat/disconnect', id).then(() => {
            closeConversation().then(() => {
                window.location.pathname = '/'
            });
        })
    } catch (err) {}
});

function timeOut() {
    let secondsSinceLastActivity = 0;
    // In Seconds
    const maxInactivity = 60;

    // Prevent double load
    let boolFlag = true;

    setInterval(async function() {
        secondsSinceLastActivity++;
        console.log("secondsSince " + secondsSinceLastActivity)
            // After timeout
        if (secondsSinceLastActivity > maxInactivity && boolFlag) {
            boolFlag = false;
            closeBoolean = true;
            window.alert("You have been logged out due to inactivity.");
            window.location.pathname = '/'
        }
    }, 1000);

    function activity() {
        //reset the secondsSinceLastActivity to 0
        secondsSinceLastActivity = 0;
    }

    const activityEvents = [
        'mousedown', 'mousemove', 'keydown',
        'scroll', 'touchstart'
    ];

    activityEvents.forEach(function(eventName) {
        document.addEventListener(eventName, activity, true);
    });
}

async function disconnect(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}

const closeConversation = async() => {
    await rainbowSDK.conversations.closeConversation(conversation)
}

// async function closeConversation() {
//     return awaitrainbowSDK.conversations.closeConversation(conversation)
// }

function downloadLogs() {
    var filename = "logs.txt";
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(msg));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

async  function  waitConnection()  {     // ping server for token and id
    let header = { "tag": tag };    
    let  response  =  await  fetch("/chat/request", { headers: header });    
    let  result  =  await  response.json();    
    let  token  =  result.token;    
    agent_id  =  result.agent_id;
    user_id = result.user_id;
    id = {
        userId: user_id
    }
    leftChatMsg = "User has been disconnected"    
    response  =  await  rainbowSDK.connection.signinSandBoxWithToken(token);

    if (agent_id == null) {
        loading.innerText = "There is nobody online to handle your request";
    }

    // If we need to wait,
    // 1. display wait message to user
    // 2. set up polling loop to check when we are done
    if (agent_id == "WAIT") {
        loading.innerText = `Sit tight while we find you an agent.\n (User ID: ${user_id})`;
        while (agent_id == "WAIT") {
            await new Promise(r => setTimeout(r, 1000));
            let header = { "user_id": user_id };
            let response = await fetch("/polling", { headers: header });
            let result = await response.json();
            agent_id = result.agent_id;
        }
        loading.innerText = "Connecting";
    }

         // get agent, add to network, and open conversation
        
    let contact  =  await  rainbowSDK.contacts.searchById(agent_id);    
    conversation  =  await  rainbowSDK.conversations.openConversationForContact(contact);    
    await  rainbowSDK.im.getMessagesFromConversation(conversation);

        
    document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED,  receive);    
    document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMRECEIPTRECEIVED,  receipt);

    open_chat.style.display = "none";
    dialog.style.display = "none";    
    document.body.appendChild(chat);    
    document.body.appendChild(content);    
    document.body.appendChild(send);    
    document.body.appendChild(end); 

        
    send.addEventListener("click",  sendMessage);    
    content.addEventListener("keyup",  keyPress);    
    end.addEventListener("click",  endChat);

    // let the agent know the context of the conversation
    let alert = `New chat support request. Tag: ${tag}.`;    
    rainbowSDK.im.sendMessageToConversation(conversation, alert);
    timeOut();
}

async function redirect(redirect_tag) {
    await closeConversation();
    await disconnect('/chat/disconnect', { "userId": user_id });
    let data = JSON.stringify({ "data": redirect_tag });
    window.localStorage.setItem("tag", data);
    window.location = "chat";
}

function  receive(e)  {    
    let  message  =  e.detail.message;
    if (message.data.substring(0, 9) == "/REDIRECT") {
        new_tag = message.data.substring(10);
        redirect(new_tag);
        // if (new_tag in valid_tags) {
        //     redirect(new_tag);
        // }
        return;
    } else if (message.data.substring(0, 5) == "/EXIT") {
    		disconnect('/chat/disconnect', id).then(() => {
    			downloadLogs();
    			closeConversation().then(() => {
    				window.location.pathname = '/'
    			});
    		})
    		return;
    }    
    pushText(message.data,  "left");
    msg += `${agent_id}: ${message.data} ${new Date(Date.now()).toLocaleDateString("en-US") + " " + new Date(Date.now()).toLocaleTimeString("en-US")}\n`
}

function  receipt(e)  {    
    if  (e.detail.evt  !==  "received")  {         return;     }

        
    let  message  =  e.detail.message.data;

        
    for (let  i = 0;  i < receipt_queue.length;  i++)  {        
        if  (receipt_queue[i].querySelector("p").textContent  ==  message)  {            
            receipt_queue[i].className  =  "right";            
            receipt_queue.splice(i,  1);            
            break;        
        }    
    }
}

function  onLoaded()  {    
    rainbowSDK.setVerboseLog(false);    
    rainbowSDK.initialize();
}


let  conversation;
let user_id =  "";
let agent_id = "";
let  receipt_queue  =   [];
let  logs  =   []
let msg = "";
let id = {}
let dialog = document.getElementById("chat-popup")
let open_chat = document.getElementById("chat-open")
    // const valid_tags = ["General Enquiry", "Abdomen", "Back", "Chest", "Ear", "Extremeties", "Head", "Pelvis", "Rectum", "Skin", "Tooth"];
    // If no tag is detected, send them back to index
if (JSON.parse(window.localStorage.getItem("tag")) == null) {
    window.location.pathname = '/';
}
let tag = JSON.parse(window.localStorage.getItem("tag")).data;
// if (tag in valid_tags == false) {
//     window.location.pathname = '/';
// }

const  chat  =  document.createElement("div");
const  content  =  document.createElement("div");
const  send  =  document.createElement("button");
const  end  =  document.createElement("button")
chat.className  =  "chat_content";
content.className  =  "text_box";
content.contentEditable  =  true;
send.className  =  "send_button";
send.textContent  =  "Send";

end.className  =  "end_button";
end.textContent  =  "Exit"
send.disabled  =  true;
end.className  =  "end_button";
end.textContent  =  "✖";
end.title = "End";

const loading = document.querySelector(".loading");

angular.bootstrap(document,   ["sdk"]).get("rainbowSDK");

document.addEventListener(rainbowSDK.RAINBOW_ONLOADED,  onLoaded);
document.addEventListener(rainbowSDK.RAINBOW_ONREADY,  waitConnection);

rainbowSDK.load();
