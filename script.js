// const firebaseConfig = {
// Add your firebase config here
// apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
// authDomain: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
// projectId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
// storageBucket: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
// messagingSenderId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
// appId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
// measurementId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
// };

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWTT4PlhF3A6XEkwxaVHaWHjf8UZKmjhE",
  authDomain: "file-share-1a19c.firebaseapp.com",
  projectId: "file-share-1a19c",
  storageBucket: "gs://file-share-1a19c.appspot.com",
  messagingSenderId: "898539445655",
  appId: "1:898539445655:web:5bf4f4bc49b80d70d138d2",
  measurementId: "G-YHRL4BKENH"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference messages collection
var messagesRef = firebase.database().ref("image");

// Listen for form submit

function uploadImage() {
  if (document.getElementById("file").value != "") {
    var uploadtext = document.getElementById("upload").innerHTML;
    document.getElementById("upload").innerHTML = "Uploading...";
    var file = document.getElementById("file").files[0];
    var storageRef = firebase.storage().ref("images/" + file.name);
    var uploadTask = storageRef.put(file);
    uploadTask.on(
      "state_changed",
      function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes * 100).toFixed(2);
        console.log("Upload is " + progress + "% done");
        document.getElementById("upload").innerHTML = "Uploading"+" "+progress+"%...";
      },
      function (error) {
        console.log(error.message);
        document.getElementById("upload").innerHTML = "Upload Failed";
      },
      function () {
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          console.log("File available at", downloadURL);
          saveMessage(downloadURL);
          var dis=document.getElementById("link");
          dis.style.display= 'block';
          dis.innerText=downloadURL;
          dis.href=downloadURL;
        });
      }
    );
  } else {
    var uploadtext = document.getElementById("upload").innerHTML;
    document.getElementById("upload").innerHTML = "Please select a file";
    // After 2 sec make it empty
    setTimeout(function () {
      document.getElementById("upload").innerHTML = uploadtext;
    }, 2000);
  }
}



// Save message to firebase
function saveMessage(downloadURL) {
  var newMessageRef = messagesRef.push();
  var unique = createUniquenumber();
  // Hidding recive file div
  var x = document.getElementById("downloadiv");
  x.style.display = "none";
  var showUnique = document.getElementById("ShowUniqueID");
  var shU = document.getElementById("showunique");
  shU.value = unique;
  showUnique.style.display = "none";
  // showUnique.value = unique;
  newMessageRef.set({
    url: downloadURL,
    number: unique,
  });
  document.getElementById("upload").innerHTML = "Upload Successful";
  //Make file input empty
  document.getElementById("file").value = "";
}

function createUniquenumber() {
  // Create a unique 5 digit number for each image which is not in the database field number yet
  var number = Math.floor(10000 + Math.random() * 90000);
  var ref = firebase.database().ref("image");
  ref.on("value", function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var childData = childSnapshot.val();
      if (childData.number == number) {
        createUniquenumber();
      }
    });
  });
  return number;
}

async function showimage() {
  var uniqueId = document.getElementById("unique").value;
  if (uniqueId == "") {
    alert("Unique Id is empty\n Please enter a Unique Id");
    return;
  }
  var ref = firebase.database().ref("image");

  try {
    const snapshot = await ref.once("value");
    snapshot.forEach(function (childSnapshot) {
      var childData = childSnapshot.val();
      if (childData.number == uniqueId) {
        console.log(childData.url);
        window.open(childData.url, "_blank");
        // Delete the image from the database and storage
        ref.child(childSnapshot.key).remove()
          .then(function () {
            var storageRef = firebase.storage().refFromURL(childData.url);
            return storageRef.delete();
          })
          .then(function () {
            console.log("File deleted successfully");
          })
          .catch(function (error) {
            console.error("Error deleting file:", error);
          });
      }
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}


function flesize() {
  var file = document.getElementById("file").files[0];
  // Dont allow file size greater than 100MB
  if (file.size > 100000000) {
    alert(
      "File size is greater than 100MB\n Please select a file less than 100MB"
    );
    document.getElementById("file").value = "";
  }
}
//copy link function
function copyLink(event) {
  // Prevent the default behavior of the link
  event.preventDefault();
  // Get the link text from the inner HTML of the link
  var linkText = document.getElementById("link").innerText;
  // Copy the link text to the clipboard
  navigator.clipboard.writeText(linkText)
    .then(function() {
      // Alert "Link copied" on successful copy
      alert("Link copied");
    })
    .catch(function(error) {
      console.error("Error copying link:", error);
    });
}
// Click on download button when enter is pressed
document.getElementById("unique").addEventListener("keyup", function (event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById("show").click();
  }
});
