class CardSortWidget {
    constructor(config = {}) {
        this.config = {
            values: [],
            onStateChange: () => {},
            ...config
        };

        this.state = {
            cards: {},
            top5: [],
            currentView: 'sort' // sort, results, refinement, final
        };

        this.initializeCards();
    }

    initializeCards() {
        this.config.values.forEach(value => {
            this.state.cards[value] = 'unsorted';
        });
    }

    render(container) {
        container.innerHTML = '';

        switch (this.state.currentView) {
            case 'sort':
                this.renderSortView(container);
                break;
            case 'results':
                this.renderResultsView(container);
                break;
            case 'refinement':
                this.renderRefinementView(container);
                break;
            case 'final':
                this.renderFinalView(container);
                break;
        }

        this.config.onStateChange(this.state);
    }

    renderSortView(container) {
        const view = document.createElement('div');
        view.className = 'sort-view';

        view.innerHTML = `
            <h1>Career Values Card Sort</h1>
            <p class="instructions">Sort one value at a time. Click or drag to <strong>Important</strong>, <strong>Unimportant</strong>, or <strong>Neither</strong>.</p>

            <div class="progress-bar">
                <div class="progress-text">Progress: <span id="progress-text">0 of ${this.config.values.length}</span></div>
                <div class="progress-fill" id="progress-fill"></div>
            </div>

            <div class="deck">
                <h3>Current Value</h3>
                <div class="current-card" id="deck"></div>
            </div>

            <div class="main-grid">
                <div class="category important">
                    <h2>✅ Important <span class="count" id="important-badge">0</span></h2>
                    <div class="drop-zone" data-category="important"></div>
                </div>
                <div class="category neither">
                    <h2>➖ Neither <span class="count" id="neither-badge">0</span></h2>
                    <div class="drop-zone" data-category="neither"></div>
                </div>
                <div class="category unimportant">
                    <h2>❌ Unimportant <span class="count" id="unimportant-badge">0</span></h2>
                    <div class="drop-zone" data-category="unimportant"></div>
                </div>
            </div>

            <div class="controls">
                <button class="reset-btn" id="resetBtn">Reset All</button>
                <button class="primary-btn" id="showResultsBtn">Show Results</button>
            </div>
        `;

        container.appendChild(view);

        // Attach event listeners
        this.attachSortViewListeners(container);
        this.renderCurrentCard(container);
        this.updateStats(container);
    }

    attachSortViewListeners(container) {
        container.querySelector('#resetBtn').addEventListener('click', () => this.resetAll(container));
        container.querySelector('#showResultsBtn').addEventListener('click', () => this.showResults(container));

        this.setupDropZones(container);
    }

    renderCurrentCard(container) {
        const current = this.getCurrentCard();
        const deck = container.querySelector('#deck');

        if (current) {
            const card = document.createElement('div');
            card.className = 'card';
            card.textContent = current;
            card.draggable = true;

            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('value', current);
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', (e) => {
                card.classList.remove('dragging');
                container.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
            });

