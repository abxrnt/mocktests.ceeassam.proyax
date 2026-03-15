const firebaseConfig = {
        apiKey: "AIzaSyBOVl1hdmprJXpgdN_sNTO3FsNePD_zNZY",
        authDomain: "aahes-cee-cutoffs.firebaseapp.com",
        projectId: "aahes-cee-cutoffs",
      };
      let db = null;
      let auth = null;
      try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        auth
          .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
          .catch((e) => console.warn("auth persistence setup failed", e));
      } catch (e) {
        db = null;
        auth = null;
        console.warn("firebase not configured", e);
      }

      // DOM refs
      const appEl = document.getElementById("app");
      const loginScreen = document.getElementById("login-screen");
      const loginUsername = document.getElementById("login-username");
      const loginPassword = document.getElementById("login-password");
      const loginBtn = document.getElementById("login-btn");
      const loginError = document.getElementById("login-error");
      const loginGrid = document.querySelector(".px-login-grid");
      const loginCountdownCard = document.querySelector(".login-countdown-card");
      const loginFormPane = document.getElementById("login-form");
      const loginFeaturesPane = document.querySelector(".login-features");
      const loadingOverlay = document.getElementById("loading-overlay");
      const loadingText = document.getElementById("loading-text");
      let loadingTextInterval = null;
      const postLoginScreen = document.getElementById("post-login-screen");
      const postLoginGreeting = document.getElementById("post-login-greeting");
      const postLoginMocksBtn = document.getElementById("post-login-mocks");
      const postLoginResultsBtn = document.getElementById("post-login-results");
      const postLoginProfileBtn = document.getElementById("post-login-profile");
      const postLoginPyqsBtn = document.getElementById("post-login-pyqs");
      const postLoginLogoutBtn = document.getElementById("post-login-logout");

      const profileModal = document.getElementById("profile-modal");
      const profileModalCloseBtn = document.getElementById("profile-modal-close");
      const profileCancelBtn = document.getElementById("profile-cancel");
      const profileForm = document.getElementById("profile-form");
      const profileNameInput = document.getElementById("profile-name-input");
      const profileEmailInput = document.getElementById("profile-email-input");
      const profileUsernameInput = document.getElementById("profile-username-input");
      const profileRegisteredOnInput = document.getElementById("profile-registered-on");
      const profileFormMsg = document.getElementById("profile-form-msg");

      const qno = document.getElementById("qno");
      const questionEl = document.getElementById("question");
      const optionsEl = document.getElementById("options");
      const headerMockTitleEl = document.getElementById("header-mock-title");
      const qtime = document.getElementById("qtime");
      const qstatus = document.getElementById("qstatus");
      const globalTimer = document.getElementById("global-timer");
      const timerRingFill = document.getElementById("timer-ring-fill");
      const headerTimerWrap = document.getElementById("header-timer-wrap");
      const mobileHeaderUser = document.getElementById("mobile-header-user");
      const subjectSeg = document.getElementById("subject-seg");
      const mobileUserSlot = document.getElementById("mobile-user-slot");
      const mobileTimerSlot = document.getElementById("mobile-timer-slot");
      const mobileSubjectSlot = document.getElementById("mobile-subject-slot");
      const mobileQnoSlot = document.getElementById("mobile-qno-slot");

      const layoutState = {
        userBadgeParent: null,
        timerParent: null,
        subjectParent: null,
        qnoParent: null,
      };

      // user badge DOM refs (new)
      const userBadge = document.getElementById("user-badge");
      const userNameEl = document.getElementById("user-name-text");
      const userEmailEl = document.getElementById("user-email");

      const startModal = document.getElementById("start-modal");
      const mocksContainer = document.getElementById("mocks-container");
      const closeMocks = document.getElementById("close-mocks");

      const nextBtn = document.getElementById("next-btn");
      const prevBtn = document.getElementById("prev-btn");
      const markReviewBtn = document.getElementById("mark-review");
      const submitBtn = document.getElementById("submit-btn");
      // CLEAR button ref
      const clearBtn = document.getElementById("clear-btn");

      const sideControlsEl = document.getElementById("side-controls");
      const liveSummaryEl = document.getElementById("live-summary");

      function applyMobileLayout() {
        const isMobile = window.matchMedia("(max-width: 900px)").matches;
        if (!userBadge || !headerTimerWrap || !subjectSeg || !qno) return;
        if (!mobileUserSlot || !mobileTimerSlot || !mobileSubjectSlot || !mobileQnoSlot || !mobileHeaderUser) return;

        if (!layoutState.userBadgeParent) {
          layoutState.userBadgeParent = userBadge.parentElement;
          layoutState.timerParent = headerTimerWrap.parentElement;
          layoutState.subjectParent = subjectSeg.parentElement;
          layoutState.qnoParent = qno.parentElement;
        }

        if (isMobile) {
          if (userBadge.parentElement !== mobileHeaderUser) {
            mobileHeaderUser.appendChild(userBadge);
          }
          if (headerTimerWrap.parentElement !== mobileTimerSlot) {
            mobileTimerSlot.appendChild(headerTimerWrap);
          }
          if (subjectSeg.parentElement !== mobileSubjectSlot) {
            mobileSubjectSlot.appendChild(subjectSeg);
          }
          if (qno.parentElement !== mobileQnoSlot) {
            mobileQnoSlot.appendChild(qno);
          }
        } else {
          if (layoutState.userBadgeParent && userBadge.parentElement !== layoutState.userBadgeParent) {
            layoutState.userBadgeParent.appendChild(userBadge);
          }
          if (layoutState.timerParent && headerTimerWrap.parentElement !== layoutState.timerParent) {
            layoutState.timerParent.appendChild(headerTimerWrap);
          }
          if (layoutState.subjectParent && subjectSeg.parentElement !== layoutState.subjectParent) {
            layoutState.subjectParent.appendChild(subjectSeg);
          }
          if (layoutState.qnoParent && qno.parentElement !== layoutState.qnoParent) {
            layoutState.qnoParent.appendChild(qno);
          }
        }
      }

      window.addEventListener("resize", applyMobileLayout);

      function showLoadingOverlay(baseText = "Loading") {
        if (!loadingOverlay) return;
        let dots = 0;
        if (loadingText) loadingText.textContent = baseText;
        loadingOverlay.classList.add("is-active");
        loadingOverlay.style.display = "flex";
        loadingOverlay.setAttribute("aria-hidden", "false");
        if (loadingTextInterval) clearInterval(loadingTextInterval);
        loadingTextInterval = setInterval(() => {
          dots = (dots + 1) % 4;
          if (loadingText) loadingText.textContent = `${baseText}${".".repeat(dots)}`;
        }, 350);
      }

      function hideLoadingOverlay() {
        if (loadingTextInterval) {
          clearInterval(loadingTextInterval);
          loadingTextInterval = null;
        }
        if (!loadingOverlay) return;
        loadingOverlay.classList.remove("is-active");
        loadingOverlay.style.display = "none";
        loadingOverlay.setAttribute("aria-hidden", "true");
      }

      let loginStatsAnimated = false;
      function animateLoginCounter(el, target, durationMs) {
        if (!el) return;
        const safeTarget = Number(target) || 0;
        const safeDuration = Math.max(500, Number(durationMs) || 1500);
        const startValue = 0;
        const startTime = performance.now();
        const formatCount = (n) => n.toLocaleString("en-IN");

        function step(now) {
          const progress = Math.min(1, (now - startTime) / safeDuration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const currentValue = Math.floor(
            startValue + (safeTarget - startValue) * eased,
          );
          el.textContent = formatCount(currentValue);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = formatCount(safeTarget);
        }

        requestAnimationFrame(step);
      }

      function initLoginStatsCounters() {
        if (loginStatsAnimated) return;
        const statNodes = document.querySelectorAll("[data-counter-target]");
        if (!statNodes.length) return;
        loginStatsAnimated = true;
        statNodes.forEach((node, idx) => {
          const target = Number(node.getAttribute("data-counter-target"));
          animateLoginCounter(node, target, 1300 + idx * 250);
        });
      }

      function getCeeDaysLeft() {
        const now = new Date();
        const todayUtcMs = Date.UTC(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const targetUtcMs = Date.UTC(2026, 5, 7); // June is 5 (0-indexed)
        const diffMs = targetUtcMs - todayUtcMs;
        return Math.max(0, Math.ceil(diffMs / 86400000));
      }

      function initCeeCountdown() {
        const daysEl = document.getElementById("cee-days-left");
        if (!daysEl) return;

        daysEl.textContent = getCeeDaysLeft().toLocaleString("en-IN");

        setInterval(() => {
          daysEl.textContent = getCeeDaysLeft().toLocaleString("en-IN");
        }, 60 * 60 * 1000);
      }

      // Legal Modal (Terms & Conditions & Privacy Policy)
      const legalModal = document.getElementById("legal-modal");
      const legalClose = document.getElementById("legal-close");
      const legalTabs = document.querySelectorAll(".legal-modal-tab");
      const legalBody = document.getElementById("legal-modal-body");
      const privacyLink = document.getElementById("privacy-link");
      const termsLink = document.getElementById("terms-link");

      const termsContent = `
        <h3>Terms and Conditions</h3>
        <p>Last updated: February 2026</p>

        <h4>1. Acceptance of Terms</h4>
        <p>By accessing and using this PROYAX Mock Test platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>

        <h4>2. Use License</h4>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) from PROYAX for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title. Under this license you may not:</p>
        <ul>
          <li>Modify or copy the materials</li>
          <li>Use the materials for any commercial purpose or for any public display</li>
          <li>Attempt to decompile or reverse engineer any software contained on the platform</li>
          <li>Remove any copyright or other proprietary notations from the materials</li>
          <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          <li>Attempt to gain unauthorized access to any portion or feature of the platform</li>
          <li>Share login credentials with other users</li>
        </ul>

        <h4>3. Mock Test Rules</h4>
        <p>All mock tests on this platform are designed to simulate the actual Assam CEE examination. The following rules apply:</p>
        <ul>
          <li>Each mock test can be attempted up to three times per user account</li>
          <li>Test duration and number of questions are as specified before starting</li>
          <li>You cannot pause the test and resume later - once started, the timer continues</li>
          <li>Only one browser tab can be active for a test at any time</li>
          <li>Disconnection may result in auto-submission of current answers</li>
        </ul>

        <h4>4. Scoring and Results</h4>
        <p>Scores are calculated as follows:</p>
        <ul>
          <li>Each correct answer: +4 marks</li>
          <li>Each incorrect answer: -1 mark</li>
          <li>Each unanswered question: 0 marks</li>
        </ul>
        <p>Results are generated automatically upon submission and cannot be manually modified. You can view your detailed results immediately after submission.</p>

        <h4>5. Intellectual Property Rights</h4>
        <p>All content, including questions, answer keys, explanations, and visual materials on the PROYAX platform are the exclusive property of PROYAX and are protected by copyright laws. You may not reproduce, distribute, or transmit any content without prior written permission.</p>

        <h4>6. User Conduct</h4>
        <p>You agree not to:</p>
        <ul>
          <li>Use the platform for any unlawful purpose or in violation of any laws</li>
          <li>Harass, abuse, or harm any person through the platform</li>
          <li>Attempt to gain unauthorized access to the platform's systems</li>
          <li>Use automated tools, bots, or scripts to access the platform</li>
          <li>Sell, trade, or transfer access to other users</li>
        </ul>

        <h4>7. Disclaimer</h4>
        <p>The materials and content on this platform are provided on an 'as is' basis. PROYAX makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        <p>While we strive to maintain accuracy, PROYAX does not guarantee that all content is error-free or completely representative of the actual examination.</p>

        <h4>8. Limitation of Liability</h4>
        <p>In no event shall PROYAX or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the platform, even if PROYAX or an authorized representative has been notified of the possibility of such damage.</p>

        <h4>9. Accuracy of Materials</h4>
        <p>The materials appearing on the PROYAX platform could include technical, typographical, or photographic errors. PROYAX does not warrant that any of the materials on the platform are accurate, complete, or current. PROYAX may make changes to the materials contained on the platform at any time without notice.</p>

        <h4>10. Links</h4>
        <p>PROYAX has not reviewed all of the sites linked to its platform and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by PROYAX of the site. Use of any such linked website is at the user's own risk.</p>

        <h4>11. Modifications</h4>
        <p>PROYAX may revise these terms for the platform at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms.</p>

        <h4>12. Subscription and Billing</h4>
        <p>If your account includes a subscription plan, you agree to pay the fees associated with your subscription. Subscriptions are non-refundable. PROYAX reserves the right to modify subscription plans and pricing with 30 days' notice.</p>

        <h4>13. Governing Law</h4>
        <p>These terms and conditions are governed by and construed in accordance with the laws of Assam, India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>

        <h4>14. Contact Information</h4>
        <p>If you have any questions about these Terms and Conditions, please contact us through the support section of the platform.</p>
      `;

      const privacyContent = `
        <h3>Privacy Policy</h3>
        <p>Last updated: February 2026</p>

        <h4>Introduction</h4>
        <p>PROYAX ("we", "us", "our", or "the Company") operates the PROYAX Mock Test Platform. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.</p>

        <h4>1. Information Collection and Use</h4>
        <p>We collect several different types of information for various purposes to provide and improve our platform.</p>

        <h5>Types of Data Collected:</h5>
        <ul>
          <li><strong>Personal Data:</strong> While using our service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include:
            <ul>
              <li>Username and password</li>
              <li>Email address</li>
              <li>First and last name</li>
              <li>Phone number</li>
              <li>Cookies and usage data</li>
            </ul>
          </li>
          <li><strong>Academic Data:</strong> We collect information about your test attempts, responses, scores, and performance analytics to provide you with results and progress tracking.</li>
          <li><strong>Technical Data:</strong> Device information, IP address, browser type, pages visited, time and date of visit, and referring website.</li>
        </ul>

        <h4>2. Use of Data</h4>
        <p>PROYAX uses the collected data for various purposes:</p>
        <ul>
          <li>To provide and maintain the platform</li>
          <li>To notify you about changes to the platform</li>
          <li>To allow you to participate in interactive features of the platform</li>
          <li>To provide customer support</li>
          <li>To gather analysis and analytics to improve the platform</li>
          <li>To monitor the usage of the platform</li>
          <li>To detect, prevent, and address technical issues and fraudulent activity</li>
          <li>To provide you with news, special offers, and general information about our services</li>
        </ul>

        <h4>3. Security of Data</h4>
        <p>The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>

        <h4>4. Cookies and Tracking</h4>
        <p>The platform uses cookies to enhance your experience. A cookie is a file containing an identifier (a series of letters and numbers) that is sent by a web server to a web browser and is stored by the browser. We use cookies for:</p>
        <ul>
          <li>Authentication and session management</li>
          <li>Remembering user preferences</li>
          <li>Analyzing usage patterns and improving the platform</li>
        </ul>
        <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.</p>

        <h4>5. Third-Party Services</h4>
        <p>Our platform integrates with Google Firebase for authentication and data storage. Firebase has its own privacy policy governing how it handles your data. We encourage you to review their privacy policy at https://www.google.com/policies/privacy/</p>

        <h4>6. Data Retention</h4>
        <p>PROYAX will retain your Personal Data and Academic Data for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy. You may request deletion of your data at any time, subject to legal and contractual obligations.</p>

        <h4>7. Your Rights</h4>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate personal data</li>
          <li>Request deletion of your data (Right to be Forgotten)</li>
          <li>Withdraw consent for data processing</li>
          <li>Data portability</li>
        </ul>
        <p>To exercise these rights, please contact our support team through the platform.</p>

        <h4>8. Children Privacy</h4>
        <p>Our platform is not intended for individuals under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information as quickly as possible.</p>

        <h4>9. Changes to This Privacy Policy</h4>
        <p>PROYAX may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date. You are advised to review this privacy policy periodically for any changes.</p>

        <h4>10. Contact Us</h4>
        <p>If you have any questions about this Privacy Policy, please contact us:</p>
        <ul>
          <li>By email through the support section of the platform</li>
          <li>Through the contact form available in the platform</li>
        </ul>

        <h4>11. Compliance</h4>
        <p>This Privacy Policy complies with applicable data protection regulations including relevant Indian data protection laws. We are committed to protecting your privacy and ensuring you have a positive experience on our platform.</p>
      `;

      // Tab switching
      legalTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const tabName = tab.dataset.tab;

          // Remove active class from all tabs
          legalTabs.forEach((t) => t.classList.remove("active"));

          // Add active class to clicked tab
          tab.classList.add("active");

          // Update content
          if (tabName === "terms") {
            document.getElementById("legal-title").textContent =
              "Terms & Conditions";
            legalBody.innerHTML = termsContent;
          } else if (tabName === "privacy") {
            document.getElementById("legal-title").textContent =
              "Privacy Policy";
            legalBody.innerHTML = privacyContent;
          }
        });
      });

      // Open modal from links
      privacyLink.addEventListener("click", (e) => {
        e.preventDefault();
        legalModal.style.display = "flex";
        document.getElementById("legal-title").textContent = "Privacy Policy";
        const privacyTab = document.querySelector('[data-tab="privacy"]');
        if (privacyTab) {
          legalTabs.forEach((t) => t.classList.remove("active"));
          privacyTab.classList.add("active");
          legalBody.innerHTML = privacyContent;
        }
      });

      termsLink.addEventListener("click", (e) => {
        e.preventDefault();
        legalModal.style.display = "flex";
        document.getElementById("legal-title").textContent =
          "Terms & Conditions";
        const termsTab = document.querySelector('[data-tab="terms"]');
        if (termsTab) {
          legalTabs.forEach((t) => t.classList.remove("active"));
          termsTab.classList.add("active");
          legalBody.innerHTML = termsContent;
        }
      });

      // Close modal
      legalClose.addEventListener("click", () => {
        legalModal.style.display = "none";
      });

      // Close modal when clicking outside
      legalModal.addEventListener("click", (e) => {
        if (e.target === legalModal) {
          legalModal.style.display = "none";
        }
      });

      // Live summary updater (keeps side panel counts current)
      function updateLiveSummary() {
        if (!liveSummaryEl || !questions || !responses) return;
        const subjects = {};
        questions.forEach((q, idx) => {
          const subj =
            q.subject || q.syllabus || q.section || q.topic || "General";
          if (!subjects[subj])
            subjects[subj] = { attempted: 0, marked: 0, unattempted: 0 };
          const r = responses[idx] || {};
          if (r.choiceIndex != null) subjects[subj].attempted++;
          else subjects[subj].unattempted++;
          if (r.markedReview) subjects[subj].marked++;
        });

        const map = [
          { key: "Physics", ids: ["phy-attempted", "phy-marked", "phy-un"] },
          {
            key: "Chemistry",
            ids: ["chem-attempted", "chem-marked", "chem-un"],
          },
          {
            key: "Mathematics",
            ids: ["math-attempted", "math-marked", "math-un"],
          },
        ];

        map.forEach((m) => {
          const data = subjects[m.key] || {
            attempted: 0,
            marked: 0,
            unattempted: 0,
          };
          m.ids &&
            m.ids.forEach((id, i) => {
              const el = document.getElementById(id);
              if (!el) return;
              if (i === 0) el.textContent = data.attempted;
              if (i === 1) el.textContent = data.marked;
              if (i === 2) el.textContent = data.unattempted;
            });
        });
      }

      // periodic refresh (also called by other flows if needed)
      setInterval(updateLiveSummary, 1500);

      const historyOverlay = document.getElementById("history-overlay");
      const historyGrid = document.getElementById("history-grid");
      const closeHistory = document.getElementById("close-history");
      const pyqsOverlay = document.getElementById("pyqs-overlay");
      const pyqsGrid = document.getElementById("pyqs-grid");
      const pyqImageModal = document.getElementById("pyq-image-modal");
      const pyqImagePreview = document.getElementById("pyq-image-preview");
      const pyqImageEmpty = document.getElementById("pyq-image-empty");
      const pyqImageClose = document.getElementById("pyq-image-close");

      const detailOverlay = document.getElementById("detail-overlay");
      const closeDetail = document.getElementById("close-detail");
      const questionImageModal = document.getElementById("question-image-modal");
      const questionImagePreview = document.getElementById("question-image-preview");
      const questionImageEmpty = document.getElementById("question-image-empty");

      // Confirm modal refs
      const confirmModal = document.getElementById("confirm-submit-modal");
      const confirmAttempted = document.getElementById("confirm-attempted");
      const confirmLeft = document.getElementById("confirm-left");
      const confirmRemaining = document.getElementById("confirm-remaining");
      const confirmSubjectBreakdown = document.getElementById(
        "confirm-subject-breakdown",
      );
      const confirmYes = document.getElementById("confirm-submit-yes");
      const confirmNo = document.getElementById("confirm-submit-no");

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
      const MAX_ATTEMPTS_PER_MOCK = 3;
      let currentUser = null;
      let mocksList = [];
      let mockAttemptCountMap = {};
      let mockAttemptDocsMap = {};
      let currentMockId = null;
      let currentMockName = "";
      let sectionMap = null;
      let totalDurationSec = 0; // <-- total test duration in seconds (used for countdown)
      const TIMER_RING_CIRCUMFERENCE = 2 * Math.PI * 18;
      function updateHeaderMockTitle() {
        if (!headerMockTitleEl) return;
        headerMockTitleEl.textContent = currentMockName || "CEE Mock Test";
      }

      // utilities
      function fmtH(sec) {
        const h = Math.floor(sec / 3600),
          m = Math.floor((sec % 3600) / 60),
          s = sec % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      }
      function fmtMS(sec) {
        const m = Math.floor(sec / 60),
          s = sec % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      }
      function updateTimerRing(remainingSec, durationSec) {
        if (!timerRingFill) return;
        if (!durationSec || durationSec <= 0) {
          timerRingFill.style.strokeDasharray = `${TIMER_RING_CIRCUMFERENCE}`;
          timerRingFill.style.strokeDashoffset = `${TIMER_RING_CIRCUMFERENCE}`;
          return;
        }
        const ratio = Math.max(0, Math.min(1, remainingSec / durationSec));
        const offset = TIMER_RING_CIRCUMFERENCE * (1 - ratio);
        timerRingFill.style.strokeDasharray = `${TIMER_RING_CIRCUMFERENCE}`;
        timerRingFill.style.strokeDashoffset = `${offset}`;
      }
      function requestAppFullscreen() {
        try {
          if (document.fullscreenElement) return;
          const root = document.documentElement;
          if (root && typeof root.requestFullscreen === "function") {
            root.requestFullscreen().catch(() => {});
          }
        } catch (_) {
          // ignore fullscreen errors
        }
      }
      function exitAppFullscreen() {
        try {
          if (!document.fullscreenElement) return;
          if (typeof document.exitFullscreen === "function") {
            document.exitFullscreen().catch(() => {});
          }
        } catch (_) {
          // ignore fullscreen errors
        }
      }
      function letterToIndex(letter) {
        if (letter == null) return null;
        const l = String(letter).trim().toUpperCase();
        if (l === "A") return 0;
        if (l === "B") return 1;
        if (l === "C") return 2;
        if (l === "D") return 3;
        return null;
      }

      function parseTruthyFlag(value) {
        if (value === true || value === 1) return true;
        const normalized = String(value == null ? "" : value)
          .trim()
          .toLowerCase();
        return ["true", "1", "yes", "y"].includes(normalized);
      }

      async function getPyqsAccessFromMocksUsers(emailCandidates) {
        if (!db || !Array.isArray(emailCandidates) || !emailCandidates.length) {
          return false;
        }
        try {
          for (const candidateEmail of emailCandidates) {
            const snap = await db
              .collection("mocks_users")
              .where("email", "==", candidateEmail)
              .limit(1)
              .get()
              .catch(() => null);
            if (snap && !snap.empty) {
              const row = snap.docs[0].data() || {};
              return parseTruthyFlag(row.pyqs);
            }
          }

          const normalizedCandidates = emailCandidates.map((v) =>
            String(v || "")
              .trim()
              .toLowerCase(),
          );
          const fallback = await db
            .collection("mocks_users")
            .limit(500)
            .get()
            .catch(() => null);
          if (fallback && !fallback.empty) {
            const found = fallback.docs.find((d) => {
              const de = String((d.data() && d.data().email) || "")
                .trim()
                .toLowerCase();
              return normalizedCandidates.includes(de);
            });
            if (found) {
              const row = found.data() || {};
              return parseTruthyFlag(row.pyqs);
            }
          }
        } catch (e) {
          console.warn("pyqs access lookup failed", e);
        }
        return false;
      }

      function normalizeImgUrl(u) {
        if (!u) return null;
        const s = String(u).trim();
        if (!s) return null;
        if (/^https?:\/\//i.test(s)) return s;
        if (/^\/\//.test(s)) return location.protocol + s;
        if (s.startsWith("/")) return s;
        return "./" + s.replace(/^\.?\//, "");
      }

      function findImageFromDoc(obj) {
        if (!obj) return null;
        const keys = [
          "img",
          "image",
          "imageUrl",
          "image_url",
          "image_link",
          "imageLink",
          "img_p",
          "img_p1",
          "img1",
          "url",
          "link",
        ];
        for (const k of keys) {
          if (
            Object.prototype.hasOwnProperty.call(obj, k) &&
            obj[k] != null &&
            String(obj[k]).trim() !== ""
          )
            return normalizeImgUrl(obj[k]);
        }
        for (const k of Object.keys(obj)) {
          if (/img/i.test(k) || /image/i.test(k)) {
            const v = obj[k];
            if (v && String(v).trim() !== "") return normalizeImgUrl(v);
          }
        }
        return null;
      }

      function sampleBank() {
        const secs = ["Physics", "Chemistry", "Mathematics"];
        const out = [];
        secs.forEach((sec) => {
          for (let i = 1; i <= 20; i++) {
            out.push({
              id: sec[0] + i,
              section: sec,
              text: `Sample ${sec} question ${i}`,
              options: ["A", "B", "C", "D"],
              answerIndex: Math.floor(Math.random() * 4),
              img: null,
            });
          }
        });
        return out;
      }

      function escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/[&<>"']/g, function (m) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[m];
        });
      }

      // new helper: format Date (date-only). Handles Firestore Timestamp and ISO/string fallback
      function formatDateOnly(field) {
        if (!field) return "-";
        try {
          // Firestore Timestamp object
          if (field.toDate && typeof field.toDate === "function") {
            const d = field.toDate();
            return d.toLocaleDateString();
          }
          // ISO string or Date-like
          const dt = new Date(field);
          if (!isNaN(dt.getTime())) return dt.toLocaleDateString();
          // fallback to raw string trimmed (show only date part if includes T)
          const s = String(field);
          if (s.indexOf("T") > 0) return s.split("T")[0];
          return s;
        } catch (e) {
          return String(field);
        }
      }

      function getMockUnlockTimeMs(dateField) {
        if (!dateField) return null;
        try {
          let baseDate = null;
          if (dateField.toDate && typeof dateField.toDate === "function") {
            baseDate = dateField.toDate();
          } else if (
            typeof dateField === "object" &&
            typeof dateField.seconds === "number"
          ) {
            baseDate = new Date(dateField.seconds * 1000);
          } else {
            const raw = String(dateField).trim();
            const normalized = raw.replace(
              /\b(\d{1,2})(st|nd|rd|th)\b/gi,
              "$1",
            );
            const parsed = new Date(normalized);
            if (!isNaN(parsed.getTime())) baseDate = parsed;
          }
          if (!baseDate || isNaN(baseDate.getTime())) return null;
          const unlock = new Date(baseDate);
          unlock.setHours(6, 0, 0, 0);
          return unlock.getTime();
        } catch (e) {
          return null;
        }
      }

      function isMockAvailableNowByDate(mock) {
        const unlockMs = getMockUnlockTimeMs(mock && mock.date);
        if (unlockMs == null) return true;
        return Date.now() >= unlockMs;
      }

      function formatUnlockDateTime(dateField) {
        const unlockMs = getMockUnlockTimeMs(dateField);
        if (unlockMs == null) return "6:00 AM";
        return new Date(unlockMs).toLocaleString();
      }

      function findSyllabusFromDoc(m) {
        // Try several common fields
        if (!m) return "";
        return m.syllabus || m.syl || m.desc || m.description || m.notes || "";
      }

      function getMockNameFromId(mockId) {
        if (!mockId) return "Mock";
        const found = Array.isArray(mocksList)
          ? mocksList.find((m) => String(m.id) === String(mockId))
          : null;
        return String((found && (found.name || found.id)) || mockId).trim();
      }

      function setLoginMiddleMode(showWelcomeCards) {
        if (loginScreen)
          loginScreen.classList.toggle("post-login-active", !!showWelcomeCards);
        if (loginGrid) loginGrid.style.display = "grid";
        if (loginCountdownCard)
          loginCountdownCard.style.display = showWelcomeCards ? "none" : "";
        if (loginFormPane)
          loginFormPane.style.display = showWelcomeCards ? "none" : "";
        if (loginFeaturesPane)
          loginFeaturesPane.style.display = showWelcomeCards ? "none" : "";
        if (postLoginScreen) {
          postLoginScreen.style.display = showWelcomeCards ? "flex" : "none";
          postLoginScreen.setAttribute(
            "aria-hidden",
            showWelcomeCards ? "false" : "true",
          );
        }
      }

      function enterMainApp(fromPane) {
        setLoginMiddleMode(false);
        loginScreen.style.display = "none";
        appEl.setAttribute("aria-hidden", "false");

        if (fromPane === "mocks") {
          if (startModal) startModal.style.display = "flex";
        }
        if (fromPane === "results") openResultsWindow();
        if (fromPane === "pyqs") openPyqsWindow();
      }

      function returnToHomeView() {
        if (startModal) startModal.style.display = "none";
        if (historyOverlay) historyOverlay.style.display = "none";
        if (pyqsOverlay) pyqsOverlay.style.display = "none";
        if (detailOverlay) detailOverlay.style.display = "none";
        closeQuestionImageModal();
        closePyqImageModal();
        appEl.setAttribute("aria-hidden", "true");
        loginScreen.style.display = "flex";
        setLoginMiddleMode(!!currentUser);
      }

      // UI init
      appEl.setAttribute("aria-hidden", "true");
      loginScreen.style.display = "flex";
      setLoginMiddleMode(false);
      // ensure badge hidden by default
      userBadge.style.display = "none";
      userNameEl.textContent = "Not signed in";
      if (userEmailEl) userEmailEl.textContent = "-";
      globalTimer.textContent = "00:00:00";
      updateTimerRing(0, 0);
      updateHeaderMockTitle();

      // login (no guest/demo option)
      document
        .getElementById("login-form")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          loginError.textContent = "";

          const email = (loginUsername.value || "").trim();
          const p = loginPassword.value || "";

          if (!email || !p) {
            loginError.textContent = "enter credentials";
            return;
          }

          if (!auth) {
            loginError.textContent = "auth not configured";
            return;
          }

          loginError.textContent = "checking...";
          showLoadingOverlay("Checking credentials");

          try {
            // attempt sign in via Firebase Authentication
            const userCredential = await auth.signInWithEmailAndPassword(
              email,
              p,
            );
            const user = userCredential.user;
            const loginEmail = String((user && user.email) || email || "").trim();
            const emailCandidates = [
              ...new Set(
                [loginEmail, loginEmail.toLowerCase(), email, email.toLowerCase()]
                  .map((v) => String(v || "").trim())
                  .filter(Boolean),
              ),
            ];

            // fetch extra profile data from Firestore if available
            let data = {};
            let mockUsersData = {};
            let foundMatchingUserDoc = false;
            if (db) {
              // lookup profile/subscription in mock_admins + mocks_users by logged-in email
              const mockUserCollections = ["mock_admins", "mocks_users"];
              for (const coll of mockUserCollections) {
                for (const candidateEmail of emailCandidates) {
                  const mockUsersSnap = await db
                    .collection(coll)
                    .where("email", "==", candidateEmail)
                    .limit(1)
                    .get()
                    .catch(() => null);
                  if (mockUsersSnap && !mockUsersSnap.empty) {
                    mockUsersData = mockUsersSnap.docs[0].data() || {};
                    foundMatchingUserDoc = true;
                    break;
                  }
                }
                if (foundMatchingUserDoc) break;
              }

              // fallback: scan a limited set and compare normalized email
              if (!foundMatchingUserDoc) {
                const normalizedCandidates = emailCandidates.map((v) =>
                  String(v || "")
                    .trim()
                    .toLowerCase(),
                );
                for (const coll of mockUserCollections) {
                  const fallbackSnap = await db
                    .collection(coll)
                    .limit(500)
                    .get()
                    .catch(() => null);
                  if (!fallbackSnap || fallbackSnap.empty) continue;
                  const found = fallbackSnap.docs.find((d) => {
                    const de = String((d.data() && d.data().email) || "")
                      .trim()
                      .toLowerCase();
                    return normalizedCandidates.includes(de);
                  });
                  if (found) {
                    mockUsersData = found.data() || {};
                    foundMatchingUserDoc = true;
                    break;
                  }
                }
              }

              // existing user profile lookup (kept for username/subscription fallback)
              const docSnap = await db.collection("users").doc(user.uid).get();
              if (docSnap.exists) {
                data = docSnap.data();
              } else {
                const snap = await db
                  .collection("users")
                  .where("email", "==", email)
                  .limit(1)
                  .get();
                if (!snap.empty) {
                  data = snap.docs[0].data();
                }
              }
            }

            const fullName = String(mockUsersData.name || data.name || "").trim();

            // ✅ set current user with subscription
            currentUser = {
              username: String(
                mockUsersData.username || data.username || email || "",
              ).trim(),
              email: ((user && user.email) || email || "").trim(),
              name: fullName || "User",
              subscription: String(
                mockUsersData.subscription || data.subscription || "",
              )
                .trim()
                .toLowerCase(),
              pyqsEnabled: await getPyqsAccessFromMocksUsers(emailCandidates),
            };

            // ✅ apply logo / branding based on subscription
            applySubscriptionBranding(currentUser.subscription);

            onLoggedIn();
          } catch (e) {
            console.error(e);
            loginError.textContent = e.message || "login failed";
          } finally {
            hideLoadingOverlay();
          }
        });

      async function restoreCurrentUserFromAuth(authUser) {
        if (!authUser) return null;

        const email = String((authUser && authUser.email) || "").trim();
        const emailCandidates = [
          ...new Set(
            [email, email.toLowerCase()]
              .map((v) => String(v || "").trim())
              .filter(Boolean),
          ),
        ];
        let data = {};
        let mockUsersData = {};
        let foundMatchingUserDoc = false;

        if (db) {
          const mockUserCollections = ["mock_admins", "mocks_users"];
          for (const coll of mockUserCollections) {
            for (const candidateEmail of emailCandidates) {
              const mockUsersSnap = await db
                .collection(coll)
                .where("email", "==", candidateEmail)
                .limit(1)
                .get()
                .catch(() => null);
              if (mockUsersSnap && !mockUsersSnap.empty) {
                mockUsersData = mockUsersSnap.docs[0].data() || {};
                foundMatchingUserDoc = true;
                break;
              }
            }
            if (foundMatchingUserDoc) break;
          }

          if (!foundMatchingUserDoc) {
            const fallbackSnap = await db
              .collection("users")
              .doc(authUser.uid)
              .get()
              .catch(() => null);
            if (fallbackSnap && fallbackSnap.exists) {
              data = fallbackSnap.data() || {};
            } else if (email) {
              const byEmail = await db
                .collection("users")
                .where("email", "==", email)
                .limit(1)
                .get()
                .catch(() => null);
              if (byEmail && !byEmail.empty) {
                data = byEmail.docs[0].data() || {};
              }
            }
          } else {
            const userDoc = await db
              .collection("users")
              .doc(authUser.uid)
              .get()
              .catch(() => null);
            if (userDoc && userDoc.exists) {
              data = userDoc.data() || {};
            }
          }
        }

        const fullName = String(mockUsersData.name || data.name || "").trim();
        return {
          username: String(
            mockUsersData.username || data.username || email || "",
          ).trim(),
          email,
          name: fullName || "User",
          subscription: String(
            mockUsersData.subscription || data.subscription || "",
          )
            .trim()
            .toLowerCase(),
          pyqsEnabled: await getPyqsAccessFromMocksUsers(emailCandidates),
        };
      }

      if (auth && typeof auth.onAuthStateChanged === "function") {
        auth.onAuthStateChanged(async (user) => {
          if (!user || currentUser) return;
          if (loginError) loginError.textContent = "";
          showLoadingOverlay("Restoring session");
          try {
            const restoredUser = await restoreCurrentUserFromAuth(user);
            if (!restoredUser) return;
            currentUser = restoredUser;
            applySubscriptionBranding(currentUser.subscription);
            onLoggedIn();
          } catch (e) {
            console.warn("session restore failed", e);
          } finally {
            hideLoadingOverlay();
          }
        });
      }

      function onLoggedIn() {
        const hasPyqsAccess = !!(currentUser && currentUser.pyqsEnabled);
        if (postLoginPyqsBtn) {
          postLoginPyqsBtn.classList.toggle("pyqs-locked", !hasPyqsAccess);
          postLoginPyqsBtn.disabled = !hasPyqsAccess;
          postLoginPyqsBtn.setAttribute(
            "aria-disabled",
            !hasPyqsAccess ? "true" : "false",
          );
          if (!hasPyqsAccess) {
            postLoginPyqsBtn.setAttribute("data-mrp", "MRP 199/-");
            postLoginPyqsBtn.title = "Unlock PYQs access";
          } else {
            postLoginPyqsBtn.removeAttribute("data-mrp");
            postLoginPyqsBtn.removeAttribute("title");
          }
        }

        // show attractive badge
        userNameEl.textContent =
          currentUser.name || currentUser.username || "User";
        if (userEmailEl) {
          userEmailEl.textContent = currentUser.email || "-";
        }
        userBadge.style.display = "flex";

        // keep same header/footer; replace center content with greeting + cards
        loginScreen.style.display = "flex";
        appEl.setAttribute("aria-hidden", "true");
        if (postLoginGreeting) {
          postLoginGreeting.textContent = `Hello, ${currentUser.name || "User"}`;
        }
        setLoginMiddleMode(true);
        loadMocks();
      }

      if (postLoginMocksBtn) {
        postLoginMocksBtn.addEventListener("click", () => {
          enterMainApp("mocks");
        });
      }

      if (postLoginResultsBtn) {
        postLoginResultsBtn.addEventListener("click", () => {
          enterMainApp("results");
        });
      }

      if (postLoginProfileBtn) {
        postLoginProfileBtn.addEventListener("click", openProfileModal);
      }

      if (postLoginPyqsBtn) {
        postLoginPyqsBtn.addEventListener("click", () => {
          if (!(currentUser && currentUser.pyqsEnabled)) {
            alert("PYQs is locked for your account. Contact admin. MRP 199/-");
            return;
          }
          enterMainApp("pyqs");
        });
      }

      if (profileModalCloseBtn) {
        profileModalCloseBtn.addEventListener("click", closeProfileModal);
      }

      if (profileCancelBtn) {
        profileCancelBtn.addEventListener("click", closeProfileModal);
      }

      if (profileModal) {
        profileModal.addEventListener("click", (e) => {
          if (e.target === profileModal) closeProfileModal();
        });
      }

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && pyqImageModal && pyqImageModal.style.display === "flex") {
          closePyqImageModal();
          return;
        }
        if (e.key === "Escape" && pyqsOverlay && pyqsOverlay.style.display === "flex") {
          returnToHomeView();
          return;
        }
        if (e.key === "Escape" && profileModal && profileModal.style.display === "flex") {
          closeProfileModal();
          return;
        }

        const target = e.target;
        const tag = target && target.tagName ? target.tagName.toLowerCase() : "";
        const isEditable =
          (target && target.isContentEditable) ||
          tag === "input" ||
          tag === "textarea" ||
          tag === "select";
        if (isEditable) return;

        if (!testStarted || submittedAlready) return;
        if (confirmModal && confirmModal.style.display === "flex") return;

        const key = (e.key || "").toLowerCase();

        // Prev / Next navigation
        if (!e.ctrlKey && !e.altKey && !e.shiftKey && key === "arrowleft") {
          e.preventDefault();
          prevBtn.click();
          return;
        }
        if (!e.ctrlKey && !e.altKey && !e.shiftKey && key === "arrowright") {
          e.preventDefault();
          nextBtn.click();
          return;
        }

        // Option selection: A / B / C / D
        if (!e.ctrlKey && !e.altKey && !e.shiftKey && ["a", "b", "c", "d"].includes(key)) {
          e.preventDefault();
          const idx = { a: 0, b: 1, c: 2, d: 3 }[key];
          if (typeof idx === "number" && responses[current]) {
            recordQuestionTimeStop(current);
            responses[current].choiceIndex = idx;
            responses[current].markedReview = false;
            renderQuestion();
            renderPicker(getSectionOfIndex(current));
            recordQuestionTimeStart(current);
          }
          return;
        }

        // Mark for review: M
        if (!e.ctrlKey && !e.altKey && !e.shiftKey && key === "m") {
          e.preventDefault();
          markReviewBtn.click();
          return;
        }

        // Clear: X
        if (!e.ctrlKey && !e.altKey && !e.shiftKey && key === "x") {
          e.preventDefault();
          clearBtn.click();
          return;
        }

        // Submit: Ctrl+S
        if (e.ctrlKey && !e.altKey && !e.shiftKey && key === "s") {
          e.preventDefault();
          submitBtn.click();
        }
      });

      if (profileForm) {
        profileForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const nextName = String((profileNameInput && profileNameInput.value) || "").trim();
          const nextUsername = String((profileUsernameInput && profileUsernameInput.value) || "").trim();

          if (!nextName || !nextUsername) {
            profileFormMsg.textContent = "Please fill name and username.";
            return;
          }

          profileFormMsg.textContent = "Saving...";
          showLoadingOverlay("Updating profile");
          try {
            await saveProfileDetails(nextName, nextUsername);
            profileFormMsg.textContent = "Profile updated successfully.";
            setTimeout(() => {
              closeProfileModal();
            }, 300);
          } catch (err) {
            console.error(err);
            profileFormMsg.textContent = (err && err.message) || "Unable to update profile.";
          } finally {
            hideLoadingOverlay();
          }
        });
      }

      function formatProfileDate(field) {
        if (!field) return "-";
        try {
          let d = null;
          if (field && typeof field.toDate === "function") {
            d = field.toDate();
          } else if (typeof field === "object" && typeof field.seconds === "number") {
            d = new Date(field.seconds * 1000);
          } else if (typeof field === "string") {
            const parsed = new Date(field);
            if (!isNaN(parsed.getTime())) d = parsed;
            else return field;
          }
          if (!d || isNaN(d.getTime())) return String(field || "-");
          return d.toLocaleString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
          });
        } catch (e) {
          return String(field || "-");
        }
      }

      async function getMockUserProfileByEmail(email) {
        if (!db || !email) return null;
        const normalizedEmail = String(email).trim().toLowerCase();
        const collections = ["mock_admins", "mocks_users"];
        for (const collectionName of collections) {
          const snap = await db
            .collection(collectionName)
            .where("email", "==", normalizedEmail)
            .limit(1)
            .get()
            .catch(() => null);
          if (snap && !snap.empty) {
            return {
              collection: collectionName,
              doc: snap.docs[0],
              data: snap.docs[0].data() || {},
            };
          }
        }
        return null;
      }

      async function openProfileModal() {
        if (!profileModal || !profileNameInput || !profileEmailInput || !profileUsernameInput || !profileRegisteredOnInput) return;
        profileFormMsg.textContent = "";
        profileNameInput.value = String((currentUser && currentUser.name) || "").trim();
        profileEmailInput.value = String((currentUser && currentUser.email) || "").trim();
        profileUsernameInput.value = String((currentUser && currentUser.username) || "").trim();
        profileRegisteredOnInput.value = "-";

        const knownEmail = String((currentUser && currentUser.email) || "").trim().toLowerCase();
        if (knownEmail) {
          const profile = await getMockUserProfileByEmail(knownEmail);
          if (profile && profile.data) {
            const d = profile.data;
            profileNameInput.value = String((d.name || currentUser.name || "")).trim();
            profileEmailInput.value = String((d.email || knownEmail || "")).trim();
            profileUsernameInput.value = String((d.username || currentUser.username || "")).trim();
            profileRegisteredOnInput.value = formatProfileDate(d.createdAt);
            currentUser.name = profileNameInput.value || currentUser.name;
            currentUser.email = String(profileEmailInput.value || currentUser.email).trim();
            currentUser.username = profileUsernameInput.value || currentUser.username;
          }
        }

        profileModal.style.display = "flex";
        profileModal.setAttribute("aria-hidden", "false");
        setTimeout(() => profileNameInput.focus(), 20);
      }

      function closeProfileModal() {
        if (!profileModal) return;
        profileModal.style.display = "none";
        profileModal.setAttribute("aria-hidden", "true");
      }

      async function saveProfileDetails(nextName, nextUsername) {
        if (!db) throw new Error("Database not configured");
        const normalizedName = String(nextName || "").trim();
        const normalizedUsername = String(nextUsername || "").trim();
        const normalizedEmail = String((currentUser && currentUser.email) || (profileEmailInput && profileEmailInput.value) || "").trim().toLowerCase();

        if (!normalizedName) throw new Error("Please enter a valid name");
        if (!normalizedUsername) throw new Error("Please enter a valid username");
        if (!normalizedEmail || !normalizedEmail.includes("@")) {
          throw new Error("Missing user email");
        }

        const profile = await getMockUserProfileByEmail(normalizedEmail);
        const payload = {
          name: normalizedName,
          username: normalizedUsername,
          email: normalizedEmail,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        if (profile && profile.doc) {
          await profile.doc.ref.update(payload);
        } else {
          await db.collection("mocks_users").add({
            ...payload,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }

        currentUser.name = normalizedName;
        currentUser.email = normalizedEmail;
        currentUser.username = normalizedUsername;

        if (postLoginGreeting) {
          postLoginGreeting.textContent = `Hello, ${normalizedName}`;
        }
        if (userNameEl) {
          userNameEl.textContent = normalizedName;
        }
        if (userEmailEl) {
          userEmailEl.textContent = normalizedEmail;
        }
      }

      function handleLogout() {
        if (
          testStarted &&
          !submittedAlready &&
          !confirm("Discard running test?")
        )
          return;
        // sign out from Firebase auth if available
        if (auth) {
          auth.signOut().catch(() => {});
        }
        closeProfileModal();
        currentUser = null;
        applySubscriptionBranding(null);
        setLoginMiddleMode(false);
        userBadge.style.display = "none";
        userNameEl.textContent = "Not signed in";
        if (userEmailEl) userEmailEl.textContent = "-";
        testStarted = false;
        // Hide status dot on logout
        const statusDot = document.getElementById("status-dot");
        if (statusDot) statusDot.style.display = "none";
        submittedAlready = false;
        if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
        stopGlobalTimer();
        totalDurationSec = 0;
        globalTimer.textContent = "00:00:00";
        updateTimerRing(0, 0);
        questions = sampleBank();
        responses = questions.map(() => ({
          choiceIndex: null,
          marked: false,
          timeUsed: 0,
          viewed: false,
        }));
        questionTimers = questions.map(() => null);
        current = 0;
        renderQuestion();
        renderPicker("Physics");
        loginScreen.style.display = "flex";
        setLoginMiddleMode(false);
        appEl.setAttribute("aria-hidden", "true");
        currentMockId = null;
        currentMockName = "";
        updateHeaderMockTitle();
      }

      if (postLoginLogoutBtn) {
        postLoginLogoutBtn.addEventListener("click", handleLogout);
      }

      /* ========== mocks ========== */
      async function getMockAttemptCount(mockId) {
        if (!db || !currentUser) return 0;
        try {
          const snap = await db
            .collection("results")
            .where("username", "==", currentUser.username)
            .where("mockId", "==", mockId)
            .get();
          return snap.size || 0;
        } catch (e) {
          console.warn("attempt count lookup failed", e);
          return 0;
        }
      }

      async function loadMocks() {
        mocksContainer.innerHTML = `<div style="padding:8px;color:${getComputedStyle(document.documentElement).getPropertyValue("--muted") || "#666"}">Loading...</div>`;
        if (!db) {
          mocksList = [
            {
              id: "local-1",
              name: "Mock 1",
              time: "120",
              qns: "60",
              syllabus: "Full CEE",
              active: "yes",
              date: new Date().toISOString(),
              img_p1: "https://via.placeholder.com/600x360?text=P1",
              ans_p1: "A",
              img_c1: "https://via.placeholder.com/600x360?text=C1",
              ans_c1: "B",
              img_m1: "https://via.placeholder.com/600x360?text=M1",
              ans_m1: "C",
            },
            {
              id: "local-2",
              name: "Mock 2 (Archived)",
              time: "90",
              qns: "30",
              syllabus: "Physics only",
              active: "no",
              date: null,
            },
          ];
          await renderMocks();
          return;
        }
        try {
          const snap = await db.collection("mocks").orderBy("name").get();

          const normalizeSub = (v) =>
            String(v || "")
              .trim()
              .toLowerCase();
          const userSub = normalizeSub(currentUser && currentUser.subscription);

          mocksList = snap.docs
            .map((d) => Object.assign({ id: d.id }, d.data()))
            .filter((m) => {
              const mockSub = normalizeSub(m.subscription);
              return mockSub === userSub;
            });
        } catch (e) {
          console.warn(e);
          mocksList = [
            {
              id: "err",
              name: "No mocks",
              syllabus: "See console",
              active: "no",
            },
          ];
        }
        await renderMocks();
      }

      async function renderMocks() {
        mocksContainer.innerHTML = "";
        mockAttemptCountMap = {};
        mockAttemptDocsMap = {};
        if (currentUser && db) {
          const rows = await Promise.all(
            mocksList.map(async (m) => {
              const snap = await db
                .collection("results")
                .where("username", "==", currentUser.username)
                .where("mockId", "==", m.id)
                .get();
              const docs = snap.docs.slice().sort((a, b) => {
                const ad = a.data() || {};
                const bd = b.data() || {};
                const av =
                  ad.date && typeof ad.date.toDate === "function"
                    ? ad.date.toDate().getTime()
                    : Date.parse(ad.date || 0) || 0;
                const bv =
                  bd.date && typeof bd.date.toDate === "function"
                    ? bd.date.toDate().getTime()
                    : Date.parse(bd.date || 0) || 0;
                return av - bv;
              });
              return [m.id, docs];
            }),
          );
          mockAttemptDocsMap = Object.fromEntries(rows);
          Object.keys(mockAttemptDocsMap).forEach((mockId) => {
            mockAttemptCountMap[mockId] = mockAttemptDocsMap[mockId].length;
          });
        }
        for (const m of mocksList) {
          const isActive = isMockAvailableNowByDate(m);
          const attemptsUsed = Number(mockAttemptCountMap[m.id] || 0);
          const attemptsLeft = Math.max(
            0,
            MAX_ATTEMPTS_PER_MOCK - attemptsUsed,
          );
          const exhausted = attemptsLeft <= 0;
          const blocked = !isActive || exhausted;

          const card = document.createElement("div");
          card.className = "mock-card" + (blocked ? " inactive" : "");

          // compute display values
          const durationText = m.duration || m.time || "-";
          const qCountText = m.questionCount || m.qns || "-";
          // syllabus: check common fields (syl, syllabus, desc)
          const syllabusText = escapeHtml(findSyllabusFromDoc(m));
          // date-only formatting helper (handles Firestore Timestamp)
          const dateText = m.date ? escapeHtml(formatDateOnly(m.date)) : "-";

          const stateClass = !isActive
            ? "inactive"
            : exhausted
              ? "exhausted"
              : "active";
          const stateText = !isActive
            ? "Scheduled"
            : exhausted
              ? "Attempts Exhausted"
              : "Active";
          const leftText = `${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left`;
          const attemptDocs = Array.isArray(mockAttemptDocsMap[m.id])
            ? mockAttemptDocsMap[m.id]
            : [];

          card.innerHTML = `
          <div class="mock-card-top">
            <span class="mock-pill ${stateClass}"><i data-lucide="shield-check"></i> ${stateText}</span>
            <span class="mock-pill mock-attempt-pill"><i data-lucide="gauge"></i> Attempts: ${leftText}</span>
          </div>
          <div class="mock-name-row">
            <h4 class="mock-title">${escapeHtml(m.name || m.id)}</h4>
          </div>
          <div class="mock-meta-row">
            <div class="mock-meta-chip"><i data-lucide="clock-3"></i> Duration: ${escapeHtml(String(durationText))} min</div>
            <div class="mock-meta-chip"><i data-lucide="list-checks"></i> Questions: ${escapeHtml(String(qCountText))}</div>
            <div class="mock-meta-chip"><i data-lucide="calendar-days"></i> Date: ${dateText}</div>
          </div>
          <div class="mock-syllabus-row">
            <div class="mock-meta-label mock-inline-label"><i data-lucide="book-open-text"></i> Syllabus</div>
            <div class="mock-meta-value">${syllabusText || "-"}</div>
          </div>
          <div class="mock-actions">
          </div>
        `;
          const actions = card.querySelector(".mock-actions");
          if (!actions) {
            mocksContainer.appendChild(card);
            continue;
          }

          const startBtn = document.createElement("button");

          if (!isActive) {
            startBtn.className = "btn-secondary";
            startBtn.innerHTML = '<i data-lucide="play-circle"></i> Start';
            startBtn.disabled = true;
          } else if (exhausted) {
            startBtn.className = "btn-secondary";
            startBtn.innerHTML = '<i data-lucide="play-circle"></i> Start';
            startBtn.disabled = true;
          } else {
            startBtn.className = "btn-primary";
            startBtn.innerHTML = '<i data-lucide="play-circle"></i> Start';
            startBtn.addEventListener("click", () => {
              requestAppFullscreen();
              startModal.style.display = "none";
              startMock(m);
            });
          }

          actions.appendChild(startBtn);

          for (let i = 1; i <= 3; i++) {
            const resBtn = document.createElement("button");
            resBtn.className = "btn-secondary";
            resBtn.innerHTML = `<i data-lucide="file-text"></i> Res ${i}`;
            const docSnap = attemptDocs[i - 1] || null;
            if (!docSnap || !db) {
              resBtn.disabled = true;
            } else {
              resBtn.addEventListener("click", async () => {
                startModal.style.display = "none";
                await showDetailFromDoc(docSnap);
              });
            }
            actions.appendChild(resBtn);
          }

          mocksContainer.appendChild(card);
        }
        if (window.lucide && typeof window.lucide.createIcons === "function") {
          window.lucide.createIcons();
        }
      }

      closeMocks.addEventListener("click", () => {
        returnToHomeView();
      });

      /* ========== start mock ========== */
      async function startMock(mock) {
        if (!mock) return;
        showLoadingOverlay("Preparing mock");
        try {

        const isActive = isMockAvailableNowByDate(mock);

        if (!isActive) {
          alert(
            `This mock will be active after ${formatUnlockDateTime(mock.date)}.`,
          );
          return;
        }

        if (currentUser && db) {
          const attemptsUsed = await getMockAttemptCount(mock.id);
          const attemptsLeft = Math.max(
            0,
            MAX_ATTEMPTS_PER_MOCK - attemptsUsed,
          );
          if (attemptsLeft <= 0) {
            alert(
              `Attempt limit reached for this mock. You have used all ${MAX_ATTEMPTS_PER_MOCK} attempts.`,
            );
            await loadMocks();
            return;
          }
        }

        let built = [];

        if (db) {
          try {
            const snap = await db
              .collection("mocks")
              .doc(mock.id)
              .collection("questions")
              .orderBy("index")
              .get();

            if (!snap.empty) {
              built = snap.docs.map((d, i) => {
                const q = d.data();
                return {
                  id: d.id,
                  section: q.section,
                  text: q.text || null,
                  img: q.img || q.image || q.imageUrl || null,
                  options: ["A", "B", "C", "D"],
                  answerIndex: letterToIndex(q.ans || q.answer || q.correct),
                };
              });
            }
          } catch (e) {
            console.warn("Subcollection fetch failed", e);
          }
        }

        /* ======================================================
               🔥 2️⃣ NEW: SUPPORT SUBJECT-WISE QUESTIONS OBJECT
               (THIS MATCHES YOUR SCREENSHOT EXACTLY)
            ====================================================== */
        if (
          !built.length &&
          mock.questions &&
          typeof mock.questions === "object"
        ) {
          const subjects = ["Physics", "Chemistry", "Mathematics"];

          subjects.forEach((subject) => {
            const arr = mock.questions[subject];
            if (Array.isArray(arr)) {
              arr.forEach((q, i) => {
                built.push({
                  id: `${subject[0]}${i + 1}`,
                  section: subject,
                  text: null,
                  img: q.img || null,
                  options: ["A", "B", "C", "D"],
                  answerIndex: letterToIndex(q.ans),
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
          options: q.options || ["A", "B", "C", "D"],
          answerIndex: q.answerIndex,
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
          viewed: false,
        }));

        questionTimers = questions.map(() => null);
        current = 0;

        const durationMin = Number(mock.duration) || 120;
        totalDurationSec = durationMin * 60;

        startTime = Date.now();
        testStarted = true;
        submittedAlready = false;
        // Show status dot during test
        const statusDot = document.getElementById("status-dot");
        if (statusDot) statusDot.style.display = "inline-block";

        startGlobalTimer();
        const firstSection = updateSectionTabs();
        if (firstSection) {
          setActiveSection(firstSection);
        }

        currentMockId = mock.id;
        currentMockName = String(mock.name || mock.id || "").trim();
        updateHeaderMockTitle();
        } finally {
          hideLoadingOverlay();
        }
      }

      /* ========== render / timers ========== */
      function startGlobalTimer() {
        if (globalTimerInterval) clearInterval(globalTimerInterval);
        // immediately update display
        function updateOnce() {
          if (
            !startTime ||
            typeof totalDurationSec !== "number" ||
            totalDurationSec <= 0
          ) {
            globalTimer.textContent = "00:00:00";
            updateTimerRing(0, 0);
            return;
          }
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          let remaining = totalDurationSec - elapsed;
          if (remaining < 0) remaining = 0;
          globalTimer.textContent = fmtH(remaining);
          updateTimerRing(remaining, totalDurationSec);
          if (remaining <= 0) {
            // stop timer, auto submit
            clearInterval(globalTimerInterval);
            globalTimerInterval = null;
            // ensure we only auto-submit once
            if (!submittedAlready) {
              submitTest(true).catch(() => {
                /* ignore */
              });
            }
          }
        }
        updateOnce();
        globalTimerInterval = setInterval(updateOnce, 500);
      }
      function stopGlobalTimer() {
        if (globalTimerInterval) {
          clearInterval(globalTimerInterval);
          globalTimerInterval = null;
        }
      }

      // Helper functions that now use sectionMap
      function getSectionOfIndex(idx) {
        return questions[idx] && questions[idx].section
          ? questions[idx].section
          : null;
      }

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
        if (
          !sectionMap ||
          !sectionMap[section] ||
          sectionMap[section].length === 0
        )
          return 0;
        return sectionMap[section][0];
      }

      function applySubscriptionBranding(subscription) {
        const sub = (subscription || "").toLowerCase();

        let src = "favicon.png";
        if (sub === "prx") src = "favicon.png";
        else if (sub === "civinity") src = "favicon.png";

        document.getElementById("app-banner").src = src;
        document.getElementById("login-banner").src = src;
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
              <li>Each mock allows up to 3 attempts per user account.</li>
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
          optionsEl.innerHTML = "";
          qno.textContent = "Question 1";
          if (qtime) qtime.textContent = "Time spent: 00:00";
          if (qstatus) qstatus.textContent = "Status: Unseen";
          return;
        }

        const activeSection = getActiveSectionName();
        if (
          activeSection &&
          (!sectionMap || !sectionMap[activeSection] || sectionMap[activeSection].length === 0)
        ) {
          qno.textContent = `${activeSection} • Q 0`;
          questionEl.innerHTML = "";
          const p = document.createElement("div");
          p.textContent = `No question of ${activeSection} in this particular mock test`;
          p.style.color = "#612d53";
          p.style.fontWeight = "700";
          questionEl.appendChild(p);
          optionsEl.innerHTML = "";
          return;
        }

        // mark current as viewed when rendering it
        if (responses[current]) responses[current].viewed = true;

        const q = questions[current];
        qno.textContent = `${q.section} • Q ${getNumberWithinSection(current) || 1}`;

        optionsEl.innerHTML = "";
        questionEl.innerHTML = "";

        if (q.img) {
          const im = document.createElement("img");
          im.src = q.img;
          im.alt = q.id || "question image";
          im.onerror = function () {
            console.warn("Image load failed for", q.img);
            this.onerror = null;
            this.src =
              "data:image/svg+xml;utf8," +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360"><rect width="100%" height="100%" fill="#fff4ed"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#b37b4a" font-family="Arial" font-size="20">Image failed to load</text></svg>`,
              );
          };
          questionEl.appendChild(im);
        } else if (q.text) {
          const p = document.createElement("div");
          p.textContent = q.text;
          p.style.color = "#0f172a";
          questionEl.appendChild(p);
        } else {
          const p = document.createElement("div");
          p.textContent = "No image available for this question";
          p.style.color = "#b37b4a";
          questionEl.appendChild(p);
        }

        if (qtime) {
          qtime.textContent =
            "Time spent: " + fmtMS(responses[current].timeSpentSec || 0);
        }
        const resp = responses[current];
        if (qstatus) {
          qstatus.textContent = resp.markedReview
            ? "Status: Marked"
            : resp.choiceIndex === null
              ? "Status: Unseen"
              : "Status: Answered";
        }

        const opts = ["A", "B", "C", "D"];
        opts.forEach((lab, i) => {
          const d = document.createElement("div");
          d.className = "opt" + (resp.choiceIndex === i ? " selected" : "");
          d.textContent = lab;
          d.addEventListener("click", () => {
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
        const picker = document.getElementById("section-picker");
        const mobileRow = document.getElementById("mobile-question-row");
        picker.innerHTML = "";
        if (mobileRow) mobileRow.innerHTML = "";
        const list =
          sectionMap && sectionMap[section] ? sectionMap[section] : [];
        for (let i = 0; i < list.length; i++) {
          const idx = list[i];
          if (idx === undefined) continue;
          const st = responses[idx] || {
            choiceIndex: null,
            markedReview: false,
            viewed: false,
          };
          // priority: marked -> answered -> viewed -> default
          let cls = "qbtn";
          if (st.markedReview) cls += " review";
          else if (st.choiceIndex !== null) cls += " answered";
          else if (st.viewed) cls += " viewed";

          const buildBtn = () => {
            const el = document.createElement("div");
            el.className = cls + (idx === current ? " current" : "");
            el.textContent = i + 1;
            el.title = `Q ${i + 1}`;
            el.addEventListener("click", () => {
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
            return el;
          };

          picker.appendChild(buildBtn());
          if (mobileRow) mobileRow.appendChild(buildBtn());
        }
      }

      function firstIndexOfSection(section) {
        if (
          !sectionMap ||
          !sectionMap[section] ||
          sectionMap[section].length === 0
        )
          return 0;
        return sectionMap[section][0];
      }

      function getActiveSectionName() {
        if (document.getElementById("btn-phy").classList.contains("active")) {
          return "Physics";
        }
        if (document.getElementById("btn-chem").classList.contains("active")) {
          return "Chemistry";
        }
        if (document.getElementById("btn-math").classList.contains("active")) {
          return "Mathematics";
        }
        return null;
      }

      document
        .getElementById("btn-phy")
        .addEventListener("click", () => setActiveSection("Physics"));
      document
        .getElementById("btn-chem")
        .addEventListener("click", () => setActiveSection("Chemistry"));
      document
        .getElementById("btn-math")
        .addEventListener("click", () => setActiveSection("Mathematics"));

      function setActiveSection(section) {
        document
          .getElementById("btn-phy")
          .classList.toggle("active", section === "Physics");
        document
          .getElementById("btn-chem")
          .classList.toggle("active", section === "Chemistry");
        document
          .getElementById("btn-math")
          .classList.toggle("active", section === "Mathematics");

        if (typeof recordQuestionTimeStop === "function" && testStarted) {
          recordQuestionTimeStop(current);
        }

        const idx = firstIndexOfSection(section);
        if (typeof idx === "number" && idx >= 0 && idx < questions.length) {
          current = idx;
        }

        // mark viewed when switching into section (we render question which sets viewed)
        renderQuestion();
        renderPicker(section);
      }

      nextBtn.addEventListener("click", () => {
        if (!testStarted) return;
        recordQuestionTimeStop(current);
        current = Math.min(questions.length - 1, current + 1);
        renderQuestion();
        renderPicker(getSectionOfIndex(current));
      });
      prevBtn.addEventListener("click", () => {
        if (!testStarted) return;
        recordQuestionTimeStop(current);
        current = Math.max(0, current - 1);
        renderQuestion();
        renderPicker(getSectionOfIndex(current));
      });
      markReviewBtn.addEventListener("click", () => {
        if (!testStarted) return;
        responses[current].markedReview = !responses[current].markedReview;
        renderQuestion();
        renderPicker(getSectionOfIndex(current));
      });

      // CLEAR button behaviour: deselect current option and remove mark
      clearBtn.addEventListener("click", () => {
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

      function recordQuestionTimeStart(idx) {
        if (!questionTimers[idx]) questionTimers[idx] = Date.now();
      }
      function recordQuestionTimeStop(idx) {
        if (questionTimers[idx]) {
          const delta = Math.floor((Date.now() - questionTimers[idx]) / 1000);
          responses[idx].timeSpentSec =
            (responses[idx].timeSpentSec || 0) + delta;
          questionTimers[idx] = null;
          if (qtime) {
            qtime.textContent =
              "Time spent: " + fmtMS(responses[idx].timeSpentSec || 0);
          }
        }
      }

      // Updated Submit behavior: show confirmation modal with stats
      submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!testStarted || submittedAlready) return;
        showSubmitConfirm();
      });

      function showSubmitConfirm() {
        if (!testStarted || submittedAlready) return;
        const attempted = responses.filter(
          (r) => r.choiceIndex !== null,
        ).length;
        const left = responses.length - attempted;
        let remaining = 0;
        if (startTime && typeof totalDurationSec === "number") {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          remaining = Math.max(0, totalDurationSec - elapsed);
        }
        confirmAttempted.textContent = `Attempted: ${attempted}`;
        confirmLeft.textContent = `Left: ${left}`;
        confirmRemaining.textContent = `Time left: ${fmtH(remaining)}`;

        if (confirmSubjectBreakdown) {
          const statsBySubject = {};
          const preferredOrder = ["Physics", "Chemistry", "Mathematics"];
          questions.forEach((q, i) => {
            const subject = (q.section || q.subject || "General")
              .toString()
              .trim();
            if (!statsBySubject[subject]) {
              statsBySubject[subject] = {
                total: 0,
                attempted: 0,
                marked: 0,
              };
            }
            const bucket = statsBySubject[subject];
            const response = responses[i] || {};
            bucket.total += 1;
            if (
              response.choiceIndex !== null &&
              response.choiceIndex !== undefined
            )
              bucket.attempted += 1;
            if (response.markedReview) bucket.marked += 1;
          });

          const subjects = [
            ...preferredOrder.filter((subject) => statsBySubject[subject]),
            ...Object.keys(statsBySubject).filter(
              (subject) => !preferredOrder.includes(subject),
            ),
          ];

          confirmSubjectBreakdown.innerHTML = subjects
            .map((subject) => {
              const details = statsBySubject[subject];
              const totalQuestions = details.total || 5;
              const unattempted = Math.max(
                0,
                totalQuestions - details.attempted,
              );
              const safeSubject = escapeHtml(subject);
              return `
                <div class="confirm-subject-card">
                  <div class="confirm-subject-title">${safeSubject}</div>
                  <div class="confirm-subject-meta">
                    <div>Attempted: ${details.attempted}/${totalQuestions}</div>
                    <div>Unattempted: ${unattempted}/${totalQuestions}</div>
                    <div>Marked for review: ${details.marked}</div>
                  </div>
                </div>
              `;
            })
            .join("");
        }
        confirmModal.style.display = "flex";
      }

      confirmNo.addEventListener("click", () => {
        confirmModal.style.display = "none";
      });
      // Confirm yes -> proceed to submit. If there are marked questions, warn first in modal flow.
      confirmYes.addEventListener("click", async () => {
        confirmModal.style.display = "none";
        exitAppFullscreen();
        if (!testStarted || submittedAlready) return;
        // if there are any marked questions, confirm again (small inline check)
        const marked = responses
          .map((r, i) => (r.markedReview ? i : -1))
          .filter((x) => x >= 0);
        if (marked.length) {
          if (!confirm(`You have ${marked.length} marked. Submit anyway?`))
            return;
        }
        await submitTest();
      });

      async function submitTest(isAuto = false) {
        if (!testStarted || submittedAlready) return;
        submittedAlready = true;
        questionTimers.forEach((t, i) => {
          if (t) recordQuestionTimeStop(i);
        });
        stopGlobalTimer();
        totalDurationSec = 0;
        globalTimer.textContent = "00:00:00";
        updateTimerRing(0, 0);
        const { total, per } = computeScore();

        const result = {
          username: currentUser ? currentUser.username : "anon",
          name: currentUser ? currentUser.name : "anon",
          mockId: currentMockId || null,
          mockName: currentMockName || currentMockId || "",
          score: total,
          date:
            firebase && firebase.firestore
              ? firebase.firestore.FieldValue.serverTimestamp()
              : new Date().toISOString(),
          durationSec: Math.floor((Date.now() - startTime) / 1000),
          autoSubmitted: !!isAuto,
          perQuestion: questions.map((q, i) => ({
            qid: q.id,
            qidNormalized: (q.qid || q.id || "").toString(),
            section: q.section,
            imageUrl: q.img || q.imageUrl || q.imgUrl || null,
            selectedIndex: responses[i].choiceIndex,
            correctIndex: q.answerIndex,
            score: per[i],
            timeUsedSec: responses[i].timeSpentSec,
            markedReview: responses[i].markedReview,
          })),
        };

        if (db) {
          try {
            await db.collection("results").add(result);
          } catch (e) {
            console.warn("save failed", e);
          }
        } else {
          console.log("would save", result);
        }

        responses = questions.map(() => ({
          choiceIndex: null,
          markedReview: false,
          timeSpentSec: 0,
          viewed: false,
        }));
        questionTimers = questions.map(() => null);
        current = 0;
        submittedAlready = false;
        testStarted = false;
        // Hide status dot after test submission
        const statusDot = document.getElementById("status-dot");
        if (statusDot) statusDot.style.display = "none";
        startTime = null;
        if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
        renderQuestion();
        renderPicker(getSectionOfIndex(current));
        currentMockId = null;
        currentMockName = "";
        updateHeaderMockTitle();

        if (currentUser) await loadMocks();
        returnToHomeView();
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
      async function openResultsWindow() {
        historyOverlay.style.display = "flex";
        historyGrid.innerHTML = "";
        if (!db) {
          historyGrid.innerHTML =
            '<div style="padding:8px">DB not configured</div>';
          return;
        }
        if (!currentUser) {
          historyGrid.innerHTML =
            '<div style="padding:8px">Login to view</div>';
          return;
        }
        try {
          let snap = await db
            .collection("results")
            .where("username", "==", currentUser.username)
            .orderBy("date", "desc")
            .limit(100)
            .get()
            .catch(async () => {
              const alt = await db
                .collection("results")
                .orderBy("date", "desc")
                .limit(200)
                .get();
              return {
                docs: alt.docs.filter(
                  (d) => d.data().username === currentUser.username,
                ),
              };
            });
          if (!snap || !Array.isArray(snap.docs) || snap.docs.length === 0) {
            historyGrid.innerHTML =
              '<div style="padding:8px">No attempted results yet.</div>';
            return;
          }
          const toMs = (v) => {
            if (!v) return 0;
            if (v.toDate && typeof v.toDate === "function") {
              return v.toDate().getTime();
            }
            const dt = new Date(v);
            return isNaN(dt.getTime()) ? 0 : dt.getTime();
          };
          const docsAsc = snap.docs
            .slice()
            .sort(
              (a, b) =>
                toMs(a.data() && a.data().date) - toMs(b.data() && b.data().date),
            );
          const attemptMap = {};
          const items = docsAsc.map((doc) => {
            const d = doc.data() || {};
            const mockIdKey = String(d.mockId || "unknown");
            attemptMap[mockIdKey] = (attemptMap[mockIdKey] || 0) + 1;
            return {
              doc,
              data: d,
              attemptNo: attemptMap[mockIdKey],
              mockName: String(d.mockName || getMockNameFromId(d.mockId)).trim() || "Mock",
              savedMs: toMs(d.date),
            };
          });
          items.sort((a, b) => b.savedMs - a.savedMs);
          items.forEach((item) => {
            const d = item.data;
            const card = document.createElement("div");
            card.className = "history-card";
            const savedAt = d.date
              ? d.date.toDate
                ? d.date.toDate().toLocaleString()
                : String(d.date)
              : "-";
            card.innerHTML = `<div style="font-weight:800">${escapeHtml(item.mockName)} - Attempt ${item.attemptNo}</div><div style="font-size:12px;color:${getComputedStyle(document.documentElement).getPropertyValue("--muted")}">Score: ${d.score || 0} | ${d.perQuestion ? d.perQuestion.length : "-"} Qs</div><div style="font-size:11px;color:${getComputedStyle(document.documentElement).getPropertyValue("--muted")}">Saved: ${escapeHtml(savedAt)}</div>`;
            const v = document.createElement("button");
            v.className = "btn-secondary";
            v.textContent = "Open";
            v.style.marginTop = "6px";
            v.addEventListener("click", async () => {
              const docf = await db.collection("results").doc(item.doc.id).get();
              showDetailFromDoc(docf, {
                mockName: item.mockName,
                attemptNo: item.attemptNo,
              });
              historyOverlay.style.display = "none";
            });
            card.appendChild(v);
            historyGrid.appendChild(card);
          });
        } catch (e) {
          console.error(e);
          historyGrid.innerHTML =
            '<div style="padding:8px">Failed to load</div>';
        }
      }
      closeHistory.addEventListener("click", () => returnToHomeView());

      // robust showDetailFromDoc — checks saved image first, then runtime questions[], then Firestore fallback
      async function showDetailFromDoc(doc, meta = {}) {
        // doc may be a firestore doc snapshot or a plain object
        const d = doc && doc.data ? doc.data() : doc || {};
        const mockName = String(
          meta.mockName || d.mockName || getMockNameFromId(d.mockId),
        ).trim() || "Mock";
        document.getElementById("detail-title").textContent = mockName;
        const savedText = d.date
          ? d.date.toDate
            ? d.date.toDate().toLocaleString()
            : d.date
          : "-";
        const attemptLabel =
          typeof meta.attemptNo === "number" && meta.attemptNo > 0
            ? `Attempt ${meta.attemptNo}`
            : "Attempt details";
        document.getElementById("detail-sub").textContent =
          `${attemptLabel} | ${savedText}`;

        const scoreBadge = document.getElementById("detail-score");
        if (scoreBadge) {
          const big = scoreBadge.querySelector(".big");
          if (big) big.textContent = d.score || 0;
        }

        const perQ = d.perQuestion || [];
        const totalQs = perQ.length;
        const maxScore = totalQs * 4;
        document.getElementById("right-total").textContent = d.score || 0;
        document.getElementById("right-max").textContent = maxScore;
        document.getElementById("right-duration").textContent = (() => {
          if (d.durationSec) {
            const m = Math.floor(d.durationSec / 60),
              s = d.durationSec % 60;
            return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
          }
          return "-";
        })();

        // Compute overall correct/wrong/unanswered and subject-wise marks
        let correct = 0,
          wrong = 0,
          unanswered = 0;
        const subj = {}; // subj -> { correct, wrong, unanswered, positive, negative }
        perQ.forEach((pq) => {
          const section = pq.section || "Unknown";
          if (!subj[section])
            subj[section] = {
              correct: 0,
              wrong: 0,
              unanswered: 0,
              positive: 0,
              negative: 0,
              net: 0,
            };
          if (pq.selectedIndex == null) {
            unanswered++;
            subj[section].unanswered++;
          } else if (
            pq.correctIndex != null &&
            pq.selectedIndex === pq.correctIndex
          ) {
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
        let overallPositive = 0,
          overallNegative = 0;
        Object.keys(subj).forEach((k) => {
          subj[k].net = subj[k].positive - subj[k].negative;
          overallPositive += subj[k].positive;
          overallNegative += subj[k].negative;
        });

        document.getElementById("stat-correct").textContent = correct;
        document.getElementById("stat-wrong").textContent = wrong;
        document.getElementById("stat-unanswered").textContent = unanswered;

        // Update the progress bar as before
        const percent = totalQs
          ? Math.round(((correct + wrong) / totalQs) * 100)
          : 0;
        const pb = document.getElementById("progress-bar");
        if (pb) pb.style.width = `${percent}%`;

        // Remove old breakdown if present
        let existingBreakdown = document.getElementById("subject-breakdown");
        if (existingBreakdown) existingBreakdown.remove();

        const leftCol = document.querySelector(".detail-left");
        if (leftCol) {
          const breakdown = document.createElement("div");
          breakdown.id = "subject-breakdown";
          breakdown.style.display = "flex";
          breakdown.style.gap = "8px";
          breakdown.style.flexWrap = "wrap";
          breakdown.style.marginTop = "10px";
          breakdown.style.alignItems = "center";

          // overall summary
          const overallDiv = document.createElement("div");
          overallDiv.className = "stat";
          overallDiv.style.minWidth = "160px";
          overallDiv.innerHTML = `<strong style="font-size:16px">${overallPositive - overallNegative || 0}</strong><span style="font-size:12px;color:${getComputedStyle(document.documentElement).getPropertyValue("--muted")}">Overall (net)</span>
        <div style="margin-top:6px;font-size:12px;color:${getComputedStyle(document.documentElement).getPropertyValue("--muted")}">+${overallPositive} / -${overallNegative}</div>`;
          breakdown.appendChild(overallDiv);

          // per-subject cards (Physics, Chemistry, Mathematics kept in same order if present)
          const prefer = ["Physics", "Chemistry", "Mathematics"];
          const keys = [
            ...prefer.filter((k) => subj[k]),
            ...Object.keys(subj).filter((k) => !prefer.includes(k)),
          ];

          keys.forEach((k) => {
            const s = subj[k];
            const card = document.createElement("div");
            card.className = "stat";
            card.style.minWidth = "140px";
            card.innerHTML = `<strong style="font-size:15px">${s.net}</strong><span style="font-size:12px;color:${getComputedStyle(document.documentElement).getPropertyValue("--muted")}">${escapeHtml(k)}</span>
            <div style="margin-top:6px;font-size:12px;color:${getComputedStyle(document.documentElement).getPropertyValue("--muted")}">+${s.positive} / -${s.negative}</div>`;
            breakdown.appendChild(card);
          });

          // insert the breakdown after the stats-row element
          const statsRow = leftCol.querySelector(".stats-row");
          if (statsRow && statsRow.parentNode) {
            statsRow.parentNode.insertBefore(breakdown, statsRow.nextSibling);
          } else {
            leftCol.insertBefore(breakdown, leftCol.firstChild);
          }
        }

        // Build per-question list and attach Preview (eye) button
        const list = document.getElementById("perq-list");
        list.innerHTML = "";
        (d.perQuestion || []).forEach((pq, i) => {
          const tr = document.createElement("div");
          tr.className = "perq-item";
          const left = document.createElement("div");
          left.className = "perq-left";
          left.textContent = i + 1;

          const mid = document.createElement("div");
          mid.className = "perq-mid";
          const qid = document.createElement("div");
          qid.className = "qid";
          qid.textContent = pq.qid || "";

          const selText =
            pq.selectedIndex == null
              ? "-"
              : String.fromCharCode(65 + pq.selectedIndex);
          const corText =
            pq.correctIndex == null
              ? "-"
              : String.fromCharCode(65 + pq.correctIndex);

          const selSpan = document.createElement("div");
          selSpan.textContent = `Selected: ${selText}`;

          const corSpan = document.createElement("div");
          corSpan.textContent = `Correct: ${corText}`;

          const timeSpan = document.createElement("div");
          timeSpan.textContent = `Time: ${typeof pq.timeUsedSec === "number" ? Math.floor(pq.timeUsedSec / 60) + ":" + String(pq.timeUsedSec % 60).padStart(2, "0") : "-"}`;

          const scoreSpan = document.createElement("div");
          scoreSpan.textContent = `Score: ${pq.score || 0}`;

          // preview button (eye SVG)
          const viewBtn = document.createElement("button");
          viewBtn.className = "btn secondary";
          viewBtn.style.marginLeft = "8px";
          viewBtn.title = "View question image";
          viewBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg> View
        `;
          // on click: try to find image and open preview window
          viewBtn.addEventListener("click", async () => {
            const qidVal = pq.qid || pq.qidNormalized || "";
            // 1) check image embedded in the saved attempt (best)
            let imgUrl = pq.imageUrl || pq.img || pq.image || null;

            // 2) fallback: try to find it in current runtime questions[]
            if (!imgUrl && Array.isArray(questions) && questions.length) {
              try {
                const found = questions.find(
                  (q) =>
                    String(q.id) === String(qidVal) ||
                    String(q.qid || "") === String(qidVal),
                );
                if (found)
                  imgUrl = found.img || found.imageUrl || found.imgUrl || null;
              } catch (e) {}
            }

            // 3) fallback: try to fetch question doc from Firestore (if mockId available)
            if (!imgUrl && db && d.mockId) {
              try {
                const qSnap = await db
                  .collection("mocks")
                  .doc(d.mockId)
                  .collection("questions")
                  .where("qid", "==", qidVal)
                  .limit(1)
                  .get()
                  .catch(() => ({ docs: [] }));
                if (qSnap && qSnap.docs && qSnap.docs.length) {
                  const qdoc = qSnap.docs[0].data();
                  imgUrl =
                    qdoc.imageUrl ||
                    qdoc.img ||
                    qdoc.image ||
                    findImageFromDoc(qdoc) ||
                    null;
                }
              } catch (e) {
                console.warn("failed to fetch question doc for preview", e);
              }
            }

            // show preview (open window)
            const w = window.open("", "_blank", "width=900,height=700");
            if (!w) {
              alert("Popup blocked — allow popups to preview images");
              return;
            }
            if (imgUrl) {
              w.document.title = "Question Preview - " + qidVal;
              w.document.body.style.margin = "0";
              w.document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;padding:12px"><img src="${escapeHtml(imgUrl)}" style="max-width:100%;max-height:100%;object-fit:contain" alt="${escapeHtml(qidVal)}" /></div>`;
            } else {
              w.document.title = "Preview - Not available";
              w.document.body.style.margin = "0";
              w.document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;padding:12px;color:#b37b4a;font-weight:800">No image available for ${escapeHtml(qidVal)}</div>`;
            }
          });

          const badge = document.createElement("div");
          badge.className = "badge";
          if (pq.selectedIndex == null) {
            badge.classList.add("unseen");
            badge.textContent = "Unanswered";
          } else if (pq.selectedIndex === pq.correctIndex) {
            badge.classList.add("correct");
            badge.textContent = "Correct";
          } else {
            badge.classList.add("wrong");
            badge.textContent = "Wrong";
          }

          mid.appendChild(qid);
          mid.appendChild(selSpan);
          mid.appendChild(corSpan);
          mid.appendChild(scoreSpan);
          mid.appendChild(timeSpan);

          tr.appendChild(left);
          tr.appendChild(mid);

          // actions column: badge + view button
          const actionsWrap = document.createElement("div");
          actionsWrap.style.display = "flex";
          actionsWrap.style.gap = "8px";
          actionsWrap.style.alignItems = "center";
          actionsWrap.appendChild(badge);
          actionsWrap.appendChild(viewBtn);

          tr.appendChild(actionsWrap);
          list.appendChild(tr);
        });

        // show the modal
        detailOverlay.style.display = "flex";
        const closeTop = document.getElementById("close-detail");
        if (closeTop)
          closeTop.onclick = () => {
            returnToHomeView();
          };
        const closeBottom = document.getElementById("close-detail-bottom");
        if (closeBottom)
          closeBottom.onclick = () => {
            returnToHomeView();
          };
      }

      closeDetail.addEventListener("click", () => returnToHomeView());

      // New full-screen results implementation (overrides legacy functions)
      function resultsToMs(v) {
        if (!v) return 0;
        if (v.toDate && typeof v.toDate === "function") {
          return v.toDate().getTime();
        }
        const dt = new Date(v);
        return isNaN(dt.getTime()) ? 0 : dt.getTime();
      }

      function resultsFormatDateTime(field) {
        if (!field) return "-";
        try {
          if (field.toDate && typeof field.toDate === "function") {
            return field.toDate().toLocaleString();
          }
          const dt = new Date(field);
          if (!isNaN(dt.getTime())) return dt.toLocaleString();
          return String(field);
        } catch (e) {
          return String(field);
        }
      }

      function optionFromIndex(idx) {
        return typeof idx === "number" && idx >= 0
          ? String.fromCharCode(65 + idx)
          : "";
      }

      async function fetchCurrentUserResultDocs() {
        if (!db || !currentUser) return [];
        let snap = await db
          .collection("results")
          .where("username", "==", currentUser.username)
          .orderBy("date", "desc")
          .limit(120)
          .get()
          .catch(async () => {
            const alt = await db
              .collection("results")
              .orderBy("date", "desc")
              .limit(250)
              .get();
            return {
              docs: alt.docs.filter(
                (d) => (d.data() || {}).username === currentUser.username,
              ),
            };
          });
        return snap && Array.isArray(snap.docs) ? snap.docs : [];
      }

      function buildResultGroups(rawDocs) {
        const docsAsc = (Array.isArray(rawDocs) ? rawDocs : [])
          .slice()
          .sort(
            (a, b) =>
              resultsToMs((a.data() || {}).date) - resultsToMs((b.data() || {}).date),
          );

        const map = {};
        docsAsc.forEach((doc) => {
          const d = (doc && doc.data && doc.data()) || {};
          const key = String(d.mockId || d.mockName || "unknown");
          if (!map[key]) {
            map[key] = {
              mockId: d.mockId || null,
              mockName:
                String(d.mockName || getMockNameFromId(d.mockId) || "Mock").trim() ||
                "Mock",
              attempts: [null, null, null],
              latestMs: 0,
            };
          }
          const group = map[key];
          const slot = group.attempts.findIndex((x) => !x);
          if (slot === -1) return;
          const savedMs = resultsToMs(d.date);
          group.attempts[slot] = {
            docId: doc.id || null,
            data: d,
            savedMs,
            savedText: resultsFormatDateTime(d.date),
            attemptNo: slot + 1,
          };
          if (savedMs > group.latestMs) group.latestMs = savedMs;
        });

        return Object.values(map).sort((a, b) => b.latestMs - a.latestMs);
      }

      function bestScoreOfGroup(group) {
        const scores = (group && group.attempts ? group.attempts : [])
          .filter(Boolean)
          .map((a) => Number((a.data || {}).score || 0));
        return scores.length ? Math.max(...scores) : null;
      }

      function getAttemptStats(attempt) {
        const per = (attempt && attempt.data && attempt.data.perQuestion) || [];
        let correct = 0;
        let wrong = 0;
        let unattempted = 0;
        per.forEach((q) => {
          if (!q || q.selectedIndex == null) {
            unattempted++;
          } else if (q.correctIndex != null && q.selectedIndex === q.correctIndex) {
            correct++;
          } else {
            wrong++;
          }
        });
        return { correct, wrong, unattempted };
      }

      function defaultActiveAttempt(group, preferredAttemptNo) {
        if (
          typeof preferredAttemptNo === "number" &&
          preferredAttemptNo >= 1 &&
          preferredAttemptNo <= 3 &&
          group.attempts[preferredAttemptNo - 1]
        ) {
          return preferredAttemptNo - 1;
        }
        let idx = -1;
        let best = -Infinity;
        group.attempts.forEach((at, i) => {
          if (!at) return;
          const score = Number((at.data || {}).score || 0);
          if (score > best) {
            best = score;
            idx = i;
          }
        });
        return idx >= 0 ? idx : 0;
      }

      function renderResultsRows(groups) {
        if (!historyGrid) return;
        historyGrid.innerHTML = "";
        groups.forEach((group) => {
          const mockMeta = Array.isArray(mocksList)
            ? mocksList.find(
                (m) =>
                  String(m.id || "") === String(group.mockId || "") ||
                  String(m.name || "") === String(group.mockName || ""),
              )
            : null;
          const startMockTarget =
            mockMeta ||
            (group.mockId
              ? {
                  id: group.mockId,
                  name: group.mockName || "Mock",
                  duration: null,
                  qns: null,
                  syllabus: null,
                  date: null,
                }
              : null);
          const best = bestScoreOfGroup(group);
          const durationVal =
            (mockMeta && (mockMeta.duration || mockMeta.time)) ||
            (() => {
              const firstUsed = group.attempts.find(Boolean);
              if (!firstUsed || !firstUsed.data) return "-";
              const sec = Number(firstUsed.data.durationSec || 0);
              return sec > 0 ? `${Math.round(sec / 60)} min` : "-";
            })();
          const syllabusVal = mockMeta ? findSyllabusFromDoc(mockMeta) : "-";
          const attemptDates = group.attempts.map((a) =>
            a ? resultsFormatDateTime(a.data && a.data.date) : "",
          );
          const attemptScores = group.attempts.map((a) =>
            a ? Number((a.data || {}).score || 0) : "",
          );
          const totalQs =
            Number((mockMeta && (mockMeta.questionCount || mockMeta.qns)) || 0) ||
            (() => {
              const firstUsed = group.attempts.find(Boolean);
              const per =
                firstUsed && firstUsed.data && Array.isArray(firstUsed.data.perQuestion)
                  ? firstUsed.data.perQuestion
                  : [];
              return per.length || "-";
            })();
          const totalMarks =
            typeof totalQs === "number" && !isNaN(totalQs) ? totalQs * 4 : "-";
          const mockDateText =
            mockMeta && mockMeta.date ? formatDateOnly(mockMeta.date) : "-";

          const card = document.createElement("div");
          card.className = "result-history-card";
          card.innerHTML = `
            <div class="result-row-1">
              <div class="result-row-1-left">
                <i data-lucide="file-text"></i>
                <h4 class="result-history-title">${escapeHtml(group.mockName || "Mock")}</h4>
              </div>
              <div class="result-row-1-mid"></div>
            </div>
            <div class="result-row-2">
              <span class="result-meta-item"><i data-lucide="calendar-days"></i> Mock Date: ${escapeHtml(String(mockDateText))}</span>
              <span class="result-meta-item"><i data-lucide="list-checks"></i> Questions: ${escapeHtml(String(totalQs))}</span>
              <span class="result-meta-item"><i data-lucide="timer"></i> Duration: ${escapeHtml(String(durationVal))}</span>
              <span class="result-meta-item"><i data-lucide="target"></i> Total Marks: ${escapeHtml(String(totalMarks))}</span>
              <span class="result-meta-item result-meta-syllabus"><i data-lucide="graduation-cap"></i> Syllabus: ${escapeHtml(String(syllabusVal || "-"))}</span>
            </div>
          `;
          const row1Mid = card.querySelector(".result-row-1-mid");
          if (row1Mid) {
            for (let i = 0; i < 3; i++) {
              const hasAttempt = !!attemptDates[i];
              const label = `A${i + 1}`;
              if (hasAttempt) {
                const chipBtn = document.createElement("button");
                chipBtn.type = "button";
                chipBtn.className = "result-attempt-chip attempt-chip-open";
                chipBtn.title = `Open ${label} result`;
                chipBtn.innerHTML = `<span class="attempt-chip-text"><i data-lucide="history"></i> ${label}: ${escapeHtml(attemptDates[i])}</span><span class="attempt-chip-open-icon"><i data-lucide="external-link"></i> View</span>`;
                chipBtn.addEventListener("click", () =>
                  showMockDetail(group, i + 1, true),
                );
                row1Mid.appendChild(chipBtn);
                continue;
              }

              // Only show direct start CTA for unattempted follow-up attempts (A2/A3).
              if (i >= 1 && startMockTarget) {
                const startChip = document.createElement("button");
                startChip.type = "button";
                startChip.className = "result-attempt-chip empty result-attempt-start";
                startChip.innerHTML = `<i data-lucide="play-circle"></i> ${label}: Start`;
                startChip.addEventListener("click", async () => {
                  if (historyOverlay) historyOverlay.style.display = "none";
                  await startMock(startMockTarget);
                });
                row1Mid.appendChild(startChip);
              } else {
                const emptyChip = document.createElement("span");
                emptyChip.className = "result-attempt-chip empty";
                emptyChip.innerHTML = `<i data-lucide="history"></i> ${label}: Attempt`;
                row1Mid.appendChild(emptyChip);
              }
            }
          }
          historyGrid.appendChild(card);
        });
        if (window.lucide && typeof window.lucide.createIcons === "function") {
          window.lucide.createIcons();
        }
      }

      function setDetailAttemptMode(activeIdx, singleAttemptView) {
        const table = document.querySelector("#detail-overlay .detail-table");
        if (!table) return;
        const headerCells = table.querySelectorAll("thead th");
        const attemptHeaders = [
          "Attempt 1 Clicked Option",
          "Attempt 2 Clicked Option",
          "Attempt 3 Clicked Option",
        ];
        for (let i = 0; i < 3; i++) {
          const colIdx = 3 + i; // 0-based in row; 4th/5th/6th columns in table
          const th = headerCells[colIdx];
          if (!th) continue;
          const visible = !singleAttemptView || i === activeIdx;
          th.style.display = visible ? "table-cell" : "none";
          th.textContent = singleAttemptView && i === activeIdx
            ? "Clicked Option"
            : attemptHeaders[i];
        }
        const rows = table.querySelectorAll("tbody tr");
        rows.forEach((row) => {
          const cells = row.children;
          for (let i = 0; i < 3; i++) {
            const colIdx = 3 + i;
            if (!cells[colIdx]) continue;
            const visible = !singleAttemptView || i === activeIdx;
            cells[colIdx].style.display = visible ? "table-cell" : "none";
          }
        });
      }

      function renderDetailRows(group, activeIdx, singleAttemptView = false) {
        const tbody = document.getElementById("perq-list");
        if (!tbody) return;
        tbody.innerHTML = "";

        const attemptData = group.attempts.map((at) => (at ? at.data : null));
        const maxLen = Math.max(
          ...attemptData.map((d) =>
            d && Array.isArray(d.perQuestion) ? d.perQuestion.length : 0,
          ),
          0,
        );

        if (!maxLen) {
          setDetailAttemptMode(activeIdx, singleAttemptView);
          const visibleCols = singleAttemptView ? 5 : 7;
          tbody.innerHTML =
            `<tr><td colspan="${visibleCols}" style="padding:12px">No question-level data available.</td></tr>`;
          return;
        }

        for (let i = 0; i < maxLen; i++) {
          const perArr = attemptData.map((d) =>
            d && Array.isArray(d.perQuestion) ? d.perQuestion[i] || null : null,
          );
          const subject =
            (perArr.find((p) => p && p.section) || {}).section || "-";
          const correctIdx = (() => {
            const found = perArr.find((p) => p && p.correctIndex != null);
            return found ? found.correctIndex : null;
          })();
          const qid = (() => {
            const found = perArr.find((p) => p && (p.qid || p.qidNormalized));
            return found ? String(found.qid || found.qidNormalized || "") : "";
          })();
          const imageUrl = (() => {
            const found = perArr.find((p) => p && (p.imageUrl || p.img || p.image));
            return found ? normalizeImgUrl(found.imageUrl || found.img || found.image) : null;
          })();
          const sel = perArr.map((p) =>
            p && p.selectedIndex != null ? p.selectedIndex : null,
          );

          const activeSel = sel[activeIdx];
          let rowClass = "detail-row-unattempted";
          if (activeSel != null && correctIdx != null) {
            rowClass =
              activeSel === correctIdx ? "detail-row-correct" : "detail-row-wrong";
          } else if (activeSel != null && correctIdx == null) {
            rowClass = "detail-row-wrong";
          }

          const tr = document.createElement("tr");
          tr.className = rowClass;
          tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${escapeHtml(String(subject))}</td>
            <td>${escapeHtml(optionFromIndex(correctIdx))}</td>
            <td>${escapeHtml(optionFromIndex(sel[0]))}</td>
            <td>${escapeHtml(optionFromIndex(sel[1]))}</td>
            <td>${escapeHtml(optionFromIndex(sel[2]))}</td>
            <td></td>
          `;

          const iconTd = tr.querySelector("td:last-child");
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "icon-view-btn";
          btn.title = "View question image";
          btn.innerHTML = '<i data-lucide="image"></i>';
          const openPreview = async () => {
            await openQuestionImage({
              qid,
              mockId: group.mockId,
              initialImageUrl: imageUrl,
              rowNo: i + 1,
            });
          };
          btn.addEventListener("mouseenter", openPreview);
          btn.addEventListener("mouseleave", closeQuestionImageModal);
          btn.addEventListener("focus", openPreview);
          btn.addEventListener("blur", closeQuestionImageModal);
          btn.addEventListener("click", openPreview);
          if (iconTd) iconTd.appendChild(btn);
          tbody.appendChild(tr);
        }
        setDetailAttemptMode(activeIdx, singleAttemptView);
        if (window.lucide && typeof window.lucide.createIcons === "function") {
          window.lucide.createIcons();
        }
      }

      function showMockDetail(group, preferredAttemptNo, singleAttemptView = false) {
        if (!group) return;
        const titleEl = document.getElementById("detail-title");
        const subEl = document.getElementById("detail-sub");
        const bestEl = document.getElementById("detail-best-score");
        const cardsEl = document.getElementById("detail-attempt-cards");
        if (!cardsEl) return;

        if (titleEl) titleEl.textContent = group.mockName || "Mock";
        const activeIdx = defaultActiveAttempt(group, preferredAttemptNo);
        if (subEl) {
          subEl.textContent = singleAttemptView
            ? `Attempt ${activeIdx + 1} details`
            : "Attempt-wise comparison";
        }
        if (bestEl) {
          const best = bestScoreOfGroup(group);
          bestEl.textContent = best == null ? "-" : String(best);
        }

        if (historyOverlay) historyOverlay.style.display = "none";
        if (detailOverlay) detailOverlay.style.display = "flex";

        if (singleAttemptView) {
          cardsEl.style.display = "none";
          cardsEl.innerHTML = "";
          renderDetailRows(group, activeIdx, true);
          return;
        }

        cardsEl.style.display = "grid";
        let compareIdx = activeIdx;
        const paintCards = () => {
          cardsEl.innerHTML = "";
          for (let i = 0; i < 3; i++) {
            const at = group.attempts[i];
            const stats = getAttemptStats(at);
            const card = document.createElement("button");
            card.type = "button";
            card.className =
              "attempt-card" +
              (at ? "" : " unattempted") +
              (compareIdx === i ? " active" : "");
            card.innerHTML = `
              <div class="attempt-card-title">Attempt ${i + 1}</div>
              <div class="attempt-card-value">${escapeHtml(
                at ? String(Number((at.data || {}).score || 0)) : "-",
              )}</div>
              <div class="attempt-card-meta">${escapeHtml(
                at
                  ? `${stats.correct}C / ${stats.wrong}W / ${stats.unattempted}U`
                  : "Not attempted",
              )}</div>
            `;
            card.addEventListener("click", () => {
              compareIdx = i;
              paintCards();
              renderDetailRows(group, compareIdx, false);
            });
            cardsEl.appendChild(card);
          }
        };

        paintCards();
        renderDetailRows(group, compareIdx, false);
      }

      async function openQuestionImage({ qid, mockId, initialImageUrl, rowNo }) {
        let imgUrl = normalizeImgUrl(initialImageUrl);

        if (!imgUrl && Array.isArray(questions) && questions.length) {
          const found = questions.find(
            (q) =>
              String(q.id || "") === String(qid || "") ||
              String(q.qid || "") === String(qid || ""),
          );
          if (found) {
            imgUrl = normalizeImgUrl(found.img || found.imageUrl || found.imgUrl || null);
          }
        }

        if (!imgUrl && db && mockId && qid) {
          try {
            const qSnap = await db
              .collection("mocks")
              .doc(String(mockId))
              .collection("questions")
              .where("qid", "==", qid)
              .limit(1)
              .get()
              .catch(() => ({ docs: [] }));
            if (qSnap && qSnap.docs && qSnap.docs.length) {
              imgUrl = normalizeImgUrl(findImageFromDoc(qSnap.docs[0].data() || {}));
            }
          } catch (e) {
            console.warn("image preview fetch failed", e);
          }
        }
        if (!questionImageModal || !questionImagePreview || !questionImageEmpty) return;
        questionImageModal.style.display = "flex";
        questionImageModal.setAttribute("aria-hidden", "false");
        if (imgUrl) {
          questionImagePreview.src = imgUrl;
          questionImagePreview.alt = qid ? `Question ${qid}` : `Question ${rowNo}`;
          questionImagePreview.style.display = "block";
          questionImageEmpty.style.display = "none";
        } else {
          questionImagePreview.removeAttribute("src");
          questionImagePreview.style.display = "none";
          questionImageEmpty.style.display = "block";
          questionImageEmpty.textContent = `No image available for ${qid || `Q${rowNo}`}.`;
        }
      }

      function closeQuestionImageModal() {
        if (!questionImageModal || !questionImagePreview || !questionImageEmpty) return;
        questionImageModal.style.display = "none";
        questionImageModal.setAttribute("aria-hidden", "true");
        questionImagePreview.removeAttribute("src");
        questionImagePreview.style.display = "none";
        questionImageEmpty.style.display = "none";
      }

      if (questionImageModal) {
        questionImageModal.addEventListener("click", (e) => {
          if (e.target === questionImageModal) closeQuestionImageModal();
        });
        questionImageModal.addEventListener("mouseleave", closeQuestionImageModal);
      }

      function openPyqImageModal(imageUrl, labelText) {
        if (!pyqImageModal || !pyqImagePreview || !pyqImageEmpty) return;
        const safeUrl = String(imageUrl || "").trim();
        pyqImageModal.style.display = "flex";
        pyqImageModal.setAttribute("aria-hidden", "false");
        if (safeUrl) {
          pyqImagePreview.src = safeUrl;
          pyqImagePreview.alt = labelText ? `PYQ - ${labelText}` : "PYQ preview";
          pyqImagePreview.style.display = "block";
          pyqImageEmpty.style.display = "none";
        } else {
          pyqImagePreview.removeAttribute("src");
          pyqImagePreview.style.display = "none";
          pyqImageEmpty.style.display = "block";
        }
      }

      function closePyqImageModal() {
        if (!pyqImageModal || !pyqImagePreview || !pyqImageEmpty) return;
        pyqImageModal.style.display = "none";
        pyqImageModal.setAttribute("aria-hidden", "true");
        pyqImagePreview.removeAttribute("src");
        pyqImagePreview.style.display = "none";
        pyqImageEmpty.style.display = "none";
      }

      if (pyqImageClose) {
        pyqImageClose.addEventListener("click", closePyqImageModal);
      }
      if (pyqImageModal) {
        pyqImageModal.addEventListener("click", (e) => {
          if (e.target === pyqImageModal) closePyqImageModal();
        });
      }

      async function startPyqChapterMock(chapterName, chapterDocs) {
        const rows = Array.isArray(chapterDocs) ? chapterDocs : [];
        if (!rows.length) {
          alert("No questions found in this chapter.");
          return;
        }

        showLoadingOverlay("Starting chapter mock");
        try {
          const normalizeSection = (v) => {
            const raw = String(v || "").trim().toLowerCase();
            if (raw === "physics") return "Physics";
            if (raw === "chemistry") return "Chemistry";
            if (raw === "mathematics" || raw === "maths" || raw === "math") return "Mathematics";
            return "Chemistry";
          };

          const built = rows.map((item, idx) => {
            const d = (item && item.data) || {};
            return {
              id: String(d.qid || item.id || `PYQ-${idx + 1}`),
              section: normalizeSection(d.subject),
              text: String(d.question || d.text || "").trim() || null,
              img: findImageFromDoc(d),
              options: ["A", "B", "C", "D"],
              answerIndex: letterToIndex(d.correct || d.ans || d.answer),
            };
          });

          questions = built.map((q, i) => ({
            id: q.id || `Q${i + 1}`,
            section: q.section,
            text: q.text,
            img: normalizeImgUrl(q.img),
            options: q.options || ["A", "B", "C", "D"],
            answerIndex: q.answerIndex,
          }));

          sectionMap = {};
          questions.forEach((q, i) => {
            if (!sectionMap[q.section]) sectionMap[q.section] = [];
            sectionMap[q.section].push(i);
          });

          responses = questions.map(() => ({
            choiceIndex: null,
            markedReview: false,
            timeSpentSec: 0,
            viewed: false,
          }));

          questionTimers = questions.map(() => null);
          current = 0;

          const durationMin = rows.length * 1.5;
          totalDurationSec = Math.max(60, Math.round(durationMin * 60));

          startTime = Date.now();
          testStarted = true;
          submittedAlready = false;

          const statusDot = document.getElementById("status-dot");
          if (statusDot) statusDot.style.display = "inline-block";

          startGlobalTimer();
          const firstSection = updateSectionTabs();
          if (firstSection) setActiveSection(firstSection);

          currentMockId = `pyq-${String(chapterName || "chapter").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          currentMockName = `PYQ - ${String(chapterName || "Chapter").trim()}`;
          updateHeaderMockTitle();

          if (pyqsOverlay) pyqsOverlay.style.display = "none";
          loginScreen.style.display = "none";
          appEl.setAttribute("aria-hidden", "false");
          requestAppFullscreen();
        } finally {
          hideLoadingOverlay();
        }
      }

      async function openPyqsWindow() {
        showLoadingOverlay("Loading PYQs");
        try {
          if (!(currentUser && currentUser.pyqsEnabled)) {
            alert("PYQs is locked for your account. Contact admin. MRP 199/-");
            returnToHomeView();
            return;
          }
          closePyqImageModal();
          if (pyqsOverlay) pyqsOverlay.style.display = "flex";
          if (historyOverlay) historyOverlay.style.display = "none";
          if (detailOverlay) detailOverlay.style.display = "none";
          if (!pyqsGrid) return;
          pyqsGrid.innerHTML = "";

          if (!db) {
            pyqsGrid.innerHTML =
              '<div class="result-history-card"><div class="result-row-1"><i data-lucide="database-zap"></i><h4 class="result-history-title">PYQs unavailable</h4></div><div class="result-row-2"><span class="result-meta-item"><i data-lucide="info"></i> DB not configured.</span></div></div>';
            if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
            return;
          }

          const snap = await db.collection("pyqs").get().catch(() => ({ docs: [] }));
          const docs = snap && Array.isArray(snap.docs) ? snap.docs : [];
          if (!docs.length) {
            pyqsGrid.innerHTML =
              '<div class="result-history-card"><div class="result-row-1"><i data-lucide="inbox"></i><h4 class="result-history-title">No PYQs found</h4></div><div class="result-row-2"><span class="result-meta-item"><i data-lucide="info"></i> Collection <strong>pyqs</strong> is empty.</span></div></div>';
            if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
            return;
          }

          const chapterMap = {};
          docs.forEach((doc) => {
            const d = doc.data() || {};
            const chapterName = String(d.chapter || "").trim() || "Uncategorized";
            if (!chapterMap[chapterName]) chapterMap[chapterName] = [];
            chapterMap[chapterName].push({
              id: doc.id,
              chapter: chapterName,
              data: d,
              imageUrl: findImageFromDoc(d),
            });
          });

          const chapterNames = Object.keys(chapterMap).sort((a, b) =>
            a.localeCompare(b, "en", { sensitivity: "base" }),
          );

          chapterNames.forEach((chapterName) => {
            const groupEl = document.createElement("section");
            groupEl.className = "pyq-chapter-group";

            const headEl = document.createElement("div");
            headEl.className = "pyq-group-head";

            const homeBtn = document.createElement("button");
            homeBtn.type = "button";
            homeBtn.className = "pyq-home-btn";
            homeBtn.setAttribute("aria-label", "Go to home");
            homeBtn.innerHTML = '<i data-lucide="house"></i>';
            homeBtn.addEventListener("click", () => returnToHomeView());
            headEl.appendChild(homeBtn);

            const startBtn = document.createElement("button");
            startBtn.type = "button";
            startBtn.className = "pyq-start-btn";
            startBtn.innerHTML = '<i data-lucide="play-circle"></i><span>Start</span>';
            startBtn.addEventListener("click", () => {
              startPyqChapterMock(chapterName, chapterMap[chapterName]);
            });

            const titleEl = document.createElement("h4");
            titleEl.className = "pyq-group-title";
            titleEl.textContent = chapterName;
            headEl.appendChild(titleEl);
            headEl.appendChild(startBtn);
            groupEl.appendChild(headEl);

            const gridEl = document.createElement("div");
            gridEl.className = "pyq-chapter-grid";

            chapterMap[chapterName].forEach((item, idx) => {
              const card = document.createElement("div");
              card.className = "pyq-card";
              const label = `${chapterName} - Q${idx + 1}`;
              card.innerHTML = `
                <button class="pyq-view-btn" type="button" aria-label="View question image">
                  <i data-lucide="expand"></i>
                </button>
                <div class="pyq-image-wrap">
                  ${
                    item.imageUrl
                      ? `<img class="pyq-image" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(label)}" loading="lazy" />`
                      : `<div class="pyq-image-empty">No image</div>`
                  }
                </div>
              `;
              const viewBtn = card.querySelector(".pyq-view-btn");
              if (viewBtn) {
                viewBtn.addEventListener("click", () => {
                  openPyqImageModal(item.imageUrl, label);
                });
              }
              gridEl.appendChild(card);
            });

            groupEl.appendChild(gridEl);
            pyqsGrid.appendChild(groupEl);
          });

          if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
          }
        } catch (e) {
          console.error(e);
          if (pyqsGrid) {
            pyqsGrid.innerHTML =
              '<div class="result-history-card"><div class="result-row-1"><i data-lucide="alert-triangle"></i><h4 class="result-history-title">Load failed</h4></div><div class="result-row-2"><span class="result-meta-item"><i data-lucide="info"></i> Failed to load PYQs from collection.</span></div></div>';
            if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
          }
        } finally {
          hideLoadingOverlay();
        }
      }

      async function openResultsWindow() {
        showLoadingOverlay("Loading results");
        try {
          if (historyOverlay) historyOverlay.style.display = "flex";
          if (detailOverlay) detailOverlay.style.display = "none";
          if (!historyGrid) return;
          historyGrid.innerHTML = "";

          if (!db) {
            historyGrid.innerHTML =
              '<div class="result-history-card"><div class="result-row-1"><i data-lucide="database-zap"></i><h4 class="result-history-title">Results unavailable</h4></div><div class="result-row-2"><span class="result-meta-item"><i data-lucide="info"></i> DB not configured.</span></div><div class="result-row-3"></div></div>';
            if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
            return;
          }
          if (!currentUser) {
            historyGrid.innerHTML =
              '<div class="result-history-card"><div class="result-row-1"><i data-lucide="log-in"></i><h4 class="result-history-title">Login required</h4></div><div class="result-row-2"><span class="result-meta-item"><i data-lucide="info"></i> Login to view results.</span></div><div class="result-row-3"></div></div>';
            if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
            return;
          }

          const docs = await fetchCurrentUserResultDocs();
          const groups = buildResultGroups(docs);
          if (!groups.length) {
            historyGrid.innerHTML =
              '<div class="result-history-card"><div class="result-row-1"><i data-lucide="inbox"></i><h4 class="result-history-title">No attempts yet</h4></div><div class="result-row-2"><span class="result-meta-item"><i data-lucide="info"></i> Start a mock to see your results here.</span></div><div class="result-row-3"></div></div>';
            if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
            return;
          }
          renderResultsRows(groups);
        } catch (e) {
          console.error(e);
          historyGrid.innerHTML =
            '<div class="result-history-card"><div class="result-row-1"><i data-lucide="alert-triangle"></i><h4 class="result-history-title">Load failed</h4></div><div class="result-row-2"><span class="result-meta-item"><i data-lucide="info"></i> Failed to load results.</span></div><div class="result-row-3"></div></div>';
          if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
        } finally {
          hideLoadingOverlay();
        }
      }

      async function showDetailFromDoc(doc, meta = {}) {
        showLoadingOverlay("Loading result");
        try {
          const d = (doc && doc.data && doc.data()) || doc || {};
          const single = {
            docId: doc && doc.id ? doc.id : null,
            data: d,
            savedMs: resultsToMs(d.date),
            savedText: resultsFormatDateTime(d.date),
            attemptNo: typeof meta.attemptNo === "number" ? meta.attemptNo : 1,
          };
          const fallbackGroup = {
            mockId: d.mockId || null,
            mockName:
              String(meta.mockName || d.mockName || getMockNameFromId(d.mockId) || "Mock").trim() ||
              "Mock",
            attempts: [null, null, null],
            latestMs: single.savedMs,
          };
          const idx = Math.max(0, Math.min(2, single.attemptNo - 1));
          fallbackGroup.attempts[idx] = single;

          if (db && currentUser && d.mockId) {
            try {
              const docs = await fetchCurrentUserResultDocs();
              const groups = buildResultGroups(docs);
              const match = groups.find(
                (g) => String(g.mockId || "") === String(d.mockId || ""),
              );
              if (match) {
                showMockDetail(match, single.attemptNo, true);
                return;
              }
            } catch (e) {
              console.warn("show detail fallback", e);
            }
          }
          showMockDetail(fallbackGroup, single.attemptNo, true);
        } finally {
          hideLoadingOverlay();
        }
      }

      /* ========== init ========== */
      // initial fallback sample
      questions = sampleBank();
      // Build an initial sectionMap from sampleBank
      (function buildInitialSectionMap() {
        const map = {};
        for (let i = 0; i < questions.length; i++) {
          const s = questions[i].section || "Unknown";
          if (!map[s]) map[s] = [];
          map[s].push(i);
        }
        const preferred = ["Physics", "Chemistry", "Mathematics"];
        const ordered = {};
        preferred.forEach((p) => {
          if (map[p]) ordered[p] = map[p];
        });
        Object.keys(map).forEach((k) => {
          if (!ordered[k]) ordered[k] = map[k];
        });
        sectionMap = ordered;
      })();

      responses = questions.map(() => ({
        choiceIndex: null,
        markedReview: false,
        timeSpentSec: 0,
        viewed: false,
      }));
      questionTimers = questions.map(() => null);
      current = 0;
      renderQuestion();
      renderPicker("Physics");
      initLoginStatsCounters();
      initCeeCountdown();
      applyMobileLayout();

      (async () => {
        if (db) await loadMocks();
        else {
          mocksList = [
            {
              id: "local-1",
              name: "Mock 1",
              time: "120",
              qns: "60",
              syllabus: "Full CEE",
              active: "yes",
              img_p1: "https://via.placeholder.com/600x360?text=P1",
              ans_p1: "A",
              img_c1: "https://via.placeholder.com/600x360?text=C1",
              ans_c1: "B",
              img_m1: "https://via.placeholder.com/600x360?text=M1",
              ans_m1: "C",
            },
            {
              id: "local-2",
              name: "Mock 2 (Archived)",
              time: "90",
              qns: "30",
              syllabus: "Physics only",
              active: "no",
            },
          ];
          await renderMocks();
        }
      })();

      // auto-focus username when login shows
      // If you programmatically show login screen elsewhere, call: loginUsername.focus()

      function updateSectionTabs() {
        const phyBtn = document.getElementById("btn-phy");
        const chemBtn = document.getElementById("btn-chem");
        const mathBtn = document.getElementById("btn-math");

        const hasPhysics =
          sectionMap && sectionMap.Physics && sectionMap.Physics.length;
        const hasChem =
          sectionMap && sectionMap.Chemistry && sectionMap.Chemistry.length;
        const hasMath =
          sectionMap && sectionMap.Mathematics && sectionMap.Mathematics.length;

        // Keep all 3 sections visible for every mock.
        phyBtn.style.display = "inline-block";
        chemBtn.style.display = "inline-block";
        mathBtn.style.display = "inline-block";

        // return first available section (priority order)
        if (hasPhysics) return "Physics";
        if (hasChem) return "Chemistry";
        if (hasMath) return "Mathematics";
        return null;
      }

      applySubscriptionBranding(null);

      document.addEventListener("dragstart", (e) => {
        if (e.target.tagName === "IMG") e.preventDefault();
      });

      document.addEventListener("contextmenu", (e) => {
        if (e.target.tagName === "IMG") e.preventDefault();
      });

      document.addEventListener("mousedown", (e) => {
        if (e.target.tagName === "IMG") e.preventDefault();
      });

