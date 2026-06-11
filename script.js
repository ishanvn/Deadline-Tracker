// ==========================================
// 1. NAVIGATION & DOM ELEMENTS
// ==========================================
const form = document.getElementById('deadline-form');
const deadlineList = document.getElementById('deadline-list');

const introScreen = document.getElementById('intro-screen');
const trackerScreen = document.getElementById('tracker-screen');

const enterBtn = document.getElementById('enter-btn');
const backBtn = document.getElementById('back-btn');

// Look inside the localStorage vault on load
let deadlines = JSON.parse(localStorage.getItem('savedDeadlines')) || [];

// ==========================================
// 2. SCREEN SWITCHER NAVIGATION & ANIME LOGIC
// ==========================================
const staggerItems = document.querySelectorAll('.stagger-item');

enterBtn.addEventListener('click', function() {
    // Execute dimension hop
    trackerScreen.classList.add('warp-flash');
    introScreen.classList.add('warp-out');
    trackerScreen.classList.remove('hidden-dimension');
    
    setTimeout(() => {
        trackerScreen.classList.remove('warp-flash');
    }, 400);

    // Tight sequential stagger to replicate library engine rendering
    staggerItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('active');
        }, 250 + (index * 85)); 
    });
});

backBtn.addEventListener('click', function() {
    introScreen.classList.remove('warp-out');
    trackerScreen.classList.add('hidden-dimension');
    
    // Clear state smoothly
    staggerItems.forEach(item => item.classList.remove('active'));
});

// ==========================================
// 3. CORE LOGIC: DISPLAY, CALENDAR & DELETE
// ==========================================
function displayDeadlines() {
    deadlineList.innerHTML = ''; 
    
    // NEW: Chronological Sorting Algorithm!
    // This forces the earliest dates to the top of the array automatically
    deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    deadlines.forEach(function(deadline, index) {
        const dateParts = deadline.date.split('-'); 
        const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        
        const listItem = document.createElement('li');
        
        // NEW: Create the Category Badge
        const badge = document.createElement('span');
        badge.className = 'tag-badge';
        badge.textContent = deadline.category || 'TASK'; 
        
        // Build the text payload
        const taskText = document.createTextNode(` ${deadline.name} - Due: ${formattedDate} `);
        
        // Append badge and text to the list item
        listItem.appendChild(badge);
        listItem.appendChild(taskText);
        
        // ------------------------------------------
        // THE GOOGLE CALENDAR BUTTON
        // ------------------------------------------
        const calBtn = document.createElement('a');
        calBtn.innerHTML = '📅';
        calBtn.title = 'Add to Google Calendar for alerts';
        calBtn.style.textDecoration = 'none';
        calBtn.style.marginLeft = 'auto'; // Pushes buttons nicely to the right
        calBtn.style.paddingLeft = '15px';
        calBtn.style.cursor = 'pointer';
        calBtn.style.transition = 'transform 0.2s';
        
        calBtn.onmouseover = () => calBtn.style.transform = 'scale(1.3)';
        calBtn.onmouseout = () => calBtn.style.transform = 'scale(1)';

        const cleanDate = deadline.date.replace(/-/g, '');
        const encodedName = encodeURIComponent(`DUE: ${deadline.name}`);
        const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedName}&dates=${cleanDate}/${cleanDate}`;
        
        calBtn.href = googleCalUrl;
        calBtn.target = '_blank';
        // ------------------------------------------

        // THE DELETE BUTTON
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '❌';
        deleteBtn.style.marginLeft = '10px'; 
        
        deleteBtn.addEventListener('click', function() {
            deadlines.splice(index, 1); 
            localStorage.setItem('savedDeadlines', JSON.stringify(deadlines)); 
            displayDeadlines(); 
        });
        
        listItem.appendChild(calBtn);
        listItem.appendChild(deleteBtn);
        deadlineList.appendChild(listItem);
    });
}
// Run right away to load any existing tasks
displayDeadlines();

// ==========================================
// 4. FORM SUBMISSION & TOAST NOTIFICATIONS
// ==========================================

// Create the Toast Element in JS so it doesn't clutter your HTML file
const toast = document.createElement('div');
toast.id = 'cal-toast';
toast.innerHTML = 'Target Locked! 🎯 Click 📅 to enable system alerts.';
document.body.appendChild(toast);

form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('assignment-name').value;
    const dateInput = document.getElementById('due-date').value;
    const categoryInput = document.getElementById('category').value; 
    
    const newDeadline = {
        name: nameInput,
        date: dateInput,
        category: categoryInput 
    };
    
    deadlines.push(newDeadline);
    localStorage.setItem('savedDeadlines', JSON.stringify(deadlines)); 
    
    displayDeadlines(); 
    form.reset();

    // TRIGGER THE TOAST NOTIFICATION
    toast.classList.add('active'); // Slide it up
    
    // Hide it automatically after 4.5 seconds
    setTimeout(() => {
        toast.classList.remove('active');
    }, 4500);
});