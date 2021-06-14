//https://developer.mozilla.org/es/docs/Web/API/WebRTC_API/Taking_still_photos
(function () {
  var streaming = false,
    video = document.querySelector("#video"),
    canvas = document.querySelector("#canvas"),
    photo = document.querySelector("#photo"),
    width = 320,
    height = 0;

  navigator.getMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  navigator.getMedia(
    {
      video: true,
      audio: false,
    },
    function (stream) {
      if (navigator.mozGetUserMedia) {
        video.mozSrcObject = stream;
      } else {
        var vendorURL = window.URL || window.webkitURL;
        //video.src = vendorURL.createObjectURL(stream);
        video.srcObject = stream;
      }
      video.play();
    },
    function (err) {
      console.log("An error occured! " + err);
    }
  );

  video.addEventListener(
    "canplay",
    function (ev) {
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth / width);
        video.setAttribute("width", width);
        video.setAttribute("height", height);
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
        streaming = true;
      }
    },
    false
  );

  function takepicture() {
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(video, 0, 0, width, height);
    var data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  //https://codelabs.developers.google.com/codelabs/tensorflowjs-audio-codelab/index.html
  //"zero" to "nine", "up", "down", "left", "right", "go", "stop", "yes", "no", as well as the additional categories of "unknown word" and "background noise"
  let recognizer;

  function predictWord() {
    // Array of words that the recognizer is trained to recognize.
    const words = recognizer.wordLabels();
    recognizer.listen(
      ({ scores }) => {
        // Turn scores into a list of (score,word) pairs.
        scores = Array.from(scores).map((s, i) => ({
          score: s,
          word: words[i],
        }));
        // Find the most probable word.
        scores.sort((s1, s2) => s2.score - s1.score);

        let x = "";
        switch (scores[0].word) {
          case "one":
            x = "1️⃣";
            break;
          case "two":
            x = "2️⃣";
            break;
          case "three":
            x = "😁";
            takepicture();
            break;
          default:
            document.querySelector("#counter").textContent = x;
        }
      },
      { probabilityThreshold: 0.75 }
    );
  }

  async function app() {
    recognizer = speechCommands.create("BROWSER_FFT");
    await recognizer.ensureModelLoaded();
    predictWord();
    let element = document.getElementById("loader");
    element.classList.add("hide-loader");
    document.getElementById("title").innerHTML =
      "Count until three to take a photo! 📷";
  }

  app();
})();
