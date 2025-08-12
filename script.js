document.getElementById('dateForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('journeyDate').value;
    if (!input) return;
    const journeyDate = new Date(input);
    // Subtract 60 days
    const bookingDate = new Date(journeyDate);
    bookingDate.setDate(bookingDate.getDate() - 60);
    // Set time to 8:00 AM IST
    bookingDate.setHours(8, 0, 0, 0);
    // Format output
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata', timeZoneName: 'short' };
    const formatted = bookingDate.toLocaleString('en-IN', options);
    document.getElementById('result').innerHTML = `Booking opens on <strong>${formatted}</strong>`;

    // Show calendar export options
    const exportDiv = document.getElementById('calendarExport');
    exportDiv.style.display = 'block';

    // Prepare event details
    const eventTitle = encodeURIComponent('IRCTC Advance Reservation Opens');
    const eventDetails = encodeURIComponent('This is the date and time when IRCTC advance ticket booking opens for your journey.\nCheck https://www.irctc.co.in for more info.');
    // Format date for calendar links (YYYYMMDDTHHMMSS in IST, not UTC)
    const pad = n => n < 10 ? '0' + n : n;
    const formatIST = d => {
        // Format as YYYYMMDDTHHMMSS (local IST time, not Zulu/UTC)
        return d.getFullYear() +
            pad(d.getMonth() + 1) +
            pad(d.getDate()) + 'T' +
            pad(d.getHours()) +
            pad(d.getMinutes()) +
            pad(d.getSeconds());
    };
    const startIST = new Date(bookingDate.getTime());
    const endIST = new Date(bookingDate.getTime() + 60*60*1000); // 1 hour event
    const startCal = formatIST(startIST);
    const endCal = formatIST(endIST);
    // Google Calendar link (use IST time and specify Asia/Kolkata)
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startCal}/${endCal}&details=${eventDetails}&ctz=Asia/Kolkata`;
    // Outlook Calendar link (ISO string, will be local time)
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${eventTitle}&body=${eventDetails}&startdt=${startIST.toISOString()}&enddt=${endIST.toISOString()}`;
    // iCal file content (use IST time, not UTC)
    const icalContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${decodeURIComponent(eventTitle)}\nDESCRIPTION:${decodeURIComponent(eventDetails)}\nDTSTART;TZID=Asia/Kolkata:${startCal}\nDTEND;TZID=Asia/Kolkata:${endCal}\nEND:VEVENT\nEND:VCALENDAR`;

    // Set up button actions
    document.getElementById('gcalBtn').onclick = () => {
        window.open(gcalUrl, '_blank');
    };
    document.getElementById('outlookBtn').onclick = () => {
        window.open(outlookUrl, '_blank');
    };
    document.getElementById('icalBtn').onclick = () => {
        const blob = new Blob([icalContent.replace(/\\n/g, '\r\n')], {type: 'text/calendar'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'irctc-advance-booking.ics';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    };
});

// Disable past dates in the date picker
window.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;
    document.getElementById('journeyDate').setAttribute('min', minDate);

    // Theme toggle: set initial theme from localStorage or system
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    function setTheme(dark) {
        document.body.classList.toggle('dark', dark);
        // Show sun icon when in dark mode (to indicate switching to light), moon in light mode (to indicate switching to dark)
        themeIcon.innerHTML = dark
            ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" fill="#FFD700"/>
                <g stroke="#FFD700" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="4"/>
                    <line x1="12" y1="20" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
                    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="4" y2="12"/>
                    <line x1="20" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
                    <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
                </g>
            </svg>` // sun for dark (indicate switch to light)
            : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 0 1 12.79 3a7 7 0 1 0 8.21 9.79z" fill="#FFA500"/>
            </svg>`; // moon for light (indicate switch to dark)
    }
    // Check localStorage or system preference
    const userPref = localStorage.getItem('theme');
    const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(userPref === 'dark' || (!userPref && systemPref));

    themeToggle.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        setTheme(isDark);
    });
});
