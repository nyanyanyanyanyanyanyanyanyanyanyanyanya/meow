
function initializeSupertraining() {
    // Wait for the supertraining content to be loaded in a window
    const checkForSupertraining = () => {
        const supertrainingContainers = document.querySelectorAll('.window-body .training-container, .social-window-body .training-container');
        
        supertrainingContainers.forEach(container => {
            const windowBody = container.closest('.window-body, .social-window-body');
            if (!windowBody || windowBody.dataset.supertrainingInitialized) return;
            
            // Mark as initialized to prevent duplicate initialization
            windowBody.dataset.supertrainingInitialized = 'true';
            
            console.log('Initializing supertraining in window');
            
            // Get all the elements we need within this specific window
            const punchingBag = windowBody.querySelector('#punching-bag');
            const pokemonImage = windowBody.querySelector('#pokemon-image');
            const clickCounter = windowBody.querySelector('#click-counter');
            const quotePopup = windowBody.querySelector('#training-quote-popup');
            
            // Initialize game state for this window
            let clickCount = 0;
            let selectedPokemon = '';
            let selectedBag = 'p1.png';
            let nextQuoteClick = getRandomInterval();
            
            const pokemonImages = {
                chespin: 'https://south-boulevard.nekoweb.org/Images/supertraining/650MS6.png',
                froakie: 'https://south-boulevard.nekoweb.org/Images/supertraining/656MS6.png',
                fennekin: 'https://south-boulevard.nekoweb.org/Images/supertraining/653MS6.png',
                bulbasaur: 'https://south-boulevard.nekoweb.org/Images/supertraining/001MS6.png',
                charmander: 'https://south-boulevard.nekoweb.org/Images/supertraining/004MS6.png',
                squirtle: 'https://south-boulevard.nekoweb.org/Images/supertraining/007MS6.png',
                placeholder: 'https://south-boulevard.nekoweb.org/Images/supertraining/ph.png'
            };
            
            const sycamoreQuotes = [
                "You're doing amazing so well, trainer!",
                "I'm so proud of you and your partner Pokémon!",
                "Keep it up the great work!",
                "Your Pokémon are getting stronger every day!",
                "What a fantastic effort!",
                "You're a true Pokémon Trainer!",
                "Wonderful! Your dedication makes you shine like a star!"
            ];
            
            function getRandomInterval() {
                return Math.floor(Math.random() * (500 - 50 + 1)) + 50;
            }
            
            function showQuote() {
                const randomQuote = sycamoreQuotes[Math.floor(Math.random() * sycamoreQuotes.length)];
                if (quotePopup) {
                    quotePopup.innerHTML = `<img src="https://south-boulevard.nekoweb.org/Images/supertraining/XY_Sycamore_Icon.png" alt="Sycamore" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 5px;"> ${randomQuote}`;
                    quotePopup.classList.add('show');
                    setTimeout(() => quotePopup.classList.remove('show'), 3500);
                }
                nextQuoteClick = clickCount + getRandomInterval();
            }
            
            function selectPokemon(pokemon, event) {
                selectedPokemon = pokemon;
                if (pokemonImage) {
                    pokemonImage.src = pokemonImages[pokemon] || 'https://south-boulevard.nekoweb.org/Images/supertraining/ph.png';
                    pokemonImage.classList.add('pokemon', 'normal');
                    pokemonImage.style.opacity = '1';
                }
                const icons = windowBody.querySelectorAll('.pokemon-icon');
                icons.forEach(icon => icon.classList.remove('selected'));
                if (event && event.target) {
                    event.target.classList.add('selected');
                } else {
                    const selectedIcon = windowBody.querySelector(`.pokemon-icon[data-pokemon="${pokemon}"]`);
                    if (selectedIcon) {
                        selectedIcon.classList.add('selected');
                    }
                }
            }
            
            function punchBag() {
                if (!selectedPokemon) return;
                clickCount++;
                if (clickCounter) {
                    clickCounter.textContent = `Clicks: ${clickCount}`;
                }
                
                if (punchingBag) {
                    punchingBag.classList.remove('shake');
                    void punchingBag.offsetWidth;
                    punchingBag.classList.add('shake');
                    setTimeout(() => {
                        punchingBag.classList.remove('shake');
                    }, 100);
                }
                
                if (pokemonImage) {
                    pokemonImage.classList.remove('punch', 'normal');
                    void pokemonImage.offsetWidth;
                    pokemonImage.classList.add('punch');
                    setTimeout(() => {
                        pokemonImage.classList.remove('punch');
                        pokemonImage.classList.add('normal');
                    }, 300);
                }
                
                if (clickCount >= nextQuoteClick) {
                    showQuote();
                }
            }
            
            function resetTraining() {
                clickCount = 0;
                if (clickCounter) {
                    clickCounter.textContent = `Clicks: ${clickCount}`;
                }
                selectedPokemon = '';
                if (pokemonImage) {
                    pokemonImage.src = 'https://south-boulevard.nekoweb.org/Images/supertraining/ph.png';
                    pokemonImage.className = 'pokemon';
                    pokemonImage.style.opacity = '1';
                }
                const pokemonIcons = windowBody.querySelectorAll('.pokemon-icon');
                pokemonIcons.forEach(icon => icon.classList.remove('selected'));
                nextQuoteClick = getRandomInterval();
                changeBag('p1.png');
            }
            
            function changeBag(bagFile, event) {
                const validBag = bagFile && bagFile.endsWith('.png') ? bagFile : 'p1.png';
                selectedBag = validBag;
                const bagUrl = `https://south-boulevard.nekoweb.org/Images/supertraining/${validBag}`;
                if (punchingBag) {
                    punchingBag.style.backgroundImage = `url('${bagUrl}')`;
                }
                
                const img = new Image();
                img.onerror = () => {
                    console.error(`Failed to load bag image: ${bagUrl}`);
                    if (punchingBag) {
                        punchingBag.style.backgroundImage = `url('https://south-boulevard.nekoweb.org/Images/supertraining/p1.png')`;
                    }
                };
                img.src = bagUrl;
                
                const icons = windowBody.querySelectorAll('.bag-icon');
                icons.forEach(icon => icon.classList.remove('selected'));
                if (event && event.target) {
                    event.target.classList.add('selected');
                } else {
                    const selectedIcon = windowBody.querySelector(`.bag-icon[data-bag="${validBag}"]`);
                    if (selectedIcon) {
                        selectedIcon.classList.add('selected');
                    }
                }
            }
            
            // Set up event listeners for this specific window
            
            // Training container click
            const trainingContainer = windowBody.querySelector('.training-container');
            if (trainingContainer) {
                trainingContainer.addEventListener('click', punchBag);
            }
            
            // Pokemon selection
            const pokemonIcons = windowBody.querySelectorAll('.pokemon-icon');
            pokemonIcons.forEach(icon => {
                const pokemon = icon.getAttribute('data-pokemon');
                if (pokemon) {
                    icon.addEventListener('click', (event) => selectPokemon(pokemon, event));
                }
            });
            
            // Reset button
            const resetButton = windowBody.querySelector('button');
            if (resetButton) {
                resetButton.addEventListener('click', resetTraining);
            }
            
            // Bag selection
            const bagIcons = windowBody.querySelectorAll('.bag-icon');
            bagIcons.forEach(icon => {
                const bag = icon.getAttribute('data-bag');
                if (bag) {
                    icon.addEventListener('click', (event) => changeBag(bag, event));
                }
            });
            
            // Initialize with default bag
            changeBag('p1.png');
            
            console.log('Supertraining initialized successfully in window');
        });
    };
    
    // Check immediately and then periodically for new windows
    checkForSupertraining();
    setInterval(checkForSupertraining, 1000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSupertraining);
} else {
    initializeSupertraining();
}