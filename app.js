const values = [
    'Achievement', 'Adventure', 'Autonomy', 'Balance', 'Challenge',
    'Collaboration', 'Community Impact', 'Compassion', 'Competence', 'Creativity',
    'Diversity & Inclusion', 'Efficiency', 'Empathy', 'Financial Security', 'Flexibility',
    'Growth & Learning', 'Helping Others', 'Honesty', 'Innovation', 'Integrity',
    'Leadership', 'Meaningful Work', 'Mentorship', 'Recognition', 'Reliability',
    'Responsibility', 'Routine & Stability', 'Social Connection', 'Status', 'Structure',
    'Sustainability', 'Teamwork', 'Trust', 'Variety', 'Work Environment (positive, supportive, safe)'
];

function initializeApp() {
    const container = document.getElementById('app');
    
    if (!container) {
        console.error('App container not found');
        return;
    }

    const cardSortWidget = WidgetEngine.create('card-sort', {
        values: values,
        onStateChange: (state) => {
            console.log('Widget state updated:', state);
        }
    });

    cardSortWidget.render(container);
}

// Run immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
