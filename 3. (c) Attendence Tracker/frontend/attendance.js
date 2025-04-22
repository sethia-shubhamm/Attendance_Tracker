// Get subject name from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const subjectName = urlParams.get('subject');

if (!subjectName) {
    window.location.href = 'index.html';
}

// Set page title
document.getElementById('subjectTitle').textContent = subjectName;
document.getElementById('subjectTitleHeader').textContent = subjectName;
document.title = `${subjectName} - Attendance`;

// Calendar variables
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let attendanceData = [];

// Load attendance data
function loadAttendance() {
    attendanceData = JSON.parse(localStorage.getItem(`attendance_${subjectName}`)) || [];
    renderAttendanceList();
    renderCalendar();
    updateStatistics();
}

// Render attendance list
function renderAttendanceList() {
    const list = document.getElementById('attendanceList');
    list.innerHTML = '';

    if (attendanceData.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-check"></i>
                <h3>No Attendance Records</h3>
                <p class="text-muted">Add your first attendance entry using the form</p>
            </div>
        `;
        return;
    }

    // Sort attendance by date (newest first)
    attendanceData.sort((a, b) => new Date(b.date) - new Date(a.date));

    attendanceData.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = `attendance-card status-${entry.status}`;
        item.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">
                            <i class="fas fa-${entry.status === 'present' ? 'check-circle text-success' : 
                                             entry.status === 'absent' ? 'times-circle text-danger' : 
                                             'ban text-secondary'} me-2"></i>
                            ${entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </h6>
                        <small class="text-muted">
                            <i class="fas fa-calendar me-1"></i>
                            ${new Date(entry.date).toLocaleDateString()}
                        </small>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="deleteEntry(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
}

// Render calendar
function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';

    // Set month and year in header
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Add day headers
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'text-center fw-bold';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarGrid.appendChild(emptyDay);
    }

    // Add days of the month
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Check if it's today
        if (isCurrentMonth && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Check if there's attendance for this day
        const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const attendanceEntry = attendanceData.find(entry => entry.date === dateString);
        
        if (attendanceEntry) {
            dayElement.classList.add('has-attendance', attendanceEntry.status);
        }
        
        calendarGrid.appendChild(dayElement);
    }

    // Update month summary
    updateMonthSummary();
}

// Update month summary
function updateMonthSummary() {
    const monthPresent = attendanceData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && 
               entryDate.getFullYear() === currentYear && 
               entry.status === 'present';
    }).length;
    
    const monthAbsent = attendanceData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && 
               entryDate.getFullYear() === currentYear && 
               entry.status === 'absent';
    }).length;
    
    const monthCancelled = attendanceData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && 
               entryDate.getFullYear() === currentYear && 
               entry.status === 'cancelled';
    }).length;
    
    document.getElementById('monthPresent').textContent = monthPresent;
    document.getElementById('monthAbsent').textContent = monthAbsent;
    document.getElementById('monthCancelled').textContent = monthCancelled;
}

// Update statistics
function updateStatistics() {
    const total = attendanceData.length;
    const present = attendanceData.filter(entry => entry.status === 'present').length;
    const absent = attendanceData.filter(entry => entry.status === 'absent').length;
    const cancelled = attendanceData.filter(entry => entry.status === 'cancelled').length;

    document.getElementById('totalClasses').textContent = total;
    document.getElementById('totalPresent').textContent = present;
    document.getElementById('totalAbsent').textContent = absent;
    
    // Calculate attendance rate
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
    document.getElementById('attendanceRate').textContent = `${attendanceRate}%`;
    document.getElementById('attendanceProgress').style.width = `${attendanceRate}%`;
}

// Add new attendance entry
document.getElementById('attendanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const status = document.getElementById('status').value;
    const date = document.getElementById('date').value;

    attendanceData.push({ status, date });
    localStorage.setItem(`attendance_${subjectName}`, JSON.stringify(attendanceData));

    loadAttendance();
    this.reset();
});

// Delete attendance entry
function deleteEntry(index) {
    if (confirm('Are you sure you want to delete this entry?')) {
        attendanceData.splice(index, 1);
        localStorage.setItem(`attendance_${subjectName}`, JSON.stringify(attendanceData));
        loadAttendance();
    }
}

// Calendar navigation
document.getElementById('prevMonth').addEventListener('click', function() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', function() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
});

// Set today's date as default in the date input
document.getElementById('date').valueAsDate = new Date();

// Load attendance when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadAttendance();
}); 