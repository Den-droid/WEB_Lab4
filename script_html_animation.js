let radius;
let ballColor;
let step;
let borderColor;
let borderWidth;
let texturePath;
let msgPlay;
let msgStop;
let msgStart;
let msgClose;
let msgReload;
let msgCollision = "Ball collided with border";
let msgOutOfBorder = "Ball is out of border";
let oldText;

function readTextFile(file, callback) {
  let rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
  };
  rawFile.send(null);
}

function getJson() {
  readTextFile("data.json", function (text) {
    console.log(text);
    let parsedJson = JSON.parse(text);
    radius = parsedJson["radius"];
    ballColor = parsedJson["ball_color"];
    step = parsedJson["step"];
    borderColor = parsedJson["border_color"];
    borderWidth = parsedJson["border_width"];
    texturePath = parsedJson["filepath"];
    msgPlay = parsedJson["msgPlayButton"];
    msgStop = parsedJson["msgStopButton"];
    msgStart = parsedJson["msgStartButton"];
    msgClose = parsedJson["msgCloseButton"];
    msgReload = parsedJson["msgReloadButton"];
  });
}

function getFormattedDate() {
  let d = new Date();
  d =
    d.getFullYear() +
    "-" +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + d.getDate()).slice(-2) +
    " " +
    ("0" + d.getHours()).slice(-2) +
    ":" +
    ("0" + d.getMinutes()).slice(-2) +
    ":" +
    ("0" + d.getSeconds()).slice(-2) + 
    ":" + d.getMilliseconds();
  return d;
}

function messagesManage(message) {
  localStorage.setItem(
    "msg" + (localStorage.length + 1),
    getFormattedDate() + " " + message
  );
  document.getElementById("controls_messages").textContent = message;
}

function detectOutsideAnim() {
  let circle = document.getElementById("circle");
  let anim = document.getElementById("anim");
  if (
    circle.offsetLeft + circle.offsetWidth < 0 ||
    circle.offsetLeft - circle.offsetWidth > anim.offsetWidth ||
    circle.offsetTop + circle.offsetHeight < 0 ||
    circle.offsetTop - circle.offsetHeight > anim.offsetHeight
  ) {
    messagesManage(msgOutOfBorder);
    return true;
  }
  return false;
}

function detectCollision() {
  let circle = document.getElementById("circle");
  let anim = document.getElementById("anim");
  if (
    (circle.offsetLeft <= 0 && circle.offsetLeft + circle.offsetWidth >= 0) ||
    (circle.offsetLeft >= anim.offsetWidth &&
      circle.offsetLeft - circle.offsetWidth <= anim.offsetWidth) ||
    (circle.offsetTop <= 0 && circle.offsetTop + circle.offsetHeight >= 0) ||
    (circle.offsetTop >= anim.offsetHeight &&
      circle.offsetTop - circle.offsetHeight <= anim.offsetHeight)
  ) {
    messagesManage(msgCollision);
    return true;
  }
  return false;
}

function play() {
  let item5 = document.getElementById("item5");
  let text = document.querySelector("#item5 > p");
  oldText = text.cloneNode(true);
  item5.removeChild(text);

  getJson();

  let work = document.createElement("div");
  work.id = "work";
  work.style.width = "100%";
  work.style.height = "100%";
  work.style.position = "relative";

  let anim = document.createElement("div");
  anim.id = "anim";
  anim.style.width = "calc(100% - 10px)";
  anim.style.height = "calc(100% - 50px)";
  anim.style.position = "absolute";
  anim.style.bottom = "0px";
  anim.style.borderColor = `${borderColor}`;
  anim.style.borderWidth = `${borderWidth}px`;
  anim.style.borderStyle = "solid";
  anim.style.backgroundImage = `url(${texturePath})`;
  anim.style.backgroundRepeat = "repeat";

  let controls = document.createElement("div");
  controls.id = "controls";
  controls.style.position = "relative";

  let controls_buttons = document.createElement("div");
  controls_buttons.id = "controls_buttons";
  controls_buttons.style.position = "absolute";
  controls_buttons.style.top = "0px";
  controls_buttons.style.left = "3%";
  controls_buttons.style.margin = "0";

  let controls_messages = document.createElement("div");
  controls_messages.id = "controls_messages";
  controls_messages.style.position = "absolute";
  controls_messages.style.top = "0px";
  controls_messages.style.right = "3%";
  controls_messages.style.margin = "0";

  let circle = document.createElement("div");
  circle.id = "circle";
  circle.style.width = `${radius * 2}px`;
  circle.style.height = `${radius * 2}px`;
  circle.style.borderRadius = `${radius}px`;
  circle.style.backgroundColor = `${ballColor}`;
  circle.style.position = "absolute";
  circle.style.top = `calc(50% - ${radius}px)`;
  circle.style.left = `calc(50% - ${radius}px)`;

  let btnClose = document.createElement("button");
  btnClose.id = "btnClose";
  btnClose.textContent = "Close";
  btnClose.addEventListener("click", closeAnim);

  let btnStart = document.createElement("button");
  btnStart.id = "btnStart";
  btnStart.textContent = "Start";
  btnStart.addEventListener("click", startAnim);

  controls_buttons.appendChild(btnClose);
  controls_buttons.appendChild(btnStart);
  controls.appendChild(controls_buttons);
  controls.appendChild(controls_messages);
  anim.appendChild(circle);
  work.appendChild(controls);
  work.appendChild(anim);

  item5.appendChild(work);

  messagesManage(msgPlay);
}