            card.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showCategoryMenu(current, container);
            });

            deck.innerHTML = '';
            deck.appendChild(card);
        } else {
            deck.innerHTML = '<div class="empty-message">All values sorted! Click "Show Results" to see your answers.</div>';
        }

        this.renderCategories(container);
    }

    getCurrentCard() {
        const unsortedValues = this.config.values.filter(v => this.state.cards[v] === 'unsorted');
        return unsortedValues[0] || null;
    }

    showCategoryMenu(value, container) {
        const choice = prompt('Sort as:\n1 = Important\n2 = Neither\n3 = Unimportant\n\n(or press Escape to cancel)');
        
        if (choice === '1') {
            this.sortCard(value, 'important', container);
        } else if (choice === '2') {
            this.sortCard(value, 'neither', container);
        } else if (choice === '3') {
            this.sortCard(value, 'unimportant', container);
        }
    }

    sortCard(value, category, container) {
        this.state.cards[value] = category;
        this.renderCurrentCard(container);
        this.updateStats(container);
    }

    renderCategories(container) {
        container.querySelectorAll('.drop-zone').forEach(zone => {
            const category = zone.dataset.category;
            zone.innerHTML = '';

            this.config.values.forEach(value => {
                if (this.state.cards[value] === category) {
                    const card = this.createSmallCard(value);
                    zone.appendChild(card);
                }
            });

            if (zone.children.length === 0) {
                zone.innerHTML = '<div class="empty-message">Drag or sort here</div>';
            }
        });
    }

    createSmallCard(value) {
        const card = document.createElement('div');
        card.className = 'card card-in-zone';
        card.textContent = value;
        return card;
    }

    setupDropZones(container) {
        container.querySelectorAll('.drop-zone').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', (e) => {
                if (e.target === zone) {
                    zone.classList.remove('drag-over');
                }
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                const value = e.dataTransfer.getData('value');
                const category = zone.dataset.category;
                this.sortCard(value, category, container);
            });
        });
    }

    updateStats(container) {
        const counts = {
            unsorted: 0,
            important: 0,
            neither: 0,
            unimportant: 0
        };

        Object.values(this.state.cards).forEach(category => {
            counts[category]++;
        });

        container.querySelector('#important-badge').textContent = counts.important;
        container.querySelector('#neither-badge').textContent = counts.neither;
        container.querySelector('#unimportant-badge').textContent = counts.unimportant;

        const sorted = counts.important + counts.neither + counts.unimportant;
        container.querySelector('#progress-text').textContent = `${sorted} of ${this.config.values.length}`;
        const percentage = (sorted / this.config.values.length) * 100;
        container.querySelector('#progress-fill').style.width = percentage + '%';
    }

    resetAll(container) {
        if (confirm('Reset all sorted values?')) {
            this.config.values.forEach(value => {
                this.state.cards[value] = 'unsorted';
            });
            this.state.top5 = [];
            this.state.currentView = 'sort';
            this.render(container);
        }
    }

    showResults(container) {
        this.state.currentView = 'results';
        this.render(container);
    }

    renderResultsView(container) {
        const important = this.config.values.filter(v => this.state.cards[v] === 'important').sort();

        if (important.length < 5) {
            alert(`You have ${important.length} important values. You need at least 5 to proceed.`);
            this.state.currentView = 'sort';
            this.render(container);
            return;
        }

        const view = document.createElement('div');
        view.className = 'results-view';

        view.innerHTML = `
            <h2>✅ Your Important Career Values</h2>
            <ul class="result-list" id="results-list"></ul>
            <div style="margin-top: 30px; text-align: center;">
                <button class="primary-btn" id="narrowBtn">Narrow to Top 5 →</button>
            </div>
        `;

        container.appendChild(view);

        const list = container.querySelector('#results-list');
        important.forEach(value => {
            const li = document.createElement('li');
            li.textContent = value;
            list.appendChild(li);
        });

        container.querySelector('#narrowBtn').addEventListener('click', () => this.startRefinement(container));
    }

    startRefinement(container) {
        this.state.top5 = [];
        this.state.currentView = 'refinement';
        this.render(container);
    }

    renderRefinementView(container) {
        const important = this.config.values.filter(v => this.state.cards[v] === 'important').sort();

        const view = document.createElement('div');
        view.className = 'refinement-view';

        view.innerHTML = `
            <div class="top5-header">
                <h2>🏆 Narrow to Your Top 5</h2>
                <p>Drag your important values into the Top 5 list to prioritise them. You can reorder them by dragging.</p>
            </div>

            <div class="top5-grid">
                <div class="top5-column">
                    <h3>Available Values</h3>
                    <div class="top5-list" id="top5-available" data-list="available"></div>
                </div>
                <div class="top5-column selected">
                    <h3>Your Top 5</h3>
                    <div class="top5-list" id="top5-selected" data-list="selected"></div>
                </div>
            </div>

            <div class="top5-controls">
                <button class="secondary-btn" id="backBtn">Back</button>
                <button class="primary-btn" id="finishBtn">See My Top 5</button>
            </div>
        `;

        container.appendChild(view);

        this.renderTop5Lists(container, important);

        container.querySelector('#backBtn').addEventListener('click', () => {
            this.state.currentView = 'results';
            this.state.top5 = [];
            this.render(container);
        });

        container.querySelector('#finishBtn').addEventListener('click', () => this.finishTop5(container));
    }

    renderTop5Lists(container, important) {
        const availableList = container.querySelector('#top5-available');
        const selectedList = container.querySelector('#top5-selected');

        availableList.innerHTML = '';
        selectedList.innerHTML = '';

        important.forEach(value => {
            if (!this.state.top5.includes(value)) {
                const item = this.createTop5Item(value, 'available');
                availableList.appendChild(item);
            }
        });

        if (availableList.children.length === 0) {
            availableList.innerHTML = '<div class="top5-placeholder">Drag all 5 values here →</div>';
        }

        this.state.top5.forEach((value, index) => {
            const item = this.createTop5Item(value, 'selected', index + 1);
            selectedList.appendChild(item);
        });

        if (selectedList.children.length === 0) {
            selectedList.innerHTML = '<div class="top5-placeholder">← Drag values here to rank them</div>';
        }

        this.setupTop5Drag(container);
    }

    createTop5Item(value, list, rank = null) {
        const item = document.createElement('div');
        item.className = 'top5-item';
        item.draggable = true;
        item.dataset.value = value;
        item.dataset.list = list;

        let content = value;
        if (rank) {
            content = `<span class="rank">#${rank}</span> ${value}`;
        }
        item.innerHTML = content;

        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('value', value);
            e.dataTransfer.setData('from-list', list);
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', (e) => {
            item.classList.remove('dragging');
        });

        return item;
    }

    setupTop5Drag(container) {
        const availableList = container.querySelector('#top5-available');
        const selectedList = container.querySelector('#top5-selected');

        availableList.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            availableList.classList.add('drag-over');
        }, false);

        availableList.addEventListener('dragleave', (e) => {
            if (e.target === availableList) {
                availableList.classList.remove('drag-over');
            }
        }, false);

        availableList.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            availableList.classList.remove('drag-over');
            const value = e.dataTransfer.getData('value');
            const fromList = e.dataTransfer.getData('from-list');

            if (fromList === 'selected') {
                this.state.top5 = this.state.top5.filter(v => v !== value);
                const important = this.config.values.filter(v => this.state.cards[v] === 'important').sort();
                this.renderTop5Lists(container, important);
            }
        }, false);

        selectedList.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            selectedList.classList.add('drag-over');
        }, false);

        selectedList.addEventListener('dragleave', (e) => {
            if (e.target === selectedList) {
                selectedList.classList.remove('drag-over');
            }
        }, false);

        selectedList.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectedList.classList.remove('drag-over');
            const value = e.dataTransfer.getData('value');
            const fromList = e.dataTransfer.getData('from-list');

            if (fromList === 'available' && !this.state.top5.includes(value)) {
                if (this.state.top5.length < 5) {
                    this.state.top5.push(value);
                    const important = this.config.values.filter(v => this.state.cards[v] === 'important').sort();
                    this.renderTop5Lists(container, important);
                }
            }
        }, false);
    }

    finishTop5(container) {
        if (this.state.top5.length !== 5) {
            alert('Please select exactly 5 values.');
            return;
        }

        this.state.currentView = 'final';
        this.render(container);
    }

    renderFinalView(container) {
        const view = document.createElement('div');
        view.className = 'final-view';

        view.innerHTML = `
            <h2>🏆 Your Top 5 Career Values</h2>
            <div class="final-top5-list" id="finalTop5List"></div>
            <div class="controls">
                <button class="reset-btn" id="startOverBtn">Start Over</button>
            </div>
        `;

        container.appendChild(view);

        const list = container.querySelector('#finalTop5List');
        this.state.top5.forEach((value, index) => {
            const item = document.createElement('div');
            item.className = 'final-top5-item';
            item.innerHTML = `
                <div class="final-top5-rank">${index + 1}</div>
                <div class="final-top5-value">${value}</div>
            `;
            list.appendChild(item);
        });

        container.querySelector('#startOverBtn').addEventListener('click', () => this.resetAll(container));
    }
}

window.CardSortWidget = CardSortWidget;
WidgetEngine.register('card-sort', CardSortWidget);
