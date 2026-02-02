// 1. FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyC9i027GEm5rNxWSE4Xk4KZU972SW30goc",
  authDomain: "feedback-hub-e321e.firebaseapp.com",
  projectId: "feedback-hub-e321e",
  storageBucket: "feedback-hub-e321e.firebasestorage.app",
  messagingSenderId: "839743456358",
  appId: "1:839743456358:web:c11dc87b1f614868e519a7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. ELEMENTS
const suggestBtn = document.getElementById('submitBtn');
const suggestInput = document.getElementById('suggestInput');
const suggestionList = document.getElementById('suggestionList');
const problemBtn = document.getElementById('submitProblemBtn');
const problemInput = document.getElementById('problemInput');
const problemList = document.getElementById('problemList');

// 3. LIVE SUGGESTIONS FROM CLOUD
db.collection("suggestions").orderBy("score", "desc").onSnapshot((snapshot) => {
    suggestionList.innerHTML = '';
    snapshot.forEach((doc) => {
        const item = doc.data();
        const id = doc.id;
        // Check local storage only for the "Vote Once" logic
        const hasVoted = localStorage.getItem('voted_' + id);

        const div = document.createElement('div');
        div.className = 'suggestion-card';
        div.innerHTML = `
            <div>
                <p>${item.text}</p>
                <button class="delete-btn" onclick="deleteDoc('suggestions', '${id}')">حذف</button>
            </div>
            <div class="vote-controls">
                <button class="up-btn" ${hasVoted ? 'disabled' : ''} onclick="vote('${id}', 1)">مؤيد</button>
                <strong class="score">${item.score}</strong>
                <button class="down-btn" ${hasVoted ? 'disabled' : ''} onclick="vote('${id}', -1)">غير مؤيد</button>
            </div>`;
        suggestionList.appendChild(div);
    });
});

// 4. LIVE PROBLEMS FROM CLOUD
db.collection("problems").onSnapshot((snapshot) => {
    problemList.innerHTML = '';
    snapshot.forEach((doc) => {
        const prob = doc.data();
        const pId = doc.id;
        let commentsHTML = prob.comments.map(c => `<div class="comment">${c}</div>`).join('');

        const div = document.createElement('div');
        div.className = 'problem-card';
        div.innerHTML = `
            <div>
                <strong>المشكلة:</strong> <p>${prob.text}</p>
                <button class="delete-btn" onclick="deleteDoc('problems', '${pId}')">حذف</button>
            </div>
            <div class="comment-section">
                ${commentsHTML}
                <div class="comment-input-area">
                    <input type="text" id="pc-${pId}" placeholder="اكتب حلاً...">
                    <button onclick="addComment('${pId}')">رد</button>
                </div>
            </div>`;
        problemList.appendChild(div);
    });
});

// 5. FUNCTIONS (SENDING TO CLOUD)
window.vote = (id, val) => {
    if (localStorage.getItem('voted_' + id)) return;
    
    db.collection("suggestions").doc(id).update({
        score: firebase.firestore.FieldValue.increment(val)
    });
    localStorage.setItem('voted_' + id, true);
};

suggestBtn.onclick = () => {
    if (suggestInput.value.trim()) {
        db.collection("suggestions").add({
            text: suggestInput.value,
            score: 0,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        suggestInput.value = '';
    }
};

problemBtn.onclick = () => {
    if (problemInput.value.trim()) {
        db.collection("problems").add({
            text: problemInput.value,
            comments: [],
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        problemInput.value = '';
    }
};

window.addComment = (pId) => {
    const input = document.getElementById(`pc-${pId}`);
    if (input.value.trim()) {
        db.collection("problems").doc(pId).update({
            comments: firebase.firestore.FieldValue.arrayUnion(input.value)
        });
        input.value = '';
    }
};

window.deleteDoc = (collection, id) => {
    if (confirm("هل أنت متأكد؟")) {
        db.collection(collection).doc(id).delete();
    }
};