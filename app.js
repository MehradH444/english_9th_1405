// متغیرهای عمومی برنامه
let appData = null;
let currentFlashcardIndex = 0;
let isCardFlipped = false;
let flashcardWords = [];

// بارگذاری اولیه داده‌ها از data.json یا LocalStorage
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        const savedData = localStorage.getItem('english_9th_master_db');
        if (savedData) {
            appData = JSON.parse(savedData);
        } else {
            const response = await fetch('data.json');
            appData = await response.json();
            localStorage.setItem('english_9th_master_db', JSON.stringify(appData));
        }

        renderGuide();
        renderLessons();
        renderVerbs();
        renderSynonymsAntonyms();
        renderTips();
        initFlashcards();
        initExam();
    } catch (error) {
        console.error('خطا در بارگذاری پایگاه داده:', error);
    }
}

// 1. تغییر تب‌ها
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// 2. تغییر حالت شب / روز
function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

// 3. رندر بخش راهنمای مطالعه و نقشه دروس
function renderGuide() {
    const stepsContainer = document.getElementById('guideSteps');
    const planContainer = document.getElementById('weeklyPlan');
    
    if (stepsContainer && appData.study_guide) {
        stepsContainer.innerHTML = appData.study_guide.steps.map(step => `<li>${step}</li>`).join('');
    }

    if (planContainer && appData.study_guide) {
        planContainer.innerHTML = appData.study_guide.weekly_plan.map(item => `
            <tr>
                <td><b>${item.day}</b></td>
                <td>${item.task}</td>
            </tr>
        `).join('');
    }
}

// 4. رندر محتوای کامل ۶ درس
function renderLessons() {
    const container = document.getElementById('lessonsContainer');
    if (!container || !appData.lessons) return;

    container.innerHTML = appData.lessons.map(lesson => {
        const vocabRows = lesson.vocabulary.map(v => `
            <tr>
                <td>
                    <b>${v.word}</b> 
                    <button class="btn-sound" onclick="speakText('${v.word}')">🔊</button>
                    <br><small style="color:var(--text-muted);">${v.part_of_speech}</small>
                </td>
                <td>${v.translation}</td>
                <td><span class="badge">${v.synonyms.join(', ') || '-'}</span></td>
                <td><span class="badge badge-danger">${v.antonyms.join(', ') || '-'}</span></td>
                <td>
                    <b>${v.example}</b><br>
                    <small style="color:var(--text-muted);">${v.example_persian}</small>
                </td>
            </tr>
        `).join('');

        const grammarItems = lesson.grammar.map(g => `
            <div style="background: rgba(99, 102, 241, 0.08); padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                <h4 style="margin:0 0 8px 0; color:var(--primary);">${g.topic}</h4>
                <p style="margin:0 0 5px 0;"><b>فرمول:</b> <code>${g.formula}</code></p>
                <p style="margin:0 0 5px 0;">${g.explanation}</p>
                <small>مثال‌ها: ${g.examples.join(' | ')}</small>
            </div>
        `).join('');

        const convRows = lesson.conversation.map(c => `
            <p><b>${c.speaker}:</b> ${c.english}<br><small style="color:var(--text-muted);">${c.persian}</small></p>
        `).join('');

        return `
            <div class="card lesson-card-item">
                <h2 style="color:var(--primary); margin-top:0;">درس ${lesson.lesson_number}: ${lesson.title} (${lesson.persian_title})</h2>
                <p style="color:var(--text-muted);"><b>هدف درس:</b> ${lesson.objective}</p>
                
                <h3>📖 واژگان کاربردی و نمونه جملات</h3>
                <table>
                    <thead>
                        <tr>
                            <th>واژه انگلیسی</th>
                            <th>معنی فارسی</th>
                            <th>مترادف</th>
                            <th>متضاد</th>
                            <th>مثال و ترجمه</th>
                        </tr>
                    </thead>
                    <tbody>${vocabRows}</tbody>
                </table>

                <h3 style="margin-top:25px;">💡 دستور زبان و نکته‌های امتحانی</h3>
                ${grammarItems}

                <h3 style="margin-top:25px;">💬 مکالمه تمرینی</h3>
                <div style="background:var(--surface); padding:15px; border-radius:12px;">${convRows}</div>

                <h3 style="margin-top:25px;">📄 متن کوتاه و ترجمه آموزشی</h3>
                <div style="background:var(--surface); padding:15px; border-radius:12px;">
                    <p style="font-size:16px;"><b>${lesson.reading.text_english}</b></p>
                    <p style="color:var(--text-muted);">${lesson.reading.text_persian}</p>
                </div>
            </div>
        `;
    }).join('');
}

// 5. جستجوی زنده در دروس
function filterLessons() {
    const query = document.getElementById('lessonSearch').value.toLowerCase();
    document.querySelectorAll('.lesson-card-item').forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(query) ? 'block' : 'none';
    });
}

// 6. رندر جدول افعال بی‌قاعده
function renderVerbs() {
    const tbody = document.getElementById('verbsTableBody');
    if (!tbody || !appData.irregular_verbs) return;

    tbody.innerHTML = appData.irregular_verbs.map(v => `
        <tr>
            <td><b>${v.base}</b> <button class="btn-sound" onclick="speakText('${v.base}')">🔊</button></td>
            <td>${v.past}</td>
            <td>${v.pp}</td>
            <td>${v.translation}</td>
        </tr>
    `).join('');
}

function filterVerbs() {
    const query = document.getElementById('verbSearch').value.toLowerCase();
    document.querySelectorAll('#verbsTableBody tr').forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(query) ? '' : 'none';
    });
}

