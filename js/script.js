const suggestBtn = document.getElementById('submitBtn');
const suggestInput = document.getElementById('suggestInput');
const suggestionList = document.getElementById('suggestionList');

const problemBtn = document.getElementById('submitProblemBtn');
const problemInput = document.getElementById('problemInput');
const problemList = document.getElementById('problemList');

let suggestions = JSON.parse(localStorage.getItem('final_suggest')) || [];
let problems = JSON.parse(localStorage.getItem('final_problems')) || [];

function renderSuggestions() {
    suggestionList.innerHTML = '';
    suggestions.sort((a, b) => b.score - a.score);
    suggestions.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'suggestion-card';
        div.innerHTML = `
            <div>
                <p><strong>Suggestion:</strong><br>${item.text}</p>
                <button class="delete-btn" onclick="deleteItem('suggest', ${index})">Delete</button>
            </div>
            <div class="vote-controls">
                <button onclick="vote(${index}, 1)">▲</button>
                <span>${item.score}</span>
                <button onclick="vote(${index}, -1)">▼</button>
            </div>`;
        suggestionList.appendChild(div);
    });
}

function renderProblems() {
    problemList.innerHTML = '';
    problems.forEach((prob, pIndex) => {
        const div = document.createElement('div');
        div.className = 'problem-card';
        let comments = prob.comments.map(c => `<div class="comment">${c}</div>`).join('');
        div.innerHTML = `
            <div>
                <strong>PROBLEM:</strong> <p>${prob.text}</p>
                <button class="delete-btn" onclick="deleteItem('problem', ${pIndex})">Delete</button>
            </div>
            <div class="comment-section">
                ${comments}
                <div class="comment-input-area">
                    <input type="text" id="pc-${pIndex}" placeholder="Reply with a solution...">
                    <button onclick="addComment(${pIndex})">Reply</button>
                </div>
            </div>`;
        problemList.appendChild(div);
    });
}

window.vote = (index, val) => {
    suggestions[index].score += val;
    save();
};

window.deleteItem = (type, index) => {
    if(confirm("Are you sure you want to remove this?")) {
        if(type === 'suggest') suggestions.splice(index, 1);
        else problems.splice(index, 1);
        save();
    }
};

window.addComment = (index) => {
    const input = document.getElementById(`pc-${index}`);
    if(input.value.trim()) {
        problems[index].comments.push(input.value);
        input.value = '';
        save();
    }
};

suggestBtn.onclick = () => {
    if(suggestInput.value.trim()) {
        suggestions.push({ text: suggestInput.value, score: 0 });
        suggestInput.value = '';
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

function save() {
    localStorage.setItem('final_suggest', JSON.stringify(suggestions));
    localStorage.setItem('final_problems', JSON.stringify(problems));
    renderSuggestions();
    renderProblems();
}

renderSuggestions();
renderProblems();