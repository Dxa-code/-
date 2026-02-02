// A quick test to see if the file is even loading
console.log("Script loaded successfully!");

// 1. YOUR FIREBASE KEYS
const firebaseConfig = {
  apiKey: "AIzaSyC9i027GEm5rNxWSE4Xk4KZU972SW30goc",
  authDomain: "feedback-hub-e321e.firebaseapp.com",
  projectId: "feedback-hub-e321e",
  storageBucket: "feedback-hub-e321e.firebasestorage.app",
  messagingSenderId: "839743456358",
  appId: "1:839743456358:web:c11dc87b1f614868e519a7"
};

// 2. INITIALIZE
// Note: We use 'firebase.initializeApp' because of your HTML script tags
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// 3. ELEMENTS
const suggestBtn = document.getElementById('submitBtn');
const suggestInput = document.getElementById('suggestInput');
const suggestionList = document.getElementById('suggestionList');
const problemBtn = document.getElementById('submitProblemBtn');
const problemInput = document.getElementById('problemInput');
const problemList = document.getElementById('problemList');

// 4. SEND SUGGESTION
suggestBtn.addEventListener('click', function() {
    const val = suggestInput.value.trim();
    if (val !== "") {
        db.collection("suggestions").add({
            text: val,
            score: 0,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            suggestInput.value = "";
            console.log("Suggestion saved!");
        })
        .catch((error) => {
            alert("Firebase Error: " + error.message);
        });
    } else {
        alert("يرجى كتابة اقتراح أولاً");
    }
});

// 5. SEND PROBLEM
problemBtn.addEventListener('click', function() {
    const val = problemInput.value.trim();
    if (val !== "") {
        db.collection("problems").add({
            text: val,
            comments: [],
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            problemInput.value = "";
            console.log("Problem saved!");
        })
        .catch((error) => {
            alert("Firebase Error: " + error.message);
        });
    } else {
        alert("يرجى وصف المشكلة أولاً");
    }
});

// 6. LIVE LISTENERS (This brings data to your screen)
db.collection("suggestions").orderBy("score", "desc").onSnapshot((snapshot) => {
    suggestionList.innerHTML = '';
    snapshot.forEach((doc) => {
        const item = doc.data();
        const id = doc.id;
        const hasVoted = localStorage.getItem('voted_' + id);
        const div = document.createElement('div');
        div.className = 'suggestion-card';
        div.innerHTML = `
            <div>
                <p>${item.text}</p>
                <button class="delete-btn" onclick="deleteDoc('suggestions', '${id}')">حذف</button>
            </div>
            <div class="vote-controls">
                <button ${hasVoted ? 'disabled' : ''} onclick="vote('${id}', 1)">مؤيد</button>
                <strong class="score">${item.score || 0}</strong>
                <button ${hasVoted ? 'disabled' : ''} onclick="vote('${id}', -1)">غير مؤيد</button>
            </div>`;
        suggestionList.appendChild(div);
    });
});

db.collection("problems").onSnapshot((snapshot) => {
    problemList.innerHTML = '';
    snapshot.forEach((doc) => {
        const prob = doc.data();
        const id = doc.id;
        let commentsHTML = (prob.comments || []).map(c => `<div class="comment">${c}</div>`).join('');
        const div = document.createElement('div');
        div.className = 'problem-card';
        div.innerHTML = `
            <div>
                <strong>المشكلة:</strong> <p>${prob.text}</p>
                <button class="delete-btn" onclick="deleteDoc('problems', '${id}')">حذف</button>
            </div>
            <div class="comment-section">
                ${commentsHTML}
                <div class="comment-input-area">
                    <input type="text" id="pc-${id}" placeholder="اكتب حلاً...">
                    <button onclick="addComment('${id}')">رد</button>
                </div>
            </div>`;
        problemList.appendChild(div);
    });
});

// 7. VOTING & COMMENTS
window.vote = (id, val) => {
    if (localStorage.getItem('voted_' + id)) return;
    db.collection("suggestions").doc(id).update({
        score: firebase.firestore.FieldValue.increment(val)
    }).then(() => {
        localStorage.setItem('voted_' + id, true);
    });
};

window.addComment = (id) => {
    const input = document.getElementById(`pc-${id}`);
    if (input.value.trim() !== "") {
        db.collection("problems").doc(id).update({
            comments: firebase.firestore.FieldValue.arrayUnion(input.value)
        }).then(() => { input.value = ""; });
    }
};

window.deleteDoc = (col, id) => {
    if (confirm("هل أنت متأكد؟")) {
        db.collection(col).doc(id).delete();
    }
};