import { useEffect, useRef, useState } from "react";
import "./App.css";
const API_URL = import.meta.env.VITE_API_URL;
function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  // Success-style feedback (e.g. "Account created successfully. Please log in.")
  // kept separate from authError so it can be styled green instead of red.
  const [authNotice, setAuthNotice] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  // Toggles the password field between masked ("password") and
  // plain-text ("text") so the user can show/hide what they typed.
  const [showPassword, setShowPassword] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [newJob, setNewJob] = useState({
    company: "",
    role: "",
    location: "",
    salary: "",
    status: "Applied",
  });
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [openJobMenu, setOpenJobMenu] = useState(null);
  const [dropdownFlip, setDropdownFlip] = useState(false);
  const [updatingJobId, setUpdatingJobId] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [menuError, setMenuError] = useState("");

  // Local reminders are persisted in the browser until a reminders backend is added.
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem("jobflow_reminders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newReminder, setNewReminder] = useState({
    title: "",
    dueDate: new Date().toISOString().slice(0, 10),
  });
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  // Resume / ATS state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeScore, setResumeScore] = useState(null);
  const [resumeSuggestions, setResumeSuggestions] = useState([]);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const resumeInputRef = useRef(null);

  // Ref map so we can measure each row's menu button position on demand
  const jobMenuRefs = useRef({});

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const getBearerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const statusOptions = [
    { value: "Applied", color: "#60a5fa", bg: "rgba(59, 130, 246, 0.12)", dot: "#3b82f6" },
    { value: "Screening", color:  "#ebd19f", bg: "rgba(139, 92, 246, 0.12)", dot: "#ebd19f" },
    { value: "Interview", color: "#fbbf24", bg: "rgba(245, 158, 11, 0.12)", dot: "#f59e0b" },
    { value: "Offer", color: "#4ade80", bg: "rgba(34, 197, 94, 0.12)", dot: "#22c55e" },
    { value: "Rejected", color: "#fb7185", bg: "rgba(225, 29, 72, 0.12)", dot: "#e11d48" },
  ];

  // Approximate height of the full dropdown menu (title + 5 options + divider + delete)
  const DROPDOWN_ESTIMATED_HEIGHT = 330;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // Validate the saved JWT and load the current user.
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setAuthLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: getBearerHeaders(),
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          setCurrentUser(null);
          setIsAuthenticated(false);
          return;
        }

        const user = await response.json();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Authentication check failed:", err);
        localStorage.removeItem("token");
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthentication();
    // getBearerHeaders is stable enough for this one-time startup check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!isAuthenticated) {
        setApplications([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/jobs`, {
          headers: getAuthHeaders(),
        });

        if (response.status === 401) {
          handleLogout();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }

        const data = await response.json();
        const jobsWithLogos = (data.jobs || []).map((job) => ({
          ...job,
          logo: job.company ? job.company.charAt(0).toUpperCase() : "?",
        }));
        setApplications(jobsWithLogos);
        setError("");
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Unable to load applications. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Close the open dropdown on outside click, and reposition on scroll/resize
  useEffect(() => {
    if (openJobMenu === null) return;

    const handleClickOutside = (e) => {
      const el = jobMenuRefs.current[openJobMenu];
      if (el && !el.contains(e.target)) {
        setOpenJobMenu(null);
      }
    };

    const handleReposition = () => {
      recalcFlip(openJobMenu);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openJobMenu]);

  // Measures the actual space below the trigger button and decides whether
  // the dropdown should flip upward, instead of guessing from row index.
  const recalcFlip = (jobId) => {
    const triggerEl = jobMenuRefs.current[jobId];
    if (!triggerEl) return;

    const rect = triggerEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;

    setDropdownFlip(spaceBelow < DROPDOWN_ESTIMATED_HEIGHT);
  };

  const toggleJobMenu = (jobId) => {
    setMenuError("");
    setOpenJobMenu((prev) => {
      const next = prev === jobId ? null : jobId;
      if (next !== null) {
        // Measure after the button is guaranteed to be in the DOM
        requestAnimationFrame(() => recalcFlip(next));
      }
      return next;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewJob((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddApplication = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!newJob.company.trim() || !newJob.role.trim()) {
      setFormError("Company and job role are required.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newJob),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to add application.");
      }

      const createdJob = {
        ...data,
        logo: data.company
          ? data.company.charAt(0).toUpperCase()
          : "?",
      };

      setApplications((prev) => [...prev, createdJob]);

      setNewJob({
        company: "",
        role: "",
        location: "",
        salary: "",
        status: "Applied",
      });

      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding application:", err);
      setFormError(err.message || "Unable to add application.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApplications = applications.filter((job) =>
    `${job.company} ${job.role} ${job.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Dynamic dashboard statistics from PostgreSQL data
  const totalApplications = applications.length;
  const appliedCount = applications.filter((job) => job.status === "Applied").length;
  const screeningCount = applications.filter((job) => job.status === "Screening").length;
  const interviewCount = applications.filter((job) => job.status === "Interview").length;
  const offerCount = applications.filter((job) => job.status === "Offer").length;
  const rejectedCount = applications.filter((job) => job.status === "Rejected").length;

  const interviewRate =
    totalApplications > 0
      ? Math.round((interviewCount / totalApplications) * 100)
      : 0;

  const offerRate =
    totalApplications > 0
      ? Math.round((offerCount / totalApplications) * 1000) / 10
      : 0;

  // Analytics calculations from the same live application data.
  const salaryValues = applications
    .map((job) => {
      const numbers = String(job.salary || "")
        .replace(/,/g, "")
        .match(/\d+(?:\.\d+)?/g);

      if (!numbers || numbers.length === 0) return null;

      const values = numbers.map(Number).filter((value) => Number.isFinite(value));
      if (values.length === 0) return null;

      return values.reduce((sum, value) => sum + value, 0) / values.length;
    })
    .filter((value) => value !== null);

  const averageSalary =
    salaryValues.length > 0
      ? salaryValues.reduce((sum, value) => sum + value, 0) / salaryValues.length
      : 0;

  const highestSalary = salaryValues.length > 0 ? Math.max(...salaryValues) : 0;
  const lowestSalary = salaryValues.length > 0 ? Math.min(...salaryValues) : 0;

  const companyCounts = applications.reduce((acc, job) => {
    const company = String(job.company || "Unknown").trim() || "Unknown";
    acc[company] = (acc[company] || 0) + 1;
    return acc;
  }, {});

  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const activeApplications = totalApplications - rejectedCount;
  const responseRate =
    totalApplications > 0
      ? Math.round(((screeningCount + interviewCount + offerCount) / totalApplications) * 100)
      : 0;
  const offerConversionFromInterviews =
    interviewCount > 0
      ? Math.round((offerCount / interviewCount) * 100)
      : 0;

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      setUpdatingJobId(jobId);
      setMenuError("");

      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          company: applications.find((job) => job.id === jobId)?.company || "",
          role: applications.find((job) => job.id === jobId)?.role || "",
          location: applications.find((job) => job.id === jobId)?.location || "",
          salary: applications.find((job) => job.id === jobId)?.salary || "",
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update status.");
      }

      setApplications((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? { ...job, status: newStatus }
            : job
        )
      );

      setOpenJobMenu(null);
    } catch (err) {
      console.error("Error updating application status:", err);
      setMenuError(err.message || "Unable to update status.");
    } finally {
      setUpdatingJobId(null);
    }
  };
  const handleDeleteApplication = async (jobId) => {
    const job = applications.find((item) => item.id === jobId);

    const confirmed = window.confirm(
      `Delete ${job?.company || "this application"}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingJobId(jobId);
      setMenuError("");

      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: "DELETE",
        headers: getBearerHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete application.");
      }

      setApplications((prev) => prev.filter((item) => item.id !== jobId));
      setOpenJobMenu(null);
    } catch (err) {
      console.error("Error deleting application:", err);
      setMenuError(err.message || "Unable to delete application.");
    } finally {
      setDeletingJobId(null);
    }
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Returns a time-of-day-appropriate greeting based on the given Date.
  // Driven by currentTime (which ticks every second), so the dashboard
  // greeting updates automatically without a page refresh.
  const getGreeting = (date) => {
    const hour = date.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    try {
      localStorage.setItem("jobflow_reminders", JSON.stringify(reminders));
    } catch (err) {
      console.warn("Unable to persist reminders:", err);
    }
  }, [reminders]);

  const handleAddReminder = (e) => {
    e.preventDefault();
    const title = newReminder.title.trim();
    if (!title || !newReminder.dueDate) return;

    setReminders((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        dueDate: newReminder.dueDate,
        completed: false,
      },
    ]);
    setNewReminder({
      title: "",
      dueDate: new Date().toISOString().slice(0, 10),
    });
  };

  const toggleReminder = (id) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id
          ? { ...reminder, completed: !reminder.completed }
          : reminder
      )
    );
  };

  const deleteReminder = (id) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  };

  const reminderSearch = search.trim().toLowerCase();
  const filteredReminders = reminders.filter((reminder) =>
    reminder.title.toLowerCase().includes(reminderSearch)
  );
  const pendingReminderCount = reminders.filter((reminder) => !reminder.completed).length;

  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const firstWeekday = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const daysInCalendarMonth = new Date(
    calendarYear,
    calendarMonthIndex + 1,
    0
  ).getDate();
  const calendarCells = Array.from(
    { length: Math.ceil((firstWeekday + daysInCalendarMonth) / 7) * 7 },
    (_, index) => {
      const dayNumber = index - firstWeekday + 1;
      if (dayNumber < 1 || dayNumber > daysInCalendarMonth) return null;
      return new Date(calendarYear, calendarMonthIndex, dayNumber);
    }
  );
  const calendarMonthLabel = calendarMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const changeCalendarMonth = (offset) => {
    setCalendarMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  };

  const goToToday = () => {
    const today = new Date();
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      setResumeError("Please upload a PDF, DOCX, or TXT resume.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeError("Resume must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
    setResumeScore(null);
    setResumeSuggestions([]);
    setResumeError("");
    setResumeLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/resume/ats-score`, {
        method: "POST",
        headers: getBearerHeaders(),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to analyze resume.");
      }

      const score = data.score ?? data.ats_score ?? data.atsScore ?? null;
      const suggestions = data.suggestions ?? data.recommendations ?? [];

      setResumeScore(score);
      setResumeSuggestions(Array.isArray(suggestions) ? suggestions : []);
    } catch (err) {
      console.error("Resume ATS error:", err);
      setResumeError(err.message || "Unable to analyze resume.");
    } finally {
      setResumeLoading(false);
    }
  };

  const removeResume = () => {
    setResumeFile(null);
    setResumeScore(null);
    setResumeSuggestions([]);
    setResumeError("");
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthNotice("");
    setAuthSubmitting(true);

    try {
      const endpoint =
        authMode === "login"
          ? `${API_URL}/auth/login`
          : `${API_URL}/auth/register`;

      const payload =
        authMode === "login"
          ? {
              email: authEmail.trim(),
              password: authPassword,
            }
          : {
              name: authName.trim(),
              email: authEmail.trim(),
              password: authPassword,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail = Array.isArray(data.detail)
          ? data.detail.map((item) => item.msg).join(", ")
          : data.detail || data.message;
        throw new Error(detail || "Authentication failed.");
      }

      // Register endpoints sometimes return only a message. In that case,
      // switch back to Login so the user can sign in with the new account.
      const token = data.access_token || data.token;

      if (!token) {
        if (authMode === "register") {
          setAuthMode("login");
          // Successful account creation — shown in green, not the red error box.
          setAuthNotice("Account registered successfully. Please log in.");
          setAuthError("");
          setAuthPassword("");
          return;
        }
        throw new Error("No authentication token received from the backend.");
      }

      localStorage.setItem("token", token);

      const userFromLogin = data.user || null;
      if (userFromLogin) {
        setCurrentUser(userFromLogin);
      }

      // Confirm the token and get the canonical user object from the backend.
      const meResponse = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (meResponse.ok) {
        const user = await meResponse.json();
        setCurrentUser(user);
      }

      setIsAuthenticated(true);
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      setAuthError("");
      setAuthNotice("");
    } catch (err) {
      console.error("Authentication error:", err);
      setAuthNotice("");
      setAuthError(err.message || "Something went wrong.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setApplications([]);
    setOpenJobMenu(null);
    setSearch("");
    setActivePage("Dashboard");
  };

  const modalInputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    background: "rgba(255, 255, 255, 0.045)",
    color: "#f5f3ff",
    outline: "none",
    fontSize: "14px",
  };

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090f",
          color: "#f5f3ff",
          fontSize: "15px",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          boxSizing: "border-box",
          background:
            "radial-gradient(circle at top left, rgba(139,92,246,.18), transparent 35%), radial-gradient(circle at bottom right, rgba(236,72,153,.10), transparent 35%), #09090f",
          color: "#f5f3ff",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "430px",
            padding: "34px",
            borderRadius: "24px",
            border: "1px solid rgba(139,92,246,.25)",
            background: "rgba(15,15,25,.94)",
            boxShadow: "0 30px 100px rgba(0,0,0,.55)",
            boxSizing: "border-box",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "26px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                margin: "0 auto 14px",
                display: "grid",
                placeItems: "center",
                borderRadius: "15px",
                background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                color: "white",
                fontSize: "24px",
                fontWeight: 800,
              }}
            >
              J
            </div>
            <h1 style={{ margin: 0, fontSize: "28px" }}>JobFlow</h1>
            <p style={{ margin: "8px 0 0", color: "#777388", fontSize: "13px" }}>
              Career Command Center
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", marginBottom: "22px" }}>
            {[
              ["login", "Login"],
              ["register", "Register"],
            ].map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setAuthMode(mode);
                  setAuthError("");
                  setAuthNotice("");
                }}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  border: "1px solid rgba(139,92,246,.2)",
                  background:
                    authMode === mode ? "rgba(139,92,246,.18)" : "transparent",
                  color: "#c4b5fd",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <label style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "15px" }}>
                <span style={{ color: "#aaa5b8", fontSize: "12px" }}>Name</span>
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Your name"
                  required
                  style={modalInputStyle}
                />
              </label>
            )}

            <label style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "15px" }}>
              <span style={{ color: "#aaa5b8", fontSize: "12px" }}>Email</span>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={modalInputStyle}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "18px" }}>
              <span style={{ color: "#aaa5b8", fontSize: "12px" }}>Password</span>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  style={{ ...modalInputStyle, paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "10px",
                    transform: "translateY(-50%)",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    background: "transparent",
                    color: "#aaa5b8",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showPassword ? (
                    // Eye-off icon (password currently visible; click to hide)
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-6 0-10-6-10-8a13.16 13.16 0 0 1 3.06-4.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6 0 10 6 10 8a13.28 13.28 0 0 1-1.67 2.68" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <path d="M1 1l22 22" />
                    </svg>
                  ) : (
                    // Eye icon (password currently hidden; click to show)
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {authNotice && (
              <div
                style={{
                  marginBottom: "15px",
                  padding: "11px 12px",
                  borderRadius: "9px",
                  background: "rgba(34,197,94,.08)",
                  border: "1px solid rgba(34,197,94,.25)",
                  color: "#4ade80",
                  fontSize: "12px",
                  lineHeight: 1.4,
                }}
              >
                {authNotice}
              </div>
            )}

            {authError && (
              <div
                style={{
                  marginBottom: "15px",
                  padding: "11px 12px",
                  borderRadius: "9px",
                  background: "rgba(225,29,72,.08)",
                  border: "1px solid rgba(225,29,72,.22)",
                  color: "#fb7185",
                  fontSize: "12px",
                  lineHeight: 1.4,
                }}
              >
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              style={{
                width: "100%",
                padding: "13px",
                border: "none",
                borderRadius: "11px",
                background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                color: "white",
                cursor: authSubmitting ? "not-allowed" : "pointer",
                fontWeight: 700,
                opacity: authSubmitting ? 0.7 : 1,
              }}
            >
              {authSubmitting
                ? "Please wait..."
                : authMode === "login"
                  ? "Login to JobFlow"
                  : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
      /* Sidebar layout fix: keep Resume ATS and Profile in normal flow */
      .sidebar {
        display: flex !important;
        flex-direction: column !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }
      .resume-ats-card {
        margin-top:18px;
        margin-bottom:12px;
        padding:14px;
        border:1px solid rgba(139,92,246,.22);
        border-radius:16px;
        background:linear-gradient(145deg,rgba(139,92,246,.10),rgba(225,29,72,.05));
        box-sizing:border-box;
        flex-shrink:0;
        position:relative !important;
        bottom:auto !important;
      }
      .profile {
        position:relative !important;
        left:auto !important;
        right:auto !important;
        bottom:auto !important;
        top:auto !important;
        margin-top:0 !important;
        flex-shrink:0 !important;
      }
      .resume-ats-upload,
      .resume-ats-change,
      .resume-ats-remove {
        position:relative;
        z-index:2;
      }
      .resume-ats-top { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
      .resume-ats-icon { width:32px; height:32px; display:grid; place-items:center; border-radius:10px; background:rgba(139,92,246,.16); color:#c4b5fd; font-size:16px; }
      .resume-ats-title { min-width:0; }
      .resume-ats-title strong { display:block; color:#f5f3ff; font-size:12px; }
      .resume-ats-title span { display:block; margin-top:2px; color:#777388; font-size:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .resume-ats-upload { width:100%; padding:9px 10px; border:1px dashed rgba(139,92,246,.38); border-radius:10px; background:rgba(139,92,246,.07); color:#c4b5fd; cursor:pointer; font-size:11px; font-weight:600; }
      .resume-ats-upload:hover { background:rgba(139,92,246,.13); }
      .resume-ats-score { display:flex; align-items:center; gap:10px; margin-top:10px; padding:9px; border-radius:10px; background:rgba(255,255,255,.035); }
      .resume-ats-score-number { font-size:23px; font-weight:800; color:#c4b5fd; line-height:1; }
      .resume-ats-score-label { color:#aaa5b8; font-size:10px; }
      .resume-ats-message { margin-top:8px; color:#777388; font-size:10px; line-height:1.4; }
      .resume-ats-error { margin-top:8px; color:#fb7185; font-size:10px; line-height:1.4; }
      .resume-ats-actions { display:flex; gap:6px; margin-top:8px; }
      .resume-ats-change, .resume-ats-remove { flex:1; padding:7px 8px; border-radius:8px; cursor:pointer; font-size:10px; }
      .resume-ats-change { border:1px solid rgba(139,92,246,.22); background:rgba(139,92,246,.08); color:#c4b5fd; }
      .resume-ats-remove { border:1px solid rgba(225,29,72,.2); background:rgba(225,29,72,.06); color:#fb7185; }
      .resume-ats-suggestions { margin:8px 0 0; padding-left:15px; color:#8f8ca3; font-size:9px; line-height:1.5; }
      .page-content { padding-bottom: 40px; }
      .page-hero { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:26px; }
      .page-hero h1 { margin:8px 0 8px; font-size:42px; line-height:1.05; letter-spacing:-1.5px; }
      .page-hero h1 span { color:#a78bfa; }
      .page-hero p { margin:0; color:#8f8ca3; max-width:720px; }
      .page-toolbar { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:18px; }
      .page-search { flex:1; max-width:620px; display:flex; align-items:center; gap:10px; padding:12px 15px; border:1px solid rgba(139,92,246,.18); border-radius:14px; background:rgba(255,255,255,.035); }
      .page-search span { color:#8b5cf6; font-size:20px; }
      .page-search input { width:100%; border:0; outline:0; background:transparent; color:#f5f3ff; font-size:14px; }
      .page-search input::placeholder { color:#706d7e; }
      .page-toolbar-count { color:#8f8ca3; font-size:12px; white-space:nowrap; }
      .full-width-card { width:100%; box-sizing:border-box; }
      .page-empty-state { min-height:180px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:#8f8ca3; gap:7px; padding:30px; }
      .page-empty-state strong { color:#f5f3ff; font-size:16px; }
      .page-empty-state p { margin:0; max-width:520px; line-height:1.5; }
      .compact-add { margin-top:12px; padding:10px 16px !important; }
      .application-inline-actions { margin-left:auto; display:flex; align-items:center; gap:8px; }
      .application-inline-actions select { min-width:120px; padding:8px 10px; border-radius:9px; border:1px solid rgba(139,92,246,.25); background:#171326; color:#f5f3ff; outline:none; }
      .application-delete-button { padding:8px 10px; border:1px solid rgba(225,29,72,.25); border-radius:9px; background:rgba(225,29,72,.08); color:#fb7185; cursor:pointer; }
      .application-delete-button:disabled { opacity:.55; cursor:not-allowed; }
      .secondary-page-button { padding:12px 18px; border-radius:12px; border:1px solid rgba(139,92,246,.28); background:rgba(139,92,246,.08); color:#c4b5fd; cursor:pointer; font-weight:600; }
      .calendar-layout { display:grid; grid-template-columns:minmax(0,2fr) minmax(280px,1fr); gap:18px; }
      .calendar-panel, .calendar-side-panel, .reminder-form-card { border:1px solid rgba(255,255,255,.08); border-radius:20px; background:rgba(10,10,18,.72); padding:22px; box-sizing:border-box; }
      .calendar-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:22px; }
      .calendar-header h2 { margin:0 0 5px; font-size:20px; color:#f5f3ff; }
      .calendar-header p { margin:0; color:#777388; font-size:12px; }
      .calendar-controls { display:flex; gap:7px; }
      .calendar-controls button { padding:8px 11px; border:1px solid rgba(139,92,246,.2); border-radius:9px; background:rgba(255,255,255,.035); color:#b9b3ca; cursor:pointer; }
      .calendar-weekdays, .calendar-grid { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); gap:6px; }
      .calendar-weekdays { margin-bottom:6px; }
      .calendar-weekdays span { padding:7px; color:#706d7e; font-size:11px; text-align:center; text-transform:uppercase; }
      .calendar-day { min-height:92px; border:1px solid rgba(255,255,255,.055); border-radius:10px; padding:8px; background:rgba(255,255,255,.018); overflow:hidden; }
      .calendar-day.today { border-color:rgba(139,92,246,.5); box-shadow:inset 0 0 0 1px rgba(139,92,246,.08); }
      .calendar-day.empty { background:transparent; border-color:transparent; }
      .calendar-day-number { color:#bcb7c9; font-size:12px; margin-bottom:7px; }
      .calendar-day.today .calendar-day-number { color:#c4b5fd; font-weight:700; }
      .calendar-day-events { display:flex; flex-direction:column; gap:4px; }
      .calendar-event { width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding:5px 6px; border:0; border-radius:6px; background:rgba(139,92,246,.12); color:#c4b5fd; text-align:left; font-size:10px; cursor:pointer; }
      .calendar-event.completed { opacity:.45; text-decoration:line-through; }
      .calendar-more { color:#777388; font-size:10px; padding-left:4px; }
      .calendar-side-panel .section-header { margin-bottom:10px; }
      .upcoming-reminder { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:13px 0; border-bottom:1px solid rgba(255,255,255,.055); }
      .upcoming-reminder:last-child { border-bottom:0; }
      .upcoming-reminder div { min-width:0; display:flex; flex-direction:column; gap:4px; }
      .upcoming-reminder strong { color:#f1eef9; font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .upcoming-reminder span { color:#777388; font-size:11px; }
      .upcoming-reminder button { width:28px; height:28px; border-radius:8px; border:1px solid rgba(34,197,94,.2); background:rgba(34,197,94,.08); color:#4ade80; cursor:pointer; }
      .compact-empty { min-height:120px; padding:15px; }
      .reminder-summary { min-width:105px; padding:14px 18px; border:1px solid rgba(139,92,246,.2); border-radius:14px; background:rgba(139,92,246,.08); text-align:center; }
      .reminder-summary strong { display:block; color:#c4b5fd; font-size:24px; }
      .reminder-summary span { color:#777388; font-size:11px; }
      .reminder-layout { display:grid; grid-template-columns:minmax(280px,.8fr) minmax(0,1.7fr); gap:18px; }
      .reminder-form { display:flex; flex-direction:column; gap:15px; }
      .reminder-form label { display:flex; flex-direction:column; gap:7px; }
      .reminder-form label span { color:#aaa5b8; font-size:12px; }
      .reminder-form input { box-sizing:border-box; width:100%; padding:12px 13px; border:1px solid rgba(139,92,246,.2); border-radius:11px; background:rgba(255,255,255,.035); color:#f5f3ff; outline:none; }
      .reminder-submit { width:100%; justify-content:center; }
      .reminder-list { display:flex; flex-direction:column; }
      .reminder-row { display:flex; align-items:center; gap:13px; padding:14px 0; border-bottom:1px solid rgba(255,255,255,.055); }
      .reminder-row:last-child { border-bottom:0; }
      .reminder-check { width:25px; height:25px; flex:0 0 25px; border-radius:8px; border:1px solid rgba(139,92,246,.35); background:rgba(139,92,246,.06); color:#4ade80; cursor:pointer; }
      .reminder-row.completed .reminder-check { border-color:rgba(34,197,94,.35); background:rgba(34,197,94,.1); }
      .reminder-info { flex:1; min-width:0; display:flex; flex-direction:column; gap:5px; }
      .reminder-info strong { color:#f1eef9; font-size:14px; }
      .reminder-info span { color:#777388; font-size:11px; }
      .reminder-row.completed .reminder-info strong { color:#777388; text-decoration:line-through; }
      .reminder-delete { border:0; background:transparent; color:#fb7185; cursor:pointer; font-size:12px; }
      @media (max-width: 900px) {
        .sidebar {
          overflow-y: auto !important;
        }
        .resume-ats-card {
          margin-top:14px;
        }
        .profile {
          margin-top:10px !important;
        }
      }

      @media (max-width: 1000px) {
        .calendar-layout, .reminder-layout { grid-template-columns:1fr; }
      }
      @media (max-width: 700px) {
        .page-hero, .page-toolbar, .calendar-header { align-items:stretch; flex-direction:column; }
        .page-hero h1 { font-size:32px; }
        .calendar-day { min-height:70px; }
        .application-inline-actions { margin-left:0; }
      }
    `}</style>
    <div className="app">
      {}
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>
      <div className="background-glow glow-three"></div>
      {}
      <aside className="sidebar">
        {}
        <div className="brand">
          <div className="brand-icon">
            J
          </div>
          <div className="brand-text">
            <h2>JobFlow</h2>
            <span>Career Command Center</span>
          </div>
        </div>
        {}
        <div className="menu-label">
          MAIN MENU
        </div>
        <nav className="navigation">
          <button
            className={`nav-item ${
              activePage === "Dashboard" ? "active" : ""
            }`}
            onClick={() => setActivePage("Dashboard")}
          >
            <span className="nav-icon">⌂</span>
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${
              activePage === "Applications" ? "active" : ""
            }`}
            onClick={() => setActivePage("Applications")}
          >
            <span className="nav-icon">▣</span>
            <span>Applications</span>
            <span className="nav-count">
              {totalApplications}
            </span>
          </button>
          <button
            className={`nav-item ${
              activePage === "Analytics" ? "active" : ""
            }`}
            onClick={() => setActivePage("Analytics")}
          >
            <span className="nav-icon">◒</span>
            <span>Analytics</span>
          </button>
          <button
            className={`nav-item ${
              activePage === "Calendar" ? "active" : ""
            }`}
            onClick={() => setActivePage("Calendar")}
          >
            <span className="nav-icon">□</span>
            <span>Calendar</span>
          </button>
          <button
            className={`nav-item ${
              activePage === "Reminders" ? "active" : ""
            }`}
            onClick={() => setActivePage("Reminders")}
          >
            <span className="nav-icon">♧</span>
            <span>Reminders</span>
            <span className="nav-count red">
              {pendingReminderCount}
            </span>
          </button>
        </nav>
        {}
        <div className="datetime-card">
          <div className="datetime-icon">
            ◷
          </div>
          <div className="datetime-info">
            <strong>
              {currentTime.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </strong>
            <span>
              {currentTime.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
          <small>
            IST
          </small>
        </div>
        {}
        <div className="resume-ats-card">
          <div className="resume-ats-top">
            <div className="resume-ats-icon">▤</div>
            <div className="resume-ats-title">
              <strong>Resume ATS</strong>
              <span>{resumeFile ? resumeFile.name : "Upload your resume"}</span>
            </div>
          </div>

          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleResumeUpload}
            style={{ display: "none" }}
          />

          {!resumeFile ? (
            <button
              type="button"
              className="resume-ats-upload"
              onClick={() => resumeInputRef.current?.click()}
            >
              Upload Resume
            </button>
          ) : (
            <>
              {resumeLoading ? (
                <div className="resume-ats-message">Analyzing your resume...</div>
              ) : resumeScore !== null ? (
                <>
                  <div className="resume-ats-score">
                    <div className="resume-ats-score-number">{resumeScore}</div>
                    <div className="resume-ats-score-label">ATS Score / 100</div>
                  </div>
                  <div className="resume-ats-message">
                    {resumeScore >= 80
                      ? "Strong ATS readiness"
                      : resumeScore >= 60
                        ? "Good, but there is room to improve"
                        : "Your resume needs some improvements"}
                  </div>
                  {resumeSuggestions.length > 0 && (
                    <ul className="resume-ats-suggestions">
                      {resumeSuggestions.slice(0, 3).map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  )}
                </>
              ) : null}

              {resumeError && <div className="resume-ats-error">{resumeError}</div>}

              <div className="resume-ats-actions">
                <button
                  type="button"
                  className="resume-ats-change"
                  onClick={() => resumeInputRef.current?.click()}
                >
                  Change
                </button>
                <button
                  type="button"
                  className="resume-ats-remove"
                  onClick={removeResume}
                >
                  Remove
                </button>
              </div>
            </>
          )}
        </div>

        <div className="profile">
          <div className="avatar">
            {currentUser?.name?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <div className="profile-info">
            <strong>
              {currentUser?.name || "Sudhanshu"}
            </strong>
            <span>
              {currentUser?.email || "Job Seeker"}
            </span>
          </div>
          <button
            type="button"
            className="profile-more"
            onClick={handleLogout}
            title="Log out"
            style={{
              border: "none",
              background: "transparent",
              color: "#fb7185",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      {}
      <main className="main">
        {}
        <header className="topbar">
          <div className="breadcrumb">
            <span>
              Workspace
            </span>
            <b>
              /
            </b>
            <strong>
              {activePage}
            </strong>
          </div>
          <div className="topbar-actions">
            {}
            <div className="search-box">
              <span className="search-icon">
                ⌕
              </span>
              <input
                type="text"
                placeholder={
                  activePage === "Reminders"
                    ? "Search reminders..."
                    : "Search applications..."
                }
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
              <kbd>
                ⌘ K
              </kbd>
            </div>
            {}
            <button className="notification">
              ♢
              <span>
                3
              </span>
            </button>
            {}
            <div className="top-avatar">
              {currentUser?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
          </div>
        </header>
        {}
        {activePage === "Analytics" ? (
          <section className="content analytics-content">
            <div className="analytics-hero">
              <div>
                <div className="eyebrow">
                  <span></span>
                  CAREER ANALYTICS
                </div>
                <h1>
                  Your job search, <span>decoded.</span>
                </h1>
                <p>
                  Turn your application activity into clear, useful decisions.
                </p>
              </div>
              <div className="analytics-live-badge">
                <span></span>
                Live from your applications
              </div>
            </div>

            <div className="analytics-stats-grid">
              <div className="analytics-stat-card analytics-stat-purple">
                <div className="analytics-stat-icon">▣</div>
                <span>Total Applications</span>
                <strong>{totalApplications}</strong>
                <small>{activeApplications} active applications</small>
              </div>

              <div className="analytics-stat-card analytics-stat-blue">
                <div className="analytics-stat-icon">↗</div>
                <span>Response Rate</span>
                <strong>{responseRate}%</strong>
                <small>Moved beyond Applied</small>
              </div>

              <div className="analytics-stat-card analytics-stat-yellow">
                <div className="analytics-stat-icon">◉</div>
                <span>Interviews</span>
                <strong>{interviewCount}</strong>
                <small>{interviewRate}% of applications</small>
              </div>

              <div className="analytics-stat-card analytics-stat-green">
                <div className="analytics-stat-icon">✓</div>
                <span>Offers</span>
                <strong>{offerCount}</strong>
                <small>{offerRate}% overall conversion</small>
              </div>
            </div>

            <div className="analytics-grid-two">
              <section className="analytics-panel">
                <div className="analytics-panel-header">
                  <div>
                    <h2>Status Distribution</h2>
                    <p>Where your applications currently stand</p>
                  </div>
                  <span className="analytics-panel-badge">{totalApplications} total</span>
                </div>

                <div className="analytics-status-list">
                  {[
                    ["Applied", appliedCount, "#3b82f6", "rgba(59,130,246,0.14)"],
                    ["Screening", screeningCount, "#ebd19f", "rgba(235,209,159,0.14)"],
                    ["Interview", interviewCount, "#f59e0b", "rgba(245,158,11,0.14)"],
                    ["Offer", offerCount, "#22c55e", "rgba(34,197,94,0.14)"],
                    ["Rejected", rejectedCount, "#e11d48", "rgba(225,29,72,0.14)"],
                  ].map(([label, count, color, background]) => {
                    const percentage =
                      totalApplications > 0
                        ? Math.round((count / totalApplications) * 100)
                        : 0;

                    return (
                      <div className="analytics-status-row" key={label}>
                        <div className="analytics-status-topline">
                          <span>
                            <i style={{ background: color, boxShadow: `0 0 10px ${color}` }}></i>
                            {label}
                          </span>
                          <strong>{count} <small>{percentage}%</small></strong>
                        </div>
                        <div className="analytics-bar-track" style={{ background }}>
                          <div
                            className="analytics-bar-fill"
                            style={{ width: `${percentage}%`, background }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="analytics-panel">
                <div className="analytics-panel-header">
                  <div>
                    <h2>Conversion Funnel</h2>
                    <p>How applications move through your pipeline</p>
                  </div>
                </div>

                <div className="analytics-funnel">
                  <div className="funnel-step funnel-applied">
                    <span>Applied</span>
                    <strong>{totalApplications}</strong>
                  </div>
                  <div className="funnel-arrow">↓</div>
                  <div className="funnel-step funnel-interview">
                    <span>Interview</span>
                    <strong>{interviewCount}</strong>
                  </div>
                  <div className="funnel-arrow">↓</div>
                  <div className="funnel-step funnel-offer">
                    <span>Offer</span>
                    <strong>{offerCount}</strong>
                  </div>
                </div>

                <div className="conversion-summary">
                  <div>
                    <span>Application → Interview</span>
                    <strong>{interviewRate}%</strong>
                  </div>
                  <div>
                    <span>Interview → Offer</span>
                    <strong>{offerConversionFromInterviews}%</strong>
                  </div>
                </div>
              </section>
            </div>

            <div className="analytics-grid-two">
              <section className="analytics-panel salary-panel">
                <div className="analytics-panel-header">
                  <div>
                    <h2>Salary Insights</h2>
                    <p>Based on salary values entered in your applications</p>
                  </div>
                  <span className="analytics-panel-badge">LPA</span>
                </div>

                {salaryValues.length > 0 ? (
                  <div className="salary-insights">
                    <div className="salary-main">
                      <span>Average salary</span>
                      <strong>{averageSalary.toFixed(1)} <small>LPA</small></strong>
                    </div>
                    <div className="salary-mini-grid">
                      <div>
                        <span>Highest</span>
                        <strong>{highestSalary.toFixed(1)} LPA</strong>
                      </div>
                      <div>
                        <span>Lowest</span>
                        <strong>{lowestSalary.toFixed(1)} LPA</strong>
                      </div>
                      <div>
                        <span>Tracked</span>
                        <strong>{salaryValues.length} applications</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="analytics-empty">
                    <span>₹</span>
                    <strong>No salary data yet</strong>
                    <p>Add salary details to your applications to unlock salary insights.</p>
                  </div>
                )}
              </section>

              <section className="analytics-panel">
                <div className="analytics-panel-header">
                  <div>
                    <h2>Top Companies</h2>
                    <p>Where you're applying most</p>
                  </div>
                </div>

                {topCompanies.length > 0 ? (
                  <div className="company-analytics-list">
                    {topCompanies.map(([company, count], index) => {
                      const percentage = Math.round((count / totalApplications) * 100);
                      return (
                        <div className="company-analytics-row" key={company}>
                          <div className="company-analytics-rank">0{index + 1}</div>
                          <div className="company-analytics-name">
                            <strong>{company}</strong>
                            <span>{count} application{count === 1 ? "" : "s"}</span>
                          </div>
                          <div className="company-analytics-progress">
                            <div style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="analytics-empty compact">
                    <strong>No applications yet</strong>
                    <p>Your company insights will appear here.</p>
                  </div>
                )}
              </section>
            </div>

            <section className="analytics-insight-panel">
              <div className="analytics-insight-icon">✦</div>
              <div>
                <span>JOB SEARCH INSIGHT</span>
                <h2>
                  {totalApplications === 0
                    ? "Start tracking your applications."
                    : offerCount > 0
                    ? `You've reached ${offerCount} offer${offerCount === 1 ? "" : "s"}. Keep the momentum going.`
                    : interviewCount > 0
                    ? `You have ${interviewCount} interview${interviewCount === 1 ? "" : "s"} in progress. Focus on converting them into offers.`
                    : rejectedCount > 0
                    ? "Keep refining your applications and targeting the roles that fit you best."
                    : "You're building momentum. Keep moving applications through the pipeline."}
                </h2>
                <p>
                  {totalApplications === 0
                    ? "Add your first application and JobFlow will start building your analytics automatically."
                    : `${responseRate}% of your applications have moved beyond the Applied stage.`}
                </p>
              </div>
              <button type="button" onClick={() => setShowAddModal(true)}>
                Add Application →
              </button>
            </section>
          </section>
        ) : activePage === "Applications" ? (
          <section className="content page-content">
            <div className="page-hero">
              <div>
                <div className="eyebrow"><span></span>APPLICATION MANAGEMENT</div>
                <h1>Your <span>applications.</span></h1>
                <p>Track every opportunity, update statuses, and keep your job search organized.</p>
              </div>
              <button className="add-button" type="button" onClick={() => setShowAddModal(true)}>
                <span className="plus">+</span>
                Add Application
              </button>
            </div>

            <div className="page-toolbar">
              <div className="page-search">
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="Search company, role or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="page-toolbar-count">
                {filteredApplications.length} of {totalApplications} applications
              </div>
            </div>

            <section className="applications-card full-width-card">
              <div className="section-header">
                <div>
                  <h2>All Applications</h2>
                  <p>Manage your live application pipeline from one place.</p>
                </div>
              </div>

              {loading ? (
                <div className="page-empty-state">
                  <strong>Loading applications...</strong>
                  <p>Fetching your latest opportunities.</p>
                </div>
              ) : error ? (
                <div className="page-empty-state">
                  <strong>Unable to load applications</strong>
                  <p>{error}</p>
                </div>
              ) : filteredApplications.length > 0 ? (
                <div className="applications-list">
                  {filteredApplications.map((job) => (
                    <div className="job-row" key={job.id}>
                      <div className="company-logo">{job.logo}</div>
                      <div className="job-info">
                        <strong>{job.company}</strong>
                        <span>{job.role}</span>
                      </div>
                      <div className="job-location">⌖ {job.location || "Not specified"}</div>
                      <div className="job-salary">{job.salary || "—"}</div>
                      <div className="application-inline-actions">
                        <select
                          value={job.status}
                          disabled={updatingJobId === job.id}
                          onChange={(e) => handleUpdateStatus(job.id, e.target.value)}
                          aria-label={`Change status for ${job.company}`}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.value}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="application-delete-button"
                          disabled={deletingJobId === job.id}
                          onClick={() => handleDeleteApplication(job.id)}
                        >
                          {deletingJobId === job.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="page-empty-state">
                  <strong>No applications found</strong>
                  <p>{search ? "Try a different search term." : "Add your first application to start tracking your job search."}</p>
                  {!search && (
                    <button type="button" className="add-button compact-add" onClick={() => setShowAddModal(true)}>
                      <span className="plus">+</span>
                      Add Application
                    </button>
                  )}
                </div>
              )}
            </section>
          </section>

        ) : activePage === "Calendar" ? (
          <section className="content page-content">
            <div className="page-hero">
              <div>
                <div className="eyebrow"><span></span>JOB SEARCH CALENDAR</div>
                <h1>Plan your <span>next move.</span></h1>
                <p>Keep reminders and important job-search tasks visible by date.</p>
              </div>
              <button type="button" className="secondary-page-button" onClick={goToToday}>
                Today
              </button>
            </div>

            <div className="calendar-layout">
              <section className="calendar-panel">
                <div className="calendar-header">
                  <div>
                    <h2>{calendarMonthLabel}</h2>
                    <p>Click a month to move through your schedule.</p>
                  </div>
                  <div className="calendar-controls">
                    <button type="button" onClick={() => changeCalendarMonth(-1)} aria-label="Previous month">←</button>
                    <button type="button" onClick={goToToday}>Today</button>
                    <button type="button" onClick={() => changeCalendarMonth(1)} aria-label="Next month">→</button>
                  </div>
                </div>

                <div className="calendar-weekdays">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>

                <div className="calendar-grid">
                  {calendarCells.map((date, index) => {
                    if (!date) return <div className="calendar-day empty" key={`empty-${index}`}></div>;
                    const dateKey = formatDateKey(date);
                    const dayReminders = reminders.filter((item) => item.dueDate === dateKey);
                    const isToday = formatDateKey(new Date()) === dateKey;

                    return (
                      <div className={`calendar-day ${isToday ? "today" : ""}`} key={dateKey}>
                        <div className="calendar-day-number">{date.getDate()}</div>
                        <div className="calendar-day-events">
                          {dayReminders.slice(0, 2).map((item) => (
                            <button
                              type="button"
                              key={item.id}
                              className={`calendar-event ${item.completed ? "completed" : ""}`}
                              onClick={() => {
                                setActivePage("Reminders");
                                setSearch(item.title);
                              }}
                              title={item.title}
                            >
                              {item.title}
                            </button>
                          ))}
                          {dayReminders.length > 2 && (
                            <span className="calendar-more">+{dayReminders.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <aside className="calendar-side-panel">
                <div className="section-header">
                  <div>
                    <h2>Upcoming</h2>
                    <p>Your next reminders</p>
                  </div>
                </div>
                {reminders
                  .filter((item) => !item.completed)
                  .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                  .slice(0, 6)
                  .map((item) => (
                    <div className="upcoming-reminder" key={item.id}>
                      <div>
                        <strong>{item.title}</strong>
                        <span>{new Date(`${item.dueDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      </div>
                      <button type="button" onClick={() => toggleReminder(item.id)}>✓</button>
                    </div>
                  ))}
                {pendingReminderCount === 0 && (
                  <div className="page-empty-state compact-empty">
                    <strong>No upcoming reminders</strong>
                    <p>Add one from the Reminders section.</p>
                  </div>
                )}
              </aside>
            </div>
          </section>

        ) : activePage === "Reminders" ? (
          <section className="content page-content">
            <div className="page-hero">
              <div>
                <div className="eyebrow"><span></span>JOB SEARCH REMINDERS</div>
                <h1>Never miss <span>the follow-up.</span></h1>
                <p>Create simple reminders for applications, interviews, follow-ups, and deadlines.</p>
              </div>
              <div className="reminder-summary">
                <strong>{pendingReminderCount}</strong>
                <span>pending</span>
              </div>
            </div>

            <div className="reminder-layout">
              <section className="reminder-form-card">
                <div className="section-header">
                  <div>
                    <h2>Add Reminder</h2>
                    <p>Keep your next action visible.</p>
                  </div>
                </div>
                <form onSubmit={handleAddReminder} className="reminder-form">
                  <label>
                    <span>Reminder</span>
                    <input
                      value={newReminder.title}
                      onChange={(e) => setNewReminder((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Follow up with recruiter"
                      required
                    />
                  </label>
                  <label>
                    <span>Due date</span>
                    <input
                      type="date"
                      value={newReminder.dueDate}
                      onChange={(e) => setNewReminder((prev) => ({ ...prev, dueDate: e.target.value }))}
                      required
                    />
                  </label>
                  <button type="submit" className="add-button reminder-submit">
                    <span className="plus">+</span>
                    Add Reminder
                  </button>
                </form>
              </section>

              <section className="applications-card reminders-card">
                <div className="section-header">
                  <div>
                    <h2>Your Reminders</h2>
                    <p>Saved locally in this browser.</p>
                  </div>
                  <div className="page-toolbar-count">{filteredReminders.length} shown</div>
                </div>

                {filteredReminders.length > 0 ? (
                  <div className="reminder-list">
                    {filteredReminders
                      .slice()
                      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                      .map((reminder) => (
                        <div className={`reminder-row ${reminder.completed ? "completed" : ""}`} key={reminder.id}>
                          <button
                            type="button"
                            className="reminder-check"
                            onClick={() => toggleReminder(reminder.id)}
                            aria-label={reminder.completed ? "Mark reminder pending" : "Complete reminder"}
                          >
                            {reminder.completed ? "✓" : ""}
                          </button>
                          <div className="reminder-info">
                            <strong>{reminder.title}</strong>
                            <span>
                              {new Date(`${reminder.dueDate}T00:00:00`).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <button type="button" className="reminder-delete" onClick={() => deleteReminder(reminder.id)}>
                            Delete
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="page-empty-state">
                    <strong>{search ? "No matching reminders" : "No reminders yet"}</strong>
                    <p>{search ? "Try a different search term." : "Create a reminder above to start your task list."}</p>
                  </div>
                )}
              </section>
            </div>
          </section>

        ) : (
        <section className="content">
          {}
          <div className="hero">
            <div className="hero-content">
              <div className="eyebrow">
                <span></span>
                YOUR CAREER DASHBOARD
              </div>
              <h1>
                {getGreeting(currentTime)},{" "}
                <span>
                  {currentUser?.name || "User"}.
                </span>
              </h1>
              <p>
                Keep your applications organized.
                Stay focused on landing the right opportunity.
              </p>
            </div>
            <button className="add-button" onClick={() => setShowAddModal(true)}>
              <span className="plus">
                +
              </span>
              Add Application
            </button>
          </div>
          {}
          <div className="stats-grid">
            {}
            <div className="stat-card purple-card">
              <div className="stat-top">
                <span>
                  Total Applications
                </span>
                <div className="stat-icon purple">
                  ▣
                </div>
              </div>
              <div className="stat-number">
                {totalApplications}
              </div>
              <div className="stat-bottom">
                <span className="positive">
                  ↑ 18%
                </span>
                <span>
                  vs last month
                </span>
              </div>
              <div className="mini-chart purple-chart">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            {}
            <div className="stat-card blue-card">
              <div className="stat-top">
                <span>
                  Applied
                </span>
                <div className="stat-icon blue">
                  ↗
                </div>
              </div>
              <div className="stat-number">
                {appliedCount}
              </div>
              <div className="stat-bottom">
                <span className="blue-text">
                  {totalApplications > 0
                    ? Math.round((appliedCount / totalApplications) * 100)
                    : 0}%
                </span>
                <span>
                  of applications
                </span>
              </div>
              <div className="mini-chart blue-chart">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            {}
            <div className="stat-card yellow-card">
              <div className="stat-top">
                <span>
                  Interviews
                </span>
                <div className="stat-icon yellow">
                  ◉
                </div>
              </div>
              <div className="stat-number">
                {interviewCount}
              </div>
              <div className="stat-bottom">
                <span className="yellow-text">
                  {interviewRate}%
                </span>
                <span>
                  conversion rate
                </span>
              </div>
              <div className="mini-chart yellow-chart">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            {}
            <div className="stat-card green-card">
              <div className="stat-top">
                <span>
                  Offers
                </span>
                <div className="stat-icon green">
                  ✓
                </div>
              </div>
              <div className="stat-number">
                {offerCount}
              </div>
              <div className="stat-bottom">
                <span className="positive">
                  {offerRate}%
                </span>
                <span>
                  success rate
                </span>
              </div>
              <div className="mini-chart green-chart">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
          {}
          <div className="dashboard-grid">
            {}
            <section className="applications-card">
              <div className="section-header">
                <div>
                  <h2>
                    Recent Applications
                  </h2>
                  <p>
                    Your latest job opportunities
                  </p>
                </div>
                <button className="view-all">
                  View all →
                </button>
              </div>
              <div className="applications-list">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((job) => (
                    <div
                      className="job-row"
                      key={job.id}
                    >
                      {}
                      <div className="company-logo">
                        {job.logo}
                      </div>
                      {}
                      <div className="job-info">
                        <strong>
                          {job.company}
                        </strong>
                        <span>
                          {job.role}
                        </span>
                      </div>
                      {}
                      <div className="job-location">
                        ⌖ {job.location}
                      </div>
                      {}
                      <div className="job-salary">
                        {job.salary}
                      </div>
                      {}
                      <div
                        className={`status ${job.status.toLowerCase()}`}
                      >
                        <span></span>
                        {job.status}
                      </div>
                      {}
                      <div
                        className="job-actions"
                        ref={(el) => {
                          jobMenuRefs.current[job.id] = el;
                        }}
                      >
                        <button
                          type="button"
                          className={`job-menu ${openJobMenu === job.id ? "active" : ""}`}
                          onClick={() => toggleJobMenu(job.id)}
                          aria-label={`Actions for ${job.company}`}
                        >
                          ⋮
                        </button>

                        {openJobMenu === job.id && (
                          <div
                            className={`job-dropdown ${
                              dropdownFlip ? "job-dropdown-up" : ""
                            }`}
                          >
                            <div className="job-dropdown-title">
                              Change status
                            </div>

                            {statusOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                className="job-dropdown-item"
                                disabled={updatingJobId === job.id}
                                onClick={() =>
                                  handleUpdateStatus(job.id, option.value)
                                }
                              >
                                <span
                                  className="job-dropdown-dot"
                                  style={{ background: option.dot }}
                                ></span>
                                <span>{option.value}</span>
                                {job.status === option.value && (
                                  <span className="job-dropdown-check">✓</span>
                                )}
                              </button>
                            ))}

                            <div className="job-dropdown-divider"></div>

                            <button
                              type="button"
                              className="job-dropdown-delete"
                              disabled={
                                updatingJobId === job.id ||
                                deletingJobId === job.id
                              }
                              onClick={() => handleDeleteApplication(job.id)}
                            >
                              <span className="job-dropdown-delete-icon" aria-hidden="true">
                                <svg
                                  viewBox="0 0 24 24"
                                  width="15"
                                  height="15"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
                                  <path d="M19 6l-1 14H6L5 6" />
                                  <path d="M10 10v6" />
                                  <path d="M14 10v6" />
                                </svg>
                              </span>
                              <span>
                                {deletingJobId === job.id
                                  ? "Deleting..."
                                  : "Delete Application"}
                              </span>
                            </button>

                            {menuError && (
                              <div className="job-dropdown-error">
                                {menuError}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    No applications found.
                  </div>
                )}
              </div>
              <button className="applications-footer">
                View all applications →
              </button>
            </section>
            {}
            <section className="pipeline-card">
              <div className="section-header">
                <div>
                  <h2>
                    Application Pipeline
                  </h2>
                  <p>
                    Your current progress
                  </p>
                </div>
              </div>
              <div className="pipeline">
                <div className="pipeline-item">
                  <div className="pipeline-label">
                    <span>Applied</span>
                    <strong>
                      {appliedCount}{" "}
                      <small>
                        ({totalApplications > 0 ? Math.round((appliedCount / totalApplications) * 100) : 0}%)
                      </small>
                    </strong>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-fill applied"
                      style={{
                        width: `${totalApplications > 0 ? (appliedCount / totalApplications) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pipeline-item">
                  <div className="pipeline-label">
                    <span>Screening</span>
                    <strong>
                      {screeningCount}{" "}
                      <small>
                        ({totalApplications > 0 ? Math.round((screeningCount / totalApplications) * 100) : 0}%)
                      </small>
                    </strong>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-fill screening"
                      style={{
                        width: `${totalApplications > 0 ? (screeningCount / totalApplications) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pipeline-item">
                  <div className="pipeline-label">
                    <span>Interview</span>
                    <strong>
                      {interviewCount}{" "}
                      <small>
                        ({totalApplications > 0 ? Math.round((interviewCount / totalApplications) * 100) : 0}%)
                      </small>
                    </strong>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-fill interview"
                      style={{
                        width: `${totalApplications > 0 ? (interviewCount / totalApplications) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pipeline-item">
                  <div className="pipeline-label">
                    <span>Offer</span>
                    <strong>
                      {offerCount}{" "}
                      <small>
                        ({totalApplications > 0 ? Math.round((offerCount / totalApplications) * 100) : 0}%)
                      </small>
                    </strong>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-fill offer"
                      style={{
                        width: `${totalApplications > 0 ? (offerCount / totalApplications) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pipeline-item">
                  <div className="pipeline-label">
                    <span>Rejected</span>
                    <strong>
                      {rejectedCount}{" "}
                      <small>
                        ({totalApplications > 0 ? Math.round((rejectedCount / totalApplications) * 100) : 0}%)
                      </small>
                    </strong>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-fill rejected"
                      style={{
                        width: `${totalApplications > 0 ? (rejectedCount / totalApplications) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="success-box">
                <div className="success-ring">
                  <span>{offerRate}%</span>
                </div>

                <div className="success-content">
                  <strong>Application success rate</strong>

                  <p>
                    {totalApplications === 0
                      ? "Add applications to start tracking your progress."
                      : offerCount > 0
                      ? "You're converting applications into offers."
                      : "Keep applying and moving applications through the pipeline."}
                  </p>

                  <span className="improvement">
                    {totalApplications > 0
                      ? `${offerCount} offer${offerCount === 1 ? "" : "s"} from ${totalApplications} application${totalApplications === 1 ? "" : "s"}`
                      : "No applications yet"}
                  </span>
                </div>
              </div>
            </section>
          </div>
          {}
          <div className="insight">
            <div className="insight-icon">
              ✦
            </div>
            <div className="insight-content">
              <strong>
                Keep the momentum going!
              </strong>
              <p>
                You've applied to {totalApplications} positions.
                Adding 3–5 quality applications each
                week can significantly improve your chances.
              </p>
            </div>
            <button onClick={() => setShowAddModal(true)}>
              Add Application →
            </button>
          </div>
        </section>
        )}{showAddModal && (
          <div
            onClick={() => {
              if (!submitting) {
                setShowAddModal(false);
                setFormError("");
              }
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              background: "rgba(3, 3, 10, 0.78)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "560px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "30px",
                borderRadius: "24px",
                border: "1px solid rgba(139, 92, 246, 0.35)",
                background:
                  "linear-gradient(145deg, rgba(24, 18, 45, 0.98), rgba(10, 10, 20, 0.98))",
                boxShadow:
                  "0 30px 100px rgba(0, 0, 0, 0.65), 0 0 60px rgba(124, 58, 237, 0.18)",
                color: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "20px",
                  marginBottom: "26px",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#a78bfa",
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    Career Tracker
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "28px",
                      fontWeight: 700,
                    }}
                  >
                    Add Application
                  </h2>
                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#8f8ca3",
                      fontSize: "14px",
                    }}
                  >
                    Save a new opportunity to your PostgreSQL database.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!submitting) {
                      setShowAddModal(false);
                      setFormError("");
                    }
                  }}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#aaa6b8",
                    fontSize: "22px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddApplication}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "18px",
                  }}
                >
                  <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ color: "#b6b2c5", fontSize: "13px" }}>
                      Company *
                    </span>
                    <input
                      name="company"
                      value={newJob.company}
                      onChange={handleInputChange}
                      placeholder="e.g. Google"
                      required
                      style={modalInputStyle}
                    />
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ color: "#b6b2c5", fontSize: "13px" }}>
                      Job Role *
                    </span>
                    <input
                      name="role"
                      value={newJob.role}
                      onChange={handleInputChange}
                      placeholder="e.g. Software Engineer"
                      required
                      style={modalInputStyle}
                    />
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ color: "#b6b2c5", fontSize: "13px" }}>
                      Location
                    </span>
                    <input
                      name="location"
                      value={newJob.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Bangalore"
                      style={modalInputStyle}
                    />
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ color: "#b6b2c5", fontSize: "13px" }}>
                      Salary
                    </span>
                    <input
                      name="salary"
                      value={newJob.salary}
                      onChange={handleInputChange}
                      placeholder="e.g. 12 LPA"
                      style={modalInputStyle}
                    />
                  </label>

                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      gridColumn: "1 / -1",
                    }}
                  >
                    <span style={{ color: "#b6b2c5", fontSize: "13px" }}>
                      Status
                    </span>
                    <div style={{ position: "relative" }}>
                      <button
                        type="button"
                        onClick={() => setShowStatusMenu((prev) => !prev)}
                        disabled={submitting}
                        style={{
                          ...modalInputStyle,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          textAlign: "left",
                          cursor: submitting ? "not-allowed" : "pointer",
                          color: statusOptions.find((item) => item.value === newJob.status)?.color || "#f5f3ff",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span
                            style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "50%",
                              background: statusOptions.find((item) => item.value === newJob.status)?.dot,
                              boxShadow: `0 0 8px ${statusOptions.find((item) => item.value === newJob.status)?.dot}`,
                            }}
                          ></span>
                          {newJob.status}
                        </span>
                        <span style={{ color: "#f5f3ff", fontSize: "15px", transform: showStatusMenu ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>⌄</span>
                      </button>

                      {showStatusMenu && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: "calc(100% + 6px)",
                            zIndex: 20,
                            padding: "6px",
                            border: "1px solid rgba(139, 92, 246, 0.35)",
                            borderRadius: "12px",
                            background: "#171326",
                            boxShadow: "0 20px 50px rgba(0,0,0,0.55), 0 0 30px rgba(124,58,237,0.12)",
                          }}
                        >
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setNewJob((prev) => ({ ...prev, status: option.value }));
                                setShowStatusMenu(false);
                              }}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "9px",
                                padding: "10px 11px",
                                borderRadius: "8px",
                                color: option.color,
                                background: newJob.status === option.value ? option.bg : "transparent",
                                fontSize: "13px",
                                fontWeight: 600,
                                textAlign: "left",
                                cursor: "pointer",
                                transition: "background 0.15s ease, transform 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = option.bg;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = newJob.status === option.value ? option.bg : "transparent";
                              }}
                            >
                              <span
                                style={{
                                  width: "7px",
                                  height: "7px",
                                  flexShrink: 0,
                                  borderRadius: "50%",
                                  background: option.dot,
                                  boxShadow: `0 0 8px ${option.dot}`,
                                }}
                              ></span>
                              {option.value}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {formError && (
                  <div
                    style={{
                      marginTop: "18px",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      background: "rgba(239, 68, 68, 0.08)",
                      color: "#fca5a5",
                      fontSize: "13px",
                    }}
                  >
                    {formError}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    marginTop: "26px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!submitting) {
                        setShowAddModal(false);
                        setFormError("");
                      }
                    }}
                    style={{
                      padding: "13px 20px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.04)",
                      color: "#b8b4c7",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: "13px 22px",
                      borderRadius: "12px",
                      border: "none",
                      background:
                        "linear-gradient(135deg, #8b5cf6, #ec4899)",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.7 : 1,
                      boxShadow: "0 10px 30px rgba(139, 92, 246, 0.25)",
                    }}
                  >
                    {submitting ? "Saving..." : "Add Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
    </>
  );
}
export default App;