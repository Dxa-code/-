const suggestBtn = document.getElementById('submitBtn');
const suggestInput = document.getElementById('suggestInput');
const suggestionList = document.getElementById('suggestionList');
const problemBtn = document.getElementById('submitProblemBtn');
const problemInput = document.getElementById('problemInput');
const problemList = document.getElementById('problemList');

let suggestions = JSON.parse(localStorage.getItem('v4_suggest')) || [];
let problems = JSON.parse(localStorage.getItem('v4_problems')) || [];
// Track what THIS user has voted on
let userVotes = JSON.parse(localStorage.getItem('v4_user_votes')) || {};

function renderSuggestions() {
    suggestionList.innerHTML = '';
    suggestions.sort((a, b) => b.score - a.score);

    suggestions.forEach((item) => {
        const hasVoted = userVotes[item.id]; // Check if user already voted on this ID
        const div = document.createElement('div');
        div.className = 'suggestion-card';
        div.innerHTML = `
            <div>
                <p>${item.text}</p>
                <button class="delete-btn" onclick="deleteItem('suggest', '${item.id}')">حذف</button>
            </div>
            <div class="vote-controls">
                <button class="up-btn" ${hasVoted ? 'disabled' : ''} onclick="vote('${item.id}', 1)">مؤيد</button>
                <span class="score">${item.score}</span>
                <button class="down-btn" ${hasVoted ? 'disabled' : ''} onclick="vote('${item.id}', -1)">غير مؤيد</button>
            </div>`;
        suggestionList.appendChild(div);
    });
}

window.vote = (id, val) => {
    if (userVotes[id]) return; // Stop if already voted

    const item = suggestions.find(s => s.id === id);
    if (item) {
        item.score += val;
        userVotes[id] = true; // Mark as voted
        save();
    }
};

suggestBtn.onclick = () => {
    if(suggestInput.value.trim()) {
        const newID = 'id_' + Date.now(); // Create unique ID
        suggestions.push({ id: newID, text: suggestInput.value, score: 0 });
        suggestInput.value = '';
        save();
    }
};

// --- Problem & Comment Logic (Stays the same) ---
function renderProblems() {
    problemList.innerHTML = '';
    problems.forEach((prob, pIndex) => {
        const div = document.createElement('div');
        div.className = 'problem-card';
        let comments = prob.comments.map(c => `<div class="comment">${c}</div>`).join('');
        div.innerHTML = `
            <div>
                <strong>المشكلة:</strong> <p>${prob.text}</p>
                <button class="delete-btn" onclick="deleteItem('problem', ${pIndex})">حذف</button>
            </div>
            <div class="comment-section">
                ${comments}
                <div class="comment-input-area">
                    <input type="text" id="pc-${pIndex}" placeholder="اكتب حلاً...">
                    <button onclick="addComment(${pIndex})">رد</button>
                </div>
            </div>`;
        problemList.appendChild(div);
    });
}

window.addComment = (index) => {
    const input = document.getElementById(`pc-${index}`);
    if(input.value.trim()) {
        problems[index].comments.push(input.value);
        input.value = '';
        save();
    }
};

problemBtn.onclick = () => {
    if(problemInput.value.trim()) {
        problems.push({ text: problemInput.value, comments: [] });
        problemInput.value = '';
        save();
    }
};

window.deleteItem = (type, identifier) => {
    if(confirm("هل أنت متأكد؟")) {
        if(type === 'suggest') {
            suggestions = suggestions.filter(s => s.id !== identifier);
        } else {
            problems.splice(identifier, 1);
        }
        save();
    }
};

function save() {
    localStorage.setItem('v4_suggest', JSON.stringify(suggestions));
    localStorage.setItem('v4_problems', JSON.stringify(problems));
    localStorage.setItem('v4_user_votes', JSON.stringify(userVotes));
    renderSuggestions();
    renderProblems();
}

renderSuggestions();
renderProblems();