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
    ":" +
    d.getMilliseconds();
  return d;
}

function messagesManage(message) {
  localStorage.setItem(
    "msg" + (localStorage.length + 1),
    getFormattedDate() + " " + message
  );
  document.getElementById("controls_messages").textContent = message;
}

function detectOutsideAnim(x, y) {
  let width = canvas.width;
  let height = canvas.height;
  let radiuss = Number.parseInt(radius);
  if (
    x + radiuss < 0 ||
    y - radiuss > height ||
    x - radiuss > width ||
    y + radiuss < 0
  ) {
    messagesManage(msgOutOfBorder);
    return true;
  }
  return false;
}

function detectCollision(x, y) {
  let width = canvas.width;
  let height = canvas.height;
  let radiuss = Number.parseInt(radius);
  if (
    (x + radiuss >= 0 && x - radiuss <= 0) ||
    (y - radiuss <= height && y + radiuss >= height) ||
    (x - radiuss <= width && x + radiuss >= width) ||
    (y + radiuss >= 0 && y - radiuss <= 0)
  ) {
    messagesManage(msgCollision);
    return true;
  }
  return false;
}

function drawCircle(arcX, arcY, canvas) {
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.fillStyle = ballColor;
  ctx.arc(arcX, arcY, Number.parseInt(radius), 0, Math.PI * 2);
  ctx.fill();
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

  let canvas = document.createElement("canvas");
  canvas.id = "canvas";
  canvas.style.position = "absolute";
  canvas.style.bottom = "0";
  canvas.style.borderColor = `${borderColor}`;
  canvas.style.borderWidth = `${borderWidth}px`;
  canvas.style.borderStyle = "solid";
  canvas.style.backgroundImage = `url(${texturePath})`;
  canvas.style.backgroundRepeat = "repeat";

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
  work.appendChild(controls);
  work.appendChild(canvas);

  item5.appendChild(work);

  canvas.width = work.offsetWidth - 10;
  canvas.height = work.offsetHeight - 50;
  drawCircle(canvas.width / 2, canvas.height / 2, canvas);
  x = canvas.width / 2;
  y = canvas.height / 2;

  messagesManage(msgPlay);
}

let x;
let y;

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
  let canvas = document.getElementById("canvas");

  function makeMove(direction, currentStep, step, canvas, x, y) {
    setTimeout(() => {
      switch (direction) {
        case "l":
          x -= currentStep;
          drawCircle(x, y, canvas);
          break;
        case "b":
          y += currentStep;
          drawCircle(x, y, canvas);
          break;
        case "r":
          x += currentStep;
          drawCircle(x, y, canvas);
          break;
        case "t":
          y -= currentStep;
          drawCircle(x, y, canvas);
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
      if (detectCollision(x, y)) {
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
      if (
        !detectOutsideAnim(x, y) &&
        document.getElementById("btnStart") == null
      )
        makeMove(direction, currentStep + step, step, canvas, x, y);
    }, 250);
  }
  makeMove(direction, currentStep, Number.parseInt(step), canvas, x, y);
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

  let canvas = document.getElementById("canvas");
  drawCircle(canvas.offsetWidth / 2, canvas.offsetHeight / 2, canvas);
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