
        const firebaseConfig = {
            apiKey: "AIzaSyBOVl1hdmprJXpgdN_sNTO3FsNePD_zNZY",
            authDomain: "aahes-cee-cutoffs.firebaseapp.com",
            projectId: "aahes-cee-cutoffs"
        };
        let db = null;
        try { firebase.initializeApp(firebaseConfig); db = firebase.firestore(); } catch (e) { db = null; console.warn('firebase not configured', e); }

        // DOM refs
        const appEl = document.getElementById('app');
        const loginScreen = document.getElementById('login-screen');
        const loginUsername = document.getElementById('login-username');
        const loginPassword = document.getElementById('login-password');
        const loginBtn = document.getElementById('login-btn');
        const loginError = document.getElementById('login-error');

        const qno = document.getElementById('qno');
        const questionEl = document.getElementById('question');
        const optionsEl = document.getElementById('options');
        const qtime = document.getElementById('qtime');
        const qstatus = document.getElementById('qstatus');
        const globalTimer = document.getElementById('global-timer');

        // user badge DOM refs (new)
        const userBadge = document.getElementById('user-badge');
        const userNameEl = document.getElementById('user-name');
        const userAvatarEl = document.getElementById('user-avatar');

        const openStart = document.getElementById('open-start');
        const startModal = document.getElementById('start-modal');
        const mocksContainer = document.getElementById('mocks-container');
        const closeMocks = document.getElementById('close-mocks');

        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const markReviewBtn = document.getElementById('mark-review');
        const submitBtn = document.getElementById('submit-btn');
        // CLEAR button ref
        const clearBtn = document.getElementById('clear-btn');

        const resultsBtn = document.getElementById('results-btn');
        const logoutBtn = document.getElementById('logout-btn');

        const historyOverlay = document.getElementById('history-overlay');
        const historyGrid = document.getElementById('history-grid');
        const closeHistory = document.getElementById('close-history');

        const detailOverlay = document.getElementById('detail-overlay');
        const closeDetail = document.getElementById('close-detail');

        // Confirm modal refs
        const confirmModal = document.getElementById('confirm-submit-modal');
        const confirmAttempted = document.getElementById('confirm-attempted');
        const confirmLeft = document.getElementById('confirm-left');
        const confirmRemaining = document.getElementById('confirm-remaining');
        const confirmYes = document.getElementById('confirm-submit-yes');
        const confirmNo = document.getElementById('confirm-submit-no');

        // state
        let questions = [];
        let responses = [];
        let current = 0;
        let questionTimers = [];
        let startTime = null;
        let globalTimerInterval = null;
        let testStarted = false;
        let autoSubmitTimer = null; // kept for compatibility (not used for countdown auto-submit)
        let submittedAlready = false;
        let currentUser = null;
        let mocksList = [];
        let currentMockId = null;
        let sectionMap = null;
        let totalDurationSec = 0; // <-- total test duration in seconds (used for countdown)

        // utilities
        function fmtH(sec) { const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; }
        function fmtMS(sec) { const m = Math.floor(sec / 60), s = sec % 60; return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; }
        function letterToIndex(letter) {
            if (letter == null) return null;
            const l = String(letter).trim().toUpperCase();
            if (l === 'A') return 0; if (l === 'B') return 1; if (l === 'C') return 2; if (l === 'D') return 3;
            return null;
        }

        function normalizeImgUrl(u) {
            if (!u) return null;
            const s = String(u).trim();
            if (!s) return null;
            if (/^https?:\/\//i.test(s)) return s;
            if (/^\/\//.test(s)) return location.protocol + s;
            if (s.startsWith('/')) return s;
            return './' + s.replace(/^\.?\//, '');
        }

        function findImageFromDoc(obj) {
            if (!obj) return null;
            const keys = ['img', 'image', 'imageUrl', 'image_url', 'image_link', 'imageLink', 'img_p', 'img_p1', 'img1', 'url', 'link'];
            for (const k of keys) {
                if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null && String(obj[k]).trim() !== '') return normalizeImgUrl(obj[k]);
            }
            for (const k of Object.keys(obj)) {
                if (/img/i.test(k) || /image/i.test(k)) {
                    const v = obj[k];
                    if (v && String(v).trim() !== '') return normalizeImgUrl(v);
                }
            }
            return null;
        }

        function sampleBank() {
            const secs = ['Physics', 'Chemistry', 'Mathematics']; const out = [];
            secs.forEach(sec => { for (let i = 1; i <= 20; i++) { out.push({ id: sec[0] + i, section: sec, text: `Sample ${sec} question ${i}`, options: ['A', 'B', 'C', 'D'], answerIndex: Math.floor(Math.random() * 4), img: null }); } });
            return out;
        }

        function escapeHtml(str) { if (!str) return ''; return String(str).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }

        // new helper: format Date (date-only). Handles Firestore Timestamp and ISO/string fallback
        function formatDateOnly(field) {
            if (!field) return '-';
            try {
                // Firestore Timestamp object
                if (field.toDate && typeof field.toDate === 'function') {
                    const d = field.toDate();
                    return d.toLocaleDateString();
                }
                // ISO string or Date-like
                const dt = new Date(field);
                if (!isNaN(dt.getTime())) return dt.toLocaleDateString();
                // fallback to raw string trimmed (show only date part if includes T)
                const s = String(field);
                if (s.indexOf('T') > 0) return s.split('T')[0];
                return s;
            } catch (e) {
                return String(field);
            }
        }

        function findSyllabusFromDoc(m) {
            // Try several common fields
            if (!m) return '';
            return (m.syllabus || m.syl || m.desc || m.description || m.notes || '');
        }

        // UI init
        appEl.setAttribute('aria-hidden', 'true');
        loginScreen.style.display = 'flex';
        // ensure badge hidden by default
        userBadge.style.display = 'none';
        userNameEl.textContent = 'Not signed in';
        userAvatarEl.textContent = 'P';
        globalTimer.textContent = '00:00:00';

        // login (no guest/demo option)
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
            loginError.textContent = '';

            const u = (loginUsername.value || '').trim();
            const p = (loginPassword.value || '');

            if (!u || !p) {
                loginError.textContent = 'enter credentials';
                return;
            }

            if (!db) {
                loginError.textContent = 'db not configured';
                return;
            }

            loginError.textContent = 'checking...';

            try {
                const snap = await db
                    .collection('users')
                    .where('username', '==', u)
                    .limit(1)
                    .get();

                if (snap.empty) {
                    loginError.textContent = 'user not found';
                    return;
                }

                const data = snap.docs[0].data();

                if (String(data.password) !== String(p)) {
                    loginError.textContent = 'invalid password';
                    return;
                }

                // ✅ set current user with subscription
                currentUser = {
                    username: data.username || u,
                    name: data.name || u,
                    subscription: (data.subscription || '').toLowerCase()
                };

                // ✅ apply logo / branding based on subscription
                applySubscriptionBranding(currentUser.subscription);

                onLoggedIn();

            } catch (e) {
                console.error(e);
                loginError.textContent = 'login failed';
            }
        });

        function onLoggedIn() {
            // show attractive badge
            userNameEl.textContent = currentUser.name || currentUser.username || 'User';
            userAvatarEl.textContent = (currentUser.name && currentUser.name[0]) ? currentUser.name[0].toUpperCase() : (currentUser.username ? currentUser.username[0].toUpperCase() : 'U');
            userBadge.style.display = 'flex';

            // hide login, show app controls
            loginScreen.style.display = 'none';
            appEl.setAttribute('aria-hidden', 'false');
            resultsBtn.style.display = 'inline-block';
            openStart.style.display = 'inline-block';
            logoutBtn.style.display = 'inline-block';
            loadMocks();
        }

        logoutBtn.addEventListener('click', () => {
            if (testStarted && !submittedAlready && !confirm('Discard running test?')) return;
            currentUser = null;
            applySubscriptionBranding(null);
            userBadge.style.display = 'none';
            userNameEl.textContent = 'Not signed in';
            userAvatarEl.textContent = 'P';
            openStart.style.display = 'inline-block'; resultsBtn.style.display = 'none'; openStart.style.display = 'none'; logoutBtn.style.display = 'none';
            testStarted = false; submittedAlready = false; if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
            stopGlobalTimer();
            totalDurationSec = 0;
            globalTimer.textContent = '00:00:00';
            questions = sampleBank(); responses = questions.map(() => ({ choiceIndex: null, marked: false, timeUsed: 0, viewed: false })); questionTimers = questions.map(() => null); current = 0; renderQuestion(); renderPicker('Physics');
            loginScreen.style.display = 'flex';
            appEl.setAttribute('aria-hidden', 'true');
            currentMockId = null;
        });

        /* ========== mocks ========== */
        async function hasAttempted(mockId) {
            if (!db || !currentUser) return false;
            try {
                const snap = await db.collection('res')
                    .where('username', '==', currentUser.username)
                    .where('mockId', '==', mockId)
                    .limit(1)
                    .get();
                return !snap.empty;
            } catch (e) { console.warn('hasAttempted failed', e); return false; }
        }

        async function loadMocks() {
            mocksContainer.innerHTML = `<div style="padding:8px;color:${getComputedStyle(document.documentElement).getPropertyValue('--muted') || '#666'}">Loading...</div>`;
            if (!db) {
                mocksList = [
                    {
                        id: 'local-1', name: 'Mock 1', time: '120', qns: '60', syllabus: 'Full CEE', active: 'yes', date: new Date().toISOString(),
                        img_p1: 'https://via.placeholder.com/600x360?text=P1', ans_p1: 'A',
                        img_c1: 'https://via.placeholder.com/600x360?text=C1', ans_c1: 'B',
                        img_m1: 'https://via.placeholder.com/600x360?text=M1', ans_m1: 'C'
                    },
                    { id: 'local-2', name: 'Mock 2 (Archived)', time: '90', qns: '30', syllabus: 'Physics only', active: 'no', date: null }
                ];
                await renderMocks();
                return;
            }
            try {
                const snap = await db.collection('mocks').orderBy('name').get();

                const userSub = (currentUser?.subscription || '').toLowerCase();

                mocksList = snap.docs
                    .map(d => Object.assign({ id: d.id }, d.data()))
                    .filter(m => {
                        const mockSub = (m.subscription || '').toLowerCase();
                        return mockSub === userSub;
                    });

            } catch (e) { console.warn(e); mocksList = [{ id: 'err', name: 'No mocks', syllabus: 'See console', active: 'no' }]; }
            await renderMocks();
        }

        async function renderMocks() {
            mocksContainer.innerHTML = '';
            for (const m of mocksList) {
                const isActive = (typeof m.active === 'string') ? (m.active.toLowerCase() === 'yes' || m.active.toLowerCase() === 'true') : !!m.active;
                let attempted = false;
                if (currentUser && db) {
                    try { attempted = await hasAttempted(m.id); } catch (e) { attempted = false; }
                }

                const card = document.createElement('div');
                card.className = 'mock-card' + ((!isActive || attempted) ? ' inactive' : '');

                // compute display values
                const durationText = m.duration || m.time || '-';
                const qCountText = m.questionCount || m.qns || '-';
                // syllabus: check common fields (syl, syllabus, desc)
                const syllabusText = escapeHtml(findSyllabusFromDoc(m));
                // date-only formatting helper (handles Firestore Timestamp)
                const dateText = (m.date) ? escapeHtml(formatDateOnly(m.date)) : '-';

                // Show name, duration & qns, then add date (date only) and syllabus on the card
                card.innerHTML = `
          <div style="font-weight:800">${escapeHtml(m.name || m.id)}</div>
          <div style="font-size:12px;color:${getComputedStyle(document.documentElement).getPropertyValue('--muted') || '#666'}">
            ${durationText} min • ${qCountText} Qs
          </div>
          <div style="font-size:12px;margin-top:6px;color:#222"><strong>Date:</strong> ${dateText}</div>
          <div style="font-size:12px;margin-top:6px;color:#222"><strong>Syllabus:</strong> ${syllabusText || '-'}</div>
        `;

                const btn = document.createElement('button');
                btn.style.marginTop = '8px';

                if (!isActive) {
                    btn.className = 'btn-secondary';
                    btn.textContent = 'Not available';
                    btn.disabled = true;
                } else if (attempted) {
                    btn.className = 'btn-secondary';
                    btn.textContent = 'Attempted';
                    btn.disabled = true;
                } else {
                    btn.className = 'btn-primary';
                    btn.textContent = 'Start';
                    btn.addEventListener('click', () => { startModal.style.display = 'none'; startMock(m); });
                }

                card.appendChild(btn);

                if (m.active !== undefined || attempted) {
                    const lbl = document.createElement('div');
                    lbl.style.fontSize = '11px';
                    lbl.style.fontWeight = '800';
                    lbl.style.marginTop = '6px';
                    if (attempted) { lbl.style.color = '#b37b4a'; lbl.textContent = 'Attempted'; }
                    else lbl.style.color = isActive ? '#0b9a6b' : '#b37b4a';
                    if (!attempted) lbl.textContent = isActive ? 'Active' : 'Inactive';
                    card.appendChild(lbl);
                }

                mocksContainer.appendChild(card);
            }
        }

        closeMocks.addEventListener('click', () => { startModal.style.display = 'none'; });

        /* ========== start mock ========== */
        async function startMock(mock) {
            if (!mock) return;

            const isActive =
                typeof mock.active === 'string'
                    ? mock.active.toLowerCase() === 'true' || mock.active.toLowerCase() === 'yes'
                    : !!mock.active;

            if (!isActive) {
                alert('This mock is not available.');
                return;
            }

            if (currentUser && db) {
                const already = await hasAttempted(mock.id);
                if (already) {
                    alert('You have already attempted this mock.');
                    await loadMocks();
                    return;
                }
            }

            let built = [];

            /* ======================================================
               1️⃣ TRY SUBCOLLECTION (NO CHANGE – EXISTING LOGIC)
            ====================================================== */
            if (db) {
                try {
                    const snap = await db
                        .collection('mocks')
                        .doc(mock.id)
                        .collection('questions')
                        .orderBy('index')
                        .get();

                    if (!snap.empty) {
                        built = snap.docs.map((d, i) => {
                            const q = d.data();
                            return {
                                id: d.id,
                                section: q.section,
                                text: q.text || null,
                                img: q.img || q.image || q.imageUrl || null,
                                options: ['A', 'B', 'C', 'D'],
                                answerIndex: letterToIndex(q.ans || q.answer || q.correct)
                            };
                        });
                    }
                } catch (e) {
                    console.warn('Subcollection fetch failed', e);
                }
            }

            /* ======================================================
               🔥 2️⃣ NEW: SUPPORT SUBJECT-WISE QUESTIONS OBJECT
               (THIS MATCHES YOUR SCREENSHOT EXACTLY)
            ====================================================== */
            if (!built.length && mock.questions && typeof mock.questions === 'object') {
                const subjects = ['Physics', 'Chemistry', 'Mathematics'];

                subjects.forEach(subject => {
                    const arr = mock.questions[subject];
                    if (Array.isArray(arr)) {
                        arr.forEach((q, i) => {
                            built.push({
                                id: `${subject[0]}${i + 1}`,
                                section: subject,
                                text: null,
                                img: q.img || null,
                                options: ['A', 'B', 'C', 'D'],
                                answerIndex: letterToIndex(q.ans)
                            });
                        });
                    }
                });
            }

            /* ======================================================
               3️⃣ OLD FALLBACK (UNCHANGED)
            ====================================================== */
            if (!built.length) {
                built = sampleBank();
            }

            /* ======================================================
               FINAL NORMALIZATION (UNCHANGED)
            ====================================================== */
            questions = built.map((q, i) => ({
                id: q.id || `Q${i + 1}`,
                section: q.section,
                text: q.text,
                img: normalizeImgUrl(q.img),
                options: q.options || ['A', 'B', 'C', 'D'],
                answerIndex: q.answerIndex
            }));

            // build section map (UNCHANGED)
            sectionMap = {};
            questions.forEach((q, i) => {
                if (!sectionMap[q.section]) sectionMap[q.section] = [];
                sectionMap[q.section].push(i);
            });

            responses = questions.map(() => ({
                choiceIndex: null,
                markedReview: false,
                timeSpentSec: 0,
                viewed: false
            }));

            questionTimers = questions.map(() => null);
            current = 0;

            const durationMin = Number(mock.duration) || 120;
            totalDurationSec = durationMin * 60;

            startTime = Date.now();
            testStarted = true;
            submittedAlready = false;

            startGlobalTimer();
            const firstSection = updateSectionTabs();
            if (firstSection) {
                setActiveSection(firstSection);
            }


            currentMockId = mock.id;
            openStart.style.display = 'none';
        }


        /* ========== render / timers ========== */
        function startGlobalTimer() {
            if (globalTimerInterval) clearInterval(globalTimerInterval);
            // immediately update display
            function updateOnce() {
                if (!startTime || typeof totalDurationSec !== 'number' || totalDurationSec <= 0) {
                    globalTimer.textContent = '00:00:00';
                    return;
                }
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                let remaining = totalDurationSec - elapsed;
                if (remaining < 0) remaining = 0;
                globalTimer.textContent = fmtH(remaining);
                if (remaining <= 0) {
                    // stop timer, auto submit
                    clearInterval(globalTimerInterval);
                    globalTimerInterval = null;
                    // ensure we only auto-submit once
                    if (!submittedAlready) {
                        submitTest(true).catch(() => { /* ignore */ });
                    }
                }
            }
            updateOnce();
            globalTimerInterval = setInterval(updateOnce, 500);
        }
        function stopGlobalTimer() { if (globalTimerInterval) { clearInterval(globalTimerInterval); globalTimerInterval = null; } }

        // Helper functions that now use sectionMap
        function getSectionOfIndex(idx) { return (questions[idx] && questions[idx].section) ? questions[idx].section : null; }

        function getNumberWithinSection(idx) {
            const sec = getSectionOfIndex(idx);
            if (!sec || !sectionMap || !sectionMap[sec]) return null;
            return sectionMap[sec].indexOf(idx) + 1; // 1-based
        }

        function getGlobalIndex(section, num) {
            if (!sectionMap || !sectionMap[section]) return null;
            if (num - 1 < 0 || num - 1 >= sectionMap[section].length) return null;
            return sectionMap[section][num - 1];
        }

        function firstIndexOfSection(section) {
            if (!sectionMap || !sectionMap[section] || sectionMap[section].length === 0) return 0;
            return sectionMap[section][0];
        }

        function applySubscriptionBranding(subscription) {
            const sub = (subscription || '').toLowerCase();

            let src = 'assets/banner.jpeg';
            if (sub === 'prx') src = 'assets/logo-prx.png';
            else if (sub === 'civinity') src = 'assets/logo-cvy.jpg';

            document.getElementById('app-banner').src = src;
            document.getElementById('login-banner').src = src;
        }


        function renderQuestion() {
            // If test not started -> show rules block (same content as initial HTML)
            if (!testStarted) {
                const rulesHTML = `
          <div class="rules">
            <h3>Rules</h3>
            <ul>
              <li>+4 for a correct answer</li>
              <li>-1 for a wrong answer</li>
              <li>0 for unanswered questions</li>
              <li>Only one attempt allowed per mock — reattempts are not permitted</li>
              <li>Use <strong>Mark</strong> to flag questions for review and submit when done</li>
            </ul>

            <h3 style="margin-top:10px">Dashboard — quick guide</h3>
            <ul>
              <li>Timer (top-right): shows elapsed time for your current attempt.</li>
              <li>Question palette (right): jump to any question in the section; colored badges show answered/marked status.</li>
              <li>Controls (bottom): <strong>Prev/Next</strong> to navigate, <strong>Mark</strong> to flag, and <strong>Submit</strong> to finish.</li>
              <li>Results: after submission you can view per-question outcome, time used and summary analytics in the "Results" window.</li>
            </ul>

            <div class="muted">When you're ready, click <strong>Start</strong> to begin the mock. Good luck!</div>
          </div>
        `;
                questionEl.innerHTML = rulesHTML;
                optionsEl.innerHTML = '';
                qno.textContent = 'Question 1';
                qtime.textContent = 'Time spent: 00:00';
                qstatus.textContent = 'Status: Unseen';
                return;
            }

            // mark current as viewed when rendering it
            if (responses[current]) responses[current].viewed = true;

            const q = questions[current];
            qno.textContent = `${q.section} • Q ${getNumberWithinSection(current) || 1}`;

            optionsEl.innerHTML = '';
            questionEl.innerHTML = '';

            if (q.img) {
                const im = document.createElement('img');
                im.src = q.img;
                im.alt = q.id || 'question image';
                im.onerror = function () {
                    console.warn('Image load failed for', q.img);
                    this.onerror = null;
                    this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360"><rect width="100%" height="100%" fill="#fff4ed"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#b37b4a" font-family="Arial" font-size="20">Image failed to load</text></svg>`);
                };
                questionEl.appendChild(im);
            } else if (q.text) {
                const p = document.createElement('div');
                p.textContent = q.text;
                p.style.color = '#0f172a';
                questionEl.appendChild(p);
            } else {
                const p = document.createElement('div');
                p.textContent = 'No image available for this question';
                p.style.color = '#b37b4a';
                questionEl.appendChild(p);
            }

            qtime.textContent = 'Time spent: ' + fmtMS(responses[current].timeSpentSec || 0);
            const resp = responses[current];
            qstatus.textContent = resp.markedReview ? 'Status: Marked' : (resp.choiceIndex === null ? 'Status: Unseen' : 'Status: Answered');

            const opts = ['A', 'B', 'C', 'D'];
            opts.forEach((lab, i) => {
                const d = document.createElement('div');
                d.className = 'opt' + (resp.choiceIndex === i ? ' selected' : '');
                d.textContent = lab;
                d.addEventListener('click', () => {
                    recordQuestionTimeStop(current);
                    responses[current].choiceIndex = i;
                    responses[current].markedReview = false;
                    renderQuestion();
                    renderPicker(getSectionOfIndex(current));
                    recordQuestionTimeStart(current);
                });
                optionsEl.appendChild(d);
            });

            questionTimers[current] = questionTimers[current] || Date.now();
        }

        function renderPicker(section) {
            const picker = document.getElementById('section-picker'); picker.innerHTML = '';
            const list = (sectionMap && sectionMap[section]) ? sectionMap[section] : [];
            for (let i = 0; i < list.length; i++) {
                const idx = list[i];
                if (idx === undefined) continue;
                const st = responses[idx] || { choiceIndex: null, markedReview: false, viewed: false };
                // priority: marked -> answered -> viewed -> default
                let cls = 'qbtn';
                if (st.markedReview) cls += ' review';
                else if (st.choiceIndex !== null) cls += ' answered';
                else if (st.viewed) cls += ' viewed';

                const el = document.createElement('div'); el.className = cls;
                el.textContent = i + 1;
                el.title = `Q ${i + 1}`;
                el.addEventListener('click', () => {
                    // stop time for previous
                    if (testStarted) recordQuestionTimeStop(current);
                    // set current and mark viewed immediately so UI shows ribbon even before renderQuestion sets it
                    current = idx;
                    if (responses[current]) responses[current].viewed = true;
                    renderQuestion();
                    renderPicker(section);
                    // resume timer
                    if (testStarted) recordQuestionTimeStart(current);
                });
                picker.appendChild(el);
            }
        }

        function firstIndexOfSection(section) {
            if (!sectionMap || !sectionMap[section] || sectionMap[section].length === 0) return 0;
            return sectionMap[section][0];
        }

        document.getElementById('btn-phy').addEventListener('click', () => setActiveSection('Physics'));
        document.getElementById('btn-chem').addEventListener('click', () => setActiveSection('Chemistry'));
        document.getElementById('btn-math').addEventListener('click', () => setActiveSection('Mathematics'));

        function setActiveSection(section) {
            document.getElementById('btn-phy').classList.toggle('active', section === 'Physics');
            document.getElementById('btn-chem').classList.toggle('active', section === 'Chemistry');
            document.getElementById('btn-math').classList.toggle('active', section === 'Mathematics');

            if (typeof recordQuestionTimeStop === 'function' && testStarted) {
                recordQuestionTimeStop(current);
            }

            const idx = firstIndexOfSection(section);
            if (typeof idx === 'number' && idx >= 0 && idx < questions.length) {
                current = idx;
            }

            // mark viewed when switching into section (we render question which sets viewed)
            renderQuestion();
            renderPicker(section);
        }

        nextBtn.addEventListener('click', () => { if (!testStarted) return; recordQuestionTimeStop(current); current = Math.min(questions.length - 1, current + 1); renderQuestion(); renderPicker(getSectionOfIndex(current)); });
        prevBtn.addEventListener('click', () => { if (!testStarted) return; recordQuestionTimeStop(current); current = Math.max(0, current - 1); renderQuestion(); renderPicker(getSectionOfIndex(current)); });
        markReviewBtn.addEventListener('click', () => { if (!testStarted) return; responses[current].markedReview = !responses[current].markedReview; renderQuestion(); renderPicker(getSectionOfIndex(current)); });

        // CLEAR button behaviour: deselect current option and remove mark
        clearBtn.addEventListener('click', () => {
            if (!testStarted) return;
            // stop current timer (we keep time already spent)
            recordQuestionTimeStop(current);
            // clear selection and unmark
            responses[current].choiceIndex = null;
            responses[current].markedReview = false;
            // update UI
            renderQuestion();
            renderPicker(getSectionOfIndex(current));
            // resume timing for this question
            recordQuestionTimeStart(current);
        });

        function recordQuestionTimeStart(idx) { if (!questionTimers[idx]) questionTimers[idx] = Date.now(); }
        function recordQuestionTimeStop(idx) { if (questionTimers[idx]) { const delta = Math.floor((Date.now() - questionTimers[idx]) / 1000); responses[idx].timeSpentSec = (responses[idx].timeSpentSec || 0) + delta; questionTimers[idx] = null; qtime.textContent = 'Time spent: ' + fmtMS(responses[idx].timeSpentSec || 0); } }

        // Updated Submit behavior: show confirmation modal with stats
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!testStarted || submittedAlready) return;
            showSubmitConfirm();
        });

        function showSubmitConfirm() {
            if (!testStarted || submittedAlready) return;
            const attempted = responses.filter(r => r.choiceIndex !== null).length;
            const left = responses.length - attempted;
            let remaining = 0;
            if (startTime && typeof totalDurationSec === 'number') {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                remaining = Math.max(0, totalDurationSec - elapsed);
            }
            confirmAttempted.textContent = `Attempted: ${attempted}`;
            confirmLeft.textContent = `Left: ${left}`;
            confirmRemaining.textContent = `Time left: ${fmtH(remaining)}`;
            confirmModal.style.display = 'flex';
        }

        confirmNo.addEventListener('click', () => { confirmModal.style.display = 'none'; });
        // Confirm yes -> proceed to submit. If there are marked questions, warn first in modal flow.
        confirmYes.addEventListener('click', async () => {
            confirmModal.style.display = 'none';
            if (!testStarted || submittedAlready) return;
            // if there are any marked questions, confirm again (small inline check)
            const marked = responses.map((r, i) => r.markedReview ? i : -1).filter(x => x >= 0);
            if (marked.length) {
                if (!confirm(`You have ${marked.length} marked. Submit anyway?`)) return;
            }
            await submitTest();
        });

        async function submitTest(isAuto = false) {
            if (!testStarted || submittedAlready) return;
            submittedAlready = true;
            questionTimers.forEach((t, i) => { if (t) recordQuestionTimeStop(i); });
            stopGlobalTimer();
            totalDurationSec = 0;
            globalTimer.textContent = '00:00:00';
            const { total, per } = computeScore();

            const result = {
                username: currentUser ? currentUser.username : 'anon',
                name: currentUser ? currentUser.name : 'anon',
                mockId: currentMockId || null,
                score: total,
                date: (firebase && firebase.firestore) ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
                durationSec: Math.floor((Date.now() - startTime) / 1000),
                autoSubmitted: !!isAuto,
                perQuestion: questions.map((q, i) => ({
                    qid: q.id,
                    qidNormalized: (q.qid || q.id || '').toString(),
                    section: q.section,
                    imageUrl: q.img || q.imageUrl || q.imgUrl || null,
                    selectedIndex: responses[i].choiceIndex,
                    correctIndex: q.answerIndex,
                    score: per[i],
                    timeUsedSec: responses[i].timeSpentSec,
                    markedReview: responses[i].markedReview
                }))
            };

            if (db) { try { await db.collection('res').add(result); } catch (e) { console.warn('save failed', e); } } else { console.log('would save', result); }

            responses = questions.map(() => ({ choiceIndex: null, markedReview: false, timeSpentSec: 0, viewed: false }));
            questionTimers = questions.map(() => null);
            current = 0; submittedAlready = false; testStarted = false; startTime = null; if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
            renderQuestion(); renderPicker(getSectionOfIndex(current));

            openStart.style.display = 'inline-block';
            currentMockId = null;

            if (currentUser) await loadMocks();

            alert('Submitted. Results saved.');
        }

        function computeScore() {
            const per = responses.map((r, i) => {
                if (r.choiceIndex === null) return 0;
                const corr = questions[i].answerIndex;
                if (corr === null || corr === undefined) return 0;
                return r.choiceIndex === corr ? 4 : -1;
            });
            const total = per.reduce((a, b) => a + b, 0);
            return { total, per };
        }

        /* ========== history & details ========== */
        resultsBtn.addEventListener('click', async () => {
            historyOverlay.style.display = 'flex'; historyGrid.innerHTML = '';
            if (!db) { historyGrid.innerHTML = '<div style="padding:8px">DB not configured</div>'; return; }
            if (!currentUser) { historyGrid.innerHTML = '<div style="padding:8px">Login to view</div>'; return; }
            try {
                let snap = await db.collection('res').where('username', '==', currentUser.username).orderBy('date', 'desc').limit(100).get().catch(async () => { const alt = await db.collection('res').orderBy('date', 'desc').limit(200).get(); return { docs: alt.docs.filter(d => d.data().username === currentUser.username) }; });
                if (!snap || snap.docs.length === 0) { historyGrid.innerHTML = '<div style="padding:8px">No submissions</div>'; return; }
                snap.docs.forEach(doc => {
                    const d = doc.data();
                    const card = document.createElement('div'); card.className = 'history-card';
                    card.innerHTML = `<div style="font-weight:800">${d.name || d.username}</div><div style="font-size:12px;color:${getComputedStyle(document.documentElement).getPropertyValue('--muted')}">${d.score} • ${d.perQuestion ? d.perQuestion.length : '-'} Qs</div>`;
                    const v = document.createElement('button'); v.className = 'btn-secondary'; v.textContent = 'View'; v.style.marginTop = '6px'; v.addEventListener('click', async () => { const docf = await db.collection('res').doc(doc.id).get(); showDetailFromDoc(docf); });
                    card.appendChild(v);
                    historyGrid.appendChild(card);
                });
            } catch (e) { console.error(e); historyGrid.innerHTML = '<div style="padding:8px">Failed to load</div>'; }
        });
        closeHistory.addEventListener('click', () => historyOverlay.style.display = 'none');

        // robust showDetailFromDoc — checks saved image first, then runtime questions[], then Firestore fallback
        async function showDetailFromDoc(doc) {
            // doc may be a firestore doc snapshot or a plain object
            const d = doc && doc.data ? doc.data() : (doc || {});
            document.getElementById('detail-title').textContent = `Submission — ${d.name || d.username || 'User'}`;
            const savedText = d.date ? (d.date.toDate ? d.date.toDate().toLocaleString() : d.date) : '-';
            document.getElementById('detail-sub').textContent = `Saved: ${savedText}`;

            const scoreBadge = document.getElementById('detail-score');
            if (scoreBadge) {
                const big = scoreBadge.querySelector('.big');
                if (big) big.textContent = d.score || 0;
            }

            const perQ = d.perQuestion || [];
            const totalQs = perQ.length;
            const maxScore = totalQs * 4;
            document.getElementById('right-total').textContent = d.score || 0;
            document.getElementById('right-max').textContent = maxScore;
            document.getElementById('right-duration').textContent = (() => {
                if (d.durationSec) {
                    const m = Math.floor(d.durationSec / 60), s = d.durationSec % 60;
                    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                }
                return '-';
            })();

            // Compute overall correct/wrong/unanswered and subject-wise marks
            let correct = 0, wrong = 0, unanswered = 0;
            const subj = {}; // subj -> { correct, wrong, unanswered, positive, negative }
            perQ.forEach(pq => {
                const section = (pq.section || 'Unknown');
                if (!subj[section]) subj[section] = { correct: 0, wrong: 0, unanswered: 0, positive: 0, negative: 0, net: 0 };
                if (pq.selectedIndex == null) {
                    unanswered++;
                    subj[section].unanswered++;
                } else if (pq.correctIndex != null && pq.selectedIndex === pq.correctIndex) {
                    correct++;
                    subj[section].correct++;
                    subj[section].positive += 4;
                } else {
                    wrong++;
                    subj[section].wrong++;
                    subj[section].negative += 1;
                }
            });

            // compute net for each subject and overall
            let overallPositive = 0, overallNegative = 0;
            Object.keys(subj).forEach(k => { subj[k].net = subj[k].positive - subj[k].negative; overallPositive += subj[k].positive; overallNegative += subj[k].negative; });

            document.getElementById('stat-correct').textContent = correct;
            document.getElementById('stat-wrong').textContent = wrong;
            document.getElementById('stat-unanswered').textContent = unanswered;

            // Update the progress bar as before
            const percent = totalQs ? Math.round(((correct + wrong) / totalQs) * 100) : 0;
            const pb = document.getElementById('progress-bar');
            if (pb) pb.style.width = `${percent}%`;

            // Remove old breakdown if present
            let existingBreakdown = document.getElementById('subject-breakdown');
            if (existingBreakdown) existingBreakdown.remove();

            const leftCol = document.querySelector('.detail-left');
            if (leftCol) {
                const breakdown = document.createElement('div');
                breakdown.id = 'subject-breakdown';
                breakdown.style.display = 'flex';
                breakdown.style.gap = '8px';
                breakdown.style.flexWrap = 'wrap';
                breakdown.style.marginTop = '10px';
                breakdown.style.alignItems = 'center';

                // overall summary
                const overallDiv = document.createElement('div');
                overallDiv.className = 'stat';
                overallDiv.style.minWidth = '160px';
                overallDiv.innerHTML = `<strong style="font-size:16px">${(overallPositive - overallNegative) || 0}</strong><span style="font-size:12px;color:${getComputedStyle(document.documentElement).getPropertyValue('--muted')}">Overall (net)</span>
        <div style="margin-top:6px;font-size:12px;color:${getComputedStyle(document.documentElement).getPropertyValue('--muted')}">+${overallPositive} / -${overallNegative}</div>`;
                breakdown.appendChild(overallDiv);

                // per-subject cards (Physics, Chemistry, Mathematics kept in same order if present)
                const prefer = ['Physics', 'Chemistry', 'Mathematics'];
                const keys = [...prefer.filter(k => subj[k]), ...Object.keys(subj).filter(k => !prefer.includes(k))];

                keys.forEach(k => {
                    const s = subj[k];
                    const card = document.createElement('div');
                    card.className = 'stat';
                    card.style.minWidth = '140px';
                    card.innerHTML = `<strong style="font-size:15px">${s.net}</strong><span style="font-size:12px;color:${getComputedStyle(document.documentElement).getPropertyValue('--muted')}">${escapeHtml(k)}</span>
            <div style="margin-top:6px;font-size:12px;color:${getComputedStyle(document.documentElement).getPropertyValue('--muted')}">+${s.positive} / -${s.negative}</div>`;
                    breakdown.appendChild(card);
                });

                // insert the breakdown after the stats-row element
                const statsRow = leftCol.querySelector('.stats-row');
                if (statsRow && statsRow.parentNode) {
                    statsRow.parentNode.insertBefore(breakdown, statsRow.nextSibling);
                } else {
                    leftCol.insertBefore(breakdown, leftCol.firstChild);
                }
            }

            // Build per-question list and attach Preview (eye) button
            const list = document.getElementById('perq-list');
            list.innerHTML = '';
            (d.perQuestion || []).forEach((pq, i) => {
                const tr = document.createElement('div');
                tr.className = 'perq-item';
                const left = document.createElement('div');
                left.className = 'perq-left';
                left.textContent = i + 1;

                const mid = document.createElement('div');
                mid.className = 'perq-mid';
                const qid = document.createElement('div');
                qid.className = 'qid';
                qid.textContent = pq.qid || '';

                const selText = pq.selectedIndex == null ? '-' : String.fromCharCode(65 + pq.selectedIndex);
                const corText = pq.correctIndex == null ? '-' : String.fromCharCode(65 + pq.correctIndex);

                const selSpan = document.createElement('div');
                selSpan.textContent = `Selected: ${selText}`;

                const corSpan = document.createElement('div');
                corSpan.textContent = `Correct: ${corText}`;

                const timeSpan = document.createElement('div');
                timeSpan.textContent = `Time: ${typeof pq.timeUsedSec === 'number' ? Math.floor(pq.timeUsedSec / 60) + ':' + String(pq.timeUsedSec % 60).padStart(2, '0') : '-'}`;

                const scoreSpan = document.createElement('div');
                scoreSpan.textContent = `Score: ${pq.score || 0}`;

                // preview button (eye SVG)
                const viewBtn = document.createElement('button');
                viewBtn.className = 'btn secondary';
                viewBtn.style.marginLeft = '8px';
                viewBtn.title = 'View question image';
                viewBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg> View
        `;
                // on click: try to find image and open preview window
                viewBtn.addEventListener('click', async () => {
                    const qidVal = pq.qid || pq.qidNormalized || '';
                    // 1) check image embedded in the saved attempt (best)
                    let imgUrl = pq.imageUrl || pq.img || pq.image || null;

                    // 2) fallback: try to find it in current runtime questions[]
                    if (!imgUrl && Array.isArray(questions) && questions.length) {
                        try {
                            const found = questions.find(q => (String(q.id) === String(qidVal) || String(q.qid || '') === String(qidVal)));
                            if (found) imgUrl = found.img || found.imageUrl || found.imgUrl || null;
                        } catch (e) { }
                    }

                    // 3) fallback: try to fetch question doc from Firestore (if mockId available)
                    if (!imgUrl && db && d.mockId) {
                        try {
                            const qSnap = await db.collection('mocks').doc(d.mockId).collection('questions')
                                .where('qid', '==', qidVal).limit(1).get().catch(() => ({ docs: [] }));
                            if (qSnap && qSnap.docs && qSnap.docs.length) {
                                const qdoc = qSnap.docs[0].data();
                                imgUrl = qdoc.imageUrl || qdoc.img || qdoc.image || findImageFromDoc(qdoc) || null;
                            }
                        } catch (e) {
                            console.warn('failed to fetch question doc for preview', e);
                        }
                    }

                    // show preview (open window)
                    const w = window.open('', '_blank', 'width=900,height=700');
                    if (!w) { alert('Popup blocked — allow popups to preview images'); return; }
                    if (imgUrl) {
                        w.document.title = 'Question Preview - ' + qidVal;
                        w.document.body.style.margin = '0';
                        w.document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;padding:12px"><img src="${escapeHtml(imgUrl)}" style="max-width:100%;max-height:100%;object-fit:contain" alt="${escapeHtml(qidVal)}" /></div>`;
                    } else {
                        w.document.title = 'Preview - Not available';
                        w.document.body.style.margin = '0';
                        w.document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;padding:12px;color:#b37b4a;font-weight:800">No image available for ${escapeHtml(qidVal)}</div>`;
                    }
                });

                const badge = document.createElement('div');
                badge.className = 'badge';
                if (pq.selectedIndex == null) { badge.classList.add('unseen'); badge.textContent = 'Unanswered'; }
                else if (pq.selectedIndex === pq.correctIndex) { badge.classList.add('correct'); badge.textContent = 'Correct'; }
                else { badge.classList.add('wrong'); badge.textContent = 'Wrong'; }

                mid.appendChild(qid);
                mid.appendChild(selSpan);
                mid.appendChild(corSpan);
                mid.appendChild(scoreSpan);
                mid.appendChild(timeSpan);

                tr.appendChild(left);
                tr.appendChild(mid);

                // actions column: badge + view button
                const actionsWrap = document.createElement('div');
                actionsWrap.style.display = 'flex';
                actionsWrap.style.gap = '8px';
                actionsWrap.style.alignItems = 'center';
                actionsWrap.appendChild(badge);
                actionsWrap.appendChild(viewBtn);

                tr.appendChild(actionsWrap);
                list.appendChild(tr);
            });

            // show the modal
            detailOverlay.style.display = 'flex';
            const closeTop = document.getElementById('close-detail');
            if (closeTop) closeTop.onclick = () => { detailOverlay.style.display = 'none'; };
            const closeBottom = document.getElementById('close-detail-bottom');
            if (closeBottom) closeBottom.onclick = () => { detailOverlay.style.display = 'none'; };
        }

        closeDetail.addEventListener('click', () => detailOverlay.style.display = 'none');

        /* ========== init ========== */
        // initial fallback sample
        questions = sampleBank();
        // Build an initial sectionMap from sampleBank
        (function buildInitialSectionMap() {
            const map = {};
            for (let i = 0; i < questions.length; i++) {
                const s = questions[i].section || 'Unknown';
                if (!map[s]) map[s] = [];
                map[s].push(i);
            }
            const preferred = ['Physics', 'Chemistry', 'Mathematics'];
            const ordered = {};
            preferred.forEach(p => { if (map[p]) ordered[p] = map[p]; });
            Object.keys(map).forEach(k => { if (!ordered[k]) ordered[k] = map[k]; });
            sectionMap = ordered;
        })();

        responses = questions.map(() => ({ choiceIndex: null, markedReview: false, timeSpentSec: 0, viewed: false }));
        questionTimers = questions.map(() => null);
        current = 0;
        renderQuestion();
        renderPicker('Physics');

        openStart.addEventListener('click', () => { if (!currentUser) { loginError.textContent = 'Please login'; loginScreen.style.display = 'flex'; loginUsername.focus(); return; } startModal.style.display = 'flex'; });

        (async () => {
            if (db) await loadMocks(); else {
                mocksList = [
                    {
                        id: 'local-1', name: 'Mock 1', time: '120', qns: '60', syllabus: 'Full CEE', active: 'yes',
                        img_p1: 'https://via.placeholder.com/600x360?text=P1', ans_p1: 'A',
                        img_c1: 'https://via.placeholder.com/600x360?text=C1', ans_c1: 'B',
                        img_m1: 'https://via.placeholder.com/600x360?text=M1', ans_m1: 'C'
                    },
                    { id: 'local-2', name: 'Mock 2 (Archived)', time: '90', qns: '30', syllabus: 'Physics only', active: 'no' }
                ]; await renderMocks();
            }
        })();

        // auto-focus username when login shows
        // If you programmatically show login screen elsewhere, call: loginUsername.focus()

        function updateSectionTabs() {
            const phyBtn = document.getElementById('btn-phy');
            const chemBtn = document.getElementById('btn-chem');
            const mathBtn = document.getElementById('btn-math');

            const hasPhysics = sectionMap && sectionMap.Physics && sectionMap.Physics.length;
            const hasChem = sectionMap && sectionMap.Chemistry && sectionMap.Chemistry.length;
            const hasMath = sectionMap && sectionMap.Mathematics && sectionMap.Mathematics.length;

            phyBtn.style.display = hasPhysics ? 'inline-block' : 'none';
            chemBtn.style.display = hasChem ? 'inline-block' : 'none';
            mathBtn.style.display = hasMath ? 'inline-block' : 'none';

            // return first available section (priority order)
            if (hasPhysics) return 'Physics';
            if (hasChem) return 'Chemistry';
            if (hasMath) return 'Mathematics';
            return null;
        }
        const infoBtn = document.getElementById('info-btn');
        const devInfoModal = document.getElementById('dev-info-modal');
        const closeDevInfo = document.getElementById('close-dev-info');

        infoBtn?.addEventListener('click', () => {
            devInfoModal.style.display = 'flex';
        });

        closeDevInfo?.addEventListener('click', () => {
            devInfoModal.style.display = 'none';
        });

        devInfoModal?.addEventListener('click', (e) => {
            if (e.target === devInfoModal) {
                devInfoModal.style.display = 'none';
            }
        });
        applySubscriptionBranding(null);

document.addEventListener('dragstart', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});

document.addEventListener('contextmenu', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});

document.addEventListener('mousedown', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});