// 7. رندر جدول مترادف‌ها و متضادهای پرکاربرد
function renderSynonymsAntonyms() {
    const container = document.getElementById('synAntContainer');
    if (!container || !appData.synonyms_and_antonyms) return;

    container.innerHTML = appData.synonyms_and_antonyms.map(item => `
        <tr>
            <td><b>${item.word1}</b></td>
            <td><span class="${item.type === 'synonym' ? 'badge' : 'badge badge-danger'}">${item.type === 'synonym' ? '=' : '≠'} ${item.word2}</span></td>
            <td>${item.meaning}</td>
        </tr>
    `).join('');
}

// 8. رندر نکته‌های طلایی امتحان
function renderTips() {
    const container = document.getElementById('goldenTipsContainer');
    if (!container || !appData.golden_exam_tips) return;

    container.innerHTML = appData.golden_exam_tips.map(tip => `
        <div style="background: rgba(245, 158, 11, 0.1); border-right: 4px solid var(--warning); padding: 12px 18px; margin-bottom: 10px; border-radius: 8px;">
            📌 ${tip}
        </div>
    `).join('');
}

// 9. سیستم فلش‌کارت سه‌بعدی
function initFlashcards() {
    flashcardWords = [];
    if (!appData || !appData.lessons) return;

    appData.lessons.forEach(l => l.vocabulary.forEach(v => flashcardWords.push(v)));
    currentFlashcardIndex = 0;
    showFlashcard();
}

function showFlashcard() {
    isCardFlipped = false;
    const card3d = document.getElementById('flashcard3d');
    if (card3d) card3d.classList.remove('is-flipped');

    if (flashcardWords.length > 0) {
        const item = flashcardWords[currentFlashcardIndex];
        document.getElementById('cardFrontText').innerText = item.word;
        document.getElementById('cardBackText').innerText = item.translation;
        document.getElementById('cardBackDetails').innerText = `مثال: ${item.example} (${item.example_persian})`;
    }
}

function flipCard() {
    isCardFlipped = !isCardFlipped;
    document.getElementById('flashcard3d').classList.toggle('is-flipped');
}

function nextCard() {
    currentFlashcardIndex = (currentFlashcardIndex + 1) % flashcardWords.length;
    showFlashcard();
}

function prevCard() {
    currentFlashcardIndex = (currentFlashcardIndex - 1 + flashcardWords.length) % flashcardWords.length;
    showFlashcard();
}

function speakCurrentWord() {
    if (flashcardWords.length > 0) {
        speakText(flashcardWords[currentFlashcardIndex].word);
    }
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    }
}

// 10. سیستم آزمون جامع ۲۸ سوالی کامل
function initExam() {
    const form = document.getElementById('examForm');
    if (!form || !appData.exam_questions) return;

    form.innerHTML = appData.exam_questions.map((q, idx) => `
        <div style="margin-bottom: 20px; padding: 20px; border: 1px solid var(--border-color); border-radius: 14px; background: var(--surface);">
            <p style="font-weight:bold; margin-top:0; font-size:16px;">${q.question} <span class="badge" style="float:left;">${q.section}</span></p>
            ${q.options.map((opt, oIdx) => `
                <label style="display:block; margin-bottom:8px; cursor:pointer;">
                    <input type="radio" name="q${idx}" value="${oIdx}"> ${opt}
                </label>
            `).join('')}
        </div>
    `).join('') + `<button type="button" class="btn btn-success" onclick="checkExamResult()">ثبت آزمون و دریافت نمره و پاسخ‌نامه تشریحی</button>`;
}

function checkExamResult() {
    let score = 0;
    const questions = appData.exam_questions;
    
    questions.forEach((q, idx) => {
        const selected = document.querySelector(`input[name="q${idx}"]:checked`);
        if (selected && parseInt(selected.value) === q.correct) {
            score++;
        }
    });

    const resultDiv = document.getElementById('examResult');
    resultDiv.style.display = 'block';
    
    const explanations = questions.map(q => `
        <li><b>سوال ${q.id}:</b> ${q.explanation}</li>
    `).join('');

    resultDiv.innerHTML = `
        <h3 style="color:var(--primary); margin-top:0;">نتیجه آزمون شما:</h3>
        <h2>نمره نهایی: ${score} از ${questions.length} (درصد: ${Math.round((score / questions.length) * 100)}%)</h2>
        <hr style="border-color:var(--border-color);">
        <h4>پاسخ‌نامه تشریحی کامل:</h4>
        <ul>${explanations}</ul>
    `;
}

// 11. پنل مدیریت (افزودن واژه و بازنشانی)
function addWordAdmin() {
    const lessonIdx = document.getElementById('adminLessonSelect').value;
    const word = document.getElementById('addWord').value;
    const translation = document.getElementById('addTrans').value;
    const syn = document.getElementById('addSyn').value || '-';
    const ant = document.getElementById('addAnt').value || '-';

    if (!word || !translation) {
        alert('لطفاً حداقل واژه و معنی فارسی را وارد کنید!');
        return;
    }

    appData.lessons[lessonIdx].vocabulary.push({
        word: word,
        translation: translation,
        synonyms: [syn],
        antonyms: [ant],
        part_of_speech: "Word",
        example: `${word} is added via admin panel.`,
        example_persian: "این کلمه از پنل مدیریت اضافه شده است."
    });

    localStorage.setItem('english_9th_master_db', JSON.stringify(appData));
    renderLessons();
    initFlashcards();
    alert('واژه جدید با موفقیت به پایگاه داده اضافه شد!');
    
    document.getElementById('addWord').value = '';
    document.getElementById('addTrans').value = '';
}

function resetFactory() {
    if (confirm('آیا مطمئن هستید که می‌خواهید همه چیز به حالت اول کارخانه بازگردد؟')) {
        localStorage.removeItem('english_9th_master_db');
        location.reload();
    }
}
