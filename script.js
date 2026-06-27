// FK Ener Nové Dvory - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Mobile navigation toggle
    var navToggle = document.getElementById('nav-toggle');
    var navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        navMenu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }

    // Header scroll effect
    var header = document.getElementById('header');
    var scrollThreshold = 50;

    function updateHeader() {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var headerHeight = header.offsetHeight;
                var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Load data from JSON
    loadData();
});

// Load events and sponsors from JSON file
async function loadData() {
    var eventsContainer = document.getElementById('events-container');
    var sponsorsContainer = document.getElementById('sponsors-container');

    // Show loading state
    eventsContainer.innerHTML = '<div class="loading">Načítání událostí</div>';
    sponsorsContainer.innerHTML = '<div class="loading">Načítání partnerů</div>';

    try {
        var response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Nepodařilo se načíst data');
        }
        var data = await response.json();

        renderEvents(data.events);
        renderSponsors(data.sponsors);
    } catch (error) {
        console.error('Chyba při načítání dat:', error);
        eventsContainer.innerHTML = '<div class="empty-state">Nepodařilo se načíst události</div>';
        sponsorsContainer.innerHTML = '<div class="empty-state">Nepodařilo se načíst partnery</div>';
    }
}

// Render events
function renderEvents(events) {
    var container = document.getElementById('events-container');

    if (!events || events.length === 0) {
        container.innerHTML = '<div class="empty-state">Žádné nadcházející události</div>';
        return;
    }

    // Sort events by date (upcoming first)
    var sortedEvents = events.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });

    // Filter to show only future events (or all if none are future)
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var upcomingEvents = sortedEvents.filter(function(event) {
        return new Date(event.date) >= now;
    });

    // If no upcoming events, show all
    if (upcomingEvents.length === 0) {
        upcomingEvents = sortedEvents;
    }

    container.innerHTML = upcomingEvents.map(function(event) {
        var date = new Date(event.date);
        var day = date.getDate();
        var month = date.toLocaleDateString('cs-CZ', { month: 'short' }).replace('.', '');
        var year = date.getFullYear();

        return '<article class="event-card">' +
            '<div class="event-date">' +
                '<div class="event-date-day">' + day + '</div>' +
                '<div class="event-date-month">' + month + ' ' + year + '</div>' +
            '</div>' +
            '<div class="event-content">' +
                '<h3 class="event-title">' + escapeHtml(event.title) + '</h3>' +
                '<div class="event-meta">' +
                    '<span>' +
                        '<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/></svg>' +
                        escapeHtml(event.time) +
                    '</span>' +
                    '<span>' +
                        '<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>' +
                        escapeHtml(event.location) +
                    '</span>' +
                '</div>' +
                '<p class="event-description">' + escapeHtml(event.description) + '</p>' +
            '</div>' +
        '</article>';
    }).join('');
}

// Render sponsors
function renderSponsors(sponsors) {
    var container = document.getElementById('sponsors-container');

    if (!sponsors || sponsors.length === 0) {
        container.innerHTML = '<div class="empty-state">Žádní partneři</div>';
        return;
    }

    container.innerHTML = sponsors.map(function(sponsor) {
        var link = sponsor.url && sponsor.url !== '#' ? sponsor.url : null;
        var imgHtml = '<img src="' + escapeHtml(sponsor.logo) + '" alt="' + escapeHtml(sponsor.name) + '" title="' + escapeHtml(sponsor.name) + '">';

        if (link) {
            return '<a href="' + escapeHtml(link) + '" class="sponsor-item" target="_blank" rel="noopener noreferrer">' + imgHtml + '</a>';
        }
        return '<div class="sponsor-item">' + imgHtml + '</div>';
    }).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
