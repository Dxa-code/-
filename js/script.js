const suggestBtn = document.getElementById('submitBtn');
const suggestInput = document.getElementById('suggestInput');
const suggestionList = document.getElementById('suggestionList');
const problemBtn = document.getElementById('submitProblemBtn');
const problemInput = document.getElementById('problemInput');
const problemList = document.getElementById('problemList');

let suggestions = JSON.parse(localStorage.getItem('hub_suggest_v6')) || [];
let problems = JSON.parse(localStorage.getItem('hub_problems_v6')) || [];
let userVotes = JSON.parse(localStorage.getItem('hub_votes_v6')) || {};

function renderSuggestions() {
    suggestionList.innerHTML = '';
    suggestions.sort((a, b) => b.score - a.score);

    suggestions.forEach((item) => {
        const hasVoted = userVotes[item.id];
        const div = document.createElement('div');
        div.className = 'suggestion-card';
        div.innerHTML = `
            <div>
                <p>${item.text}</p>
                <button class="delete-btn" onclick="deleteItem('suggest', '${item.id}')">حذف</button>
            </div>
            <div class="vote-controls">
                <button ${hasVoted ? 'disabled' : ''} onclick="vote('${item.id}', 1)">مؤيد</button>
                <strong>${item.score}</strong>
                <button ${hasVoted ? 'disabled' : ''} onclick="vote('${item.id}', -1)">غير مؤيد</button>
            </div>`;
        suggestionList.appendChild(div);
    });
}

function renderProblems() {
    problemList.innerHTML = '';
    problems.forEach((prob, index) => {
        const div = document.createElement('div');
        div.className = 'problem-card';
        let comments = prob.comments.map(c => `<div class="comment">${c}</div>`).join('');
        div.innerHTML = `
            <div>
                <strong>المشكلة:</strong> <p>${prob.text}</p>
                <button class="delete-btn" onclick="deleteItem('problem', ${index})">حذف</button>
            </div>
            <div class="comment-section">
                ${comments}
                <div class="comment-input-area">
                    <input type="text" id="pc-${index}" placeholder="اكتب حلاً...">
                    <button onclick="addComment(${index})">رد</button>
                </div>
            </div>`;
        problemList.appendChild(div);
    });
}

window.vote = (id, val) => {
    if (userVotes[id]) return;
    const item = suggestions.find(s => s.id === id);
    if (item) {
        item.score += val;
        userVotes[id] = true;
        save();
    }
};

window.addComment = (index) => {
    const input = document.getElementById(`pc-${index}`);
    if (input.value.trim()) {
        problems[index].comments.push(input.value);
        input.value = '';
        save();
    }
};

suggestBtn.onclick = () => {
    if (suggestInput.value.trim()) {
        const newID = 'id_' + Date.now();
        suggestions.push({ id: newID, text: suggestInput.value, score: 0 });
        suggestInput.value = '';
        save();
    }
};

problemBtn.onclick = () => {
    if (problemInput.value.trim()) {
        problems.push({ text: problemInput.value, comments: [] });
        problemInput.value = '';
        save();
    }
};

window.deleteItem = (type, identifier) => {
    if (confirm("هل أنت متأكد؟")) {
        if (type === 'suggest') suggestions = suggestions.filter(s => s.id !== identifier);
        else problems.splice(identifier, 1);
        save();
    }
};

function save() {
    localStorage.setItem('hub_suggest_v6', JSON.stringify(suggestions));
    localStorage.setItem('hub_problems_v6', JSON.stringify(problems));
    localStorage.setItem('hub_votes_v6', JSON.stringify(userVotes));
    renderSuggestions();
    renderProblems();
}

renderSuggestions();
renderProblems();