function startAnim() {
  messagesManage(msgStart);

  let controls_buttons = document.getElementById("controls_buttons");
  let btnStart = document.getElementById("btnStart");
  controls_buttons.removeChild(btnStart);

  let btnStop = document.createElement("button");
  btnStop.id = "btnStop";
  btnStop.textContent = "Stop";
  btnStop.addEventListener("click", stopAnim);
  controls_buttons.appendChild(btnStop);

  let direction = "l";
  let currentStep = Number.parseInt(step);
  let circle = document.getElementById("circle");
  let left = circle.offsetLeft;
  let top = circle.offsetTop;

  function makeMove(direction, currentStep, step, left, top, circle) {
    setTimeout(() => {
      switch (direction) {
        case "l":
          left -= currentStep;
          circle.style.left = `${left}px`;
          break;
        case "b":
          top += currentStep;
          circle.style.top = `${top}px`;
          break;
        case "r":
          left += currentStep;
          circle.style.left = `${left}px`;
          break;
        case "t":
          top -= currentStep;
          circle.style.top = `${top}px`;
          break;
      }
      switch (direction) {
        case "l":
          direction = "b";
          break;
        case "b":
          direction = "r";
          break;
        case "r":
          direction = "t";
          break;
        case "t":
          direction = "l";
      }
      currentStep += step;
      if (detectCollision()) {
        if (document.getElementById("btnReload") == null) {
          let controls_buttons = document.getElementById("controls_buttons");
          let btnStop = document.getElementById("btnStop");
          controls_buttons.removeChild(btnStop);

          let btnReload = document.createElement("button");
          btnReload.id = "btnReload";
          btnReload.textContent = "Reload";
          btnReload.addEventListener("click", reloadAnim);
          controls_buttons.appendChild(btnReload);
        }
      }
      if (!detectOutsideAnim() && document.getElementById("btnStart") == null)
        makeMove(direction, currentStep + step, step, left, top, circle);
    }, 250);
  }
  makeMove(direction, currentStep, Number.parseInt(step), left, top, circle);
}

function reloadAnim() {
  messagesManage(msgReload);

  let controls_buttons = document.getElementById("controls_buttons");
  let btnReload = document.getElementById("btnReload");
  controls_buttons.removeChild(btnReload);

  let btnStart = document.createElement("button");
  btnStart.id = "btnStart";
  btnStart.textContent = "Start";
  btnStart.addEventListener("click", startAnim);
  controls_buttons.appendChild(btnStart);

  let anim = document.getElementById("anim");
  let circle = document.getElementById("circle");
  let top = anim.offsetHeight / 2 - circle.offsetHeight / 2;
  let left = anim.offsetWidth / 2 - circle.offsetWidth / 2;
  circle.style.top = `${top}px`;
  circle.style.left = `${left}px`;
}

function stopAnim() {
  messagesManage(msgStop);

  let controls_buttons = document.getElementById("controls_buttons");
  let btnStop = document.getElementById("btnStop");
  controls_buttons.removeChild(btnStop);

  let btnStart = document.createElement("button");
  btnStart.id = "btnStart";
  btnStart.textContent = "Start";
  btnStart.addEventListener("click", startAnim);
  controls_buttons.appendChild(btnStart);
}

function closeAnim() {
  messagesManage(msgClose);
  let item5 = document.getElementById("item5");
  let work = document.getElementById("work");
  item5.removeChild(work);
  item5.appendChild(oldText);

  let navmenu = document.getElementById("navmenu");
  let oldList = document.getElementById("showAllMessages");
  if (oldList != null) {
    navmenu.removeChild(oldList);
  }

  let allMessages = document.createElement("ul");
  allMessages.id = "showAllMessages";
  for (let i = 0; i < localStorage.length; i++) {
    let li = document.createElement("li");
    li.appendChild(
      document.createTextNode(localStorage.getItem(`msg${i + 1}`))
    );
    allMessages.appendChild(li);
  }
  navmenu.appendChild(allMessages);

  localStorage.clear();
}

document.getElementById("play").addEventListener("click", play);