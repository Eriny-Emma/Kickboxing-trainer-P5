let video;
let poseNet;
let pose;
let skeleton;
let brain;
let recorder;
let globalinputes;
let poseLabel = " ";
let array = ["S", "D", "G", "H", "K", "L"];
let index = 0;
let startsec;
let messege = "Ready when you are";
let tt = [];
let flag = false;

let img;
function preload() {
  img = loadImage("pics/Q.jpg");
}

function setup() {
  startsec = -1;
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);
  let options = {
    inputs: 34,
    outputs: 6,
    task: "classification",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
  recorder = ml5.neuralNetwork(options);
  const modelInfo = {
    model: "model2/model.json",
    metadata: "model2/model_meta.json",
    weights: "model2/model.weights.bin",
  };
  brain.load(modelInfo, brainLoaded);
}

function keyPressed() {
  if (key == "s") {
    recorder.saveData();
  }
}

function brainLoaded() {
  console.log("pose classification ready!");
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    globalinputes = inputs;
    //console.log(inputs);

    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 200);
  }
}

function gotResult(error, results) {
  //console.log(results);
  // console.log(index);

  if (results && index < 5) {
    if (results[0].confidence > 0.6) {
      if (results[0].label.toUpperCase() == array[index]) {
        // correct pose
        if (poseLabel != results[0].label.toUpperCase()) {
          startsec = millis();
        }
        poseLabel = results[0].label.toUpperCase();
        messege = "correct!";
      } 
      else {
        // wrong pose
        startsec = -1;
        poseLabel = results[0].label.toUpperCase();
        // if Q --> get lower
        // if K --> protect your face
        if (index == 0) {
          // wrong slip or block
          messege = "Get lower";
        } else if (index == 2) {
          // wrong jap
          messege = "Protect your face";
        } else if (index == 4) {
          // wrong kick
          messege = "Adjust yor leg and Protect your face";
        }
      }

      //  console.log(globalinputes);
      // console.log(results[0].label.toUpperCase());
      let INPUT = globalinputes;
      let OUTPUT = [poseLabel];
      recorder.addData(INPUT, OUTPUT);
    }
  }

  //console.log(poseLabel);
  // console.log(index);
  if (startsec > -1 && millis() - startsec >= 3) {
    startsec = -1;
    index += 2;
    append(tt, millis() / 1000);
    console.log(tt);
    if (index == 2) {
      img = loadImage("pics/G.png");
    }
    if (index == 4) {
      img = loadImage("pics/K.png");
    }
    if (index >= 5) {
      img = loadImage("pics/done.jpg");
    }
  }

  classifyPose();
}

function gotPoses(poses) {
  if (poses.length > 0) {
    if (poses[0].pose.keypoints[16].score > 0.1) {
      pose = poses[0].pose;
      skeleton = poses[0].skeleton;
    }
    //   else
    //   {
    //   pose=null;
    // skeleton=null;
    //}
  }
}

function modelLoaded() {
  console.log("poseNet ready");
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 16, 16);
    }
  }
  pop();

  fill(0, 255, 0);
  noStroke();
  textSize(40);
  textAlign(CENTER, CENTER);
  text(messege, width / 2, 30);

  if (index >= 5) {
    image(img, 0, 0, width, height, 0, 0);
  } else {
    image(img, 0, 300, 180, 180, 0, 0);
  }
}
