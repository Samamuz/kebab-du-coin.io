/**
 * ========================================
 * SCRIPT JAVASCRIPT - LE KEBAB DU CAMPUS
 * ========================================
 * 
 * Ce fichier contient tout le JavaScript nécessaire pour le site.
 * Il utilise du JavaScript vanilla (pas de bibliothèques externes).
 * 
 * STRUCTURE DU FICHIER :
 * 1. Variables et constantes globales
 * 2. Navigation mobile (menu hamburger)
 * 3. Scroll smooth et navigation active
 * 4. Validation du formulaire
 * 5. Initialisation au chargement de la page
 * 
 * BONNES PRATIQUES UTILISÉES :
 * - ES6+ (const, let, arrow functions, template literals)
 * - Code modulaire et réutilisable
 * - Commentaires explicatifs
 * - Gestion des événements moderne
 * - Validation côté client robuste
 */

'use strict'; // Active le mode strict pour éviter les erreurs communes

/* ========================================
   1. VARIABLES ET CONSTANTES GLOBALES
   ======================================== */

/**
 * Sélection des éléments DOM principaux
 * On utilise const car ces références ne changeront pas
 * querySelector est préféré à getElementById pour sa flexibilité
 */
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');
const header = document.getElementById('header');
const heroSection = document.getElementById('accueil');

// Shopping cart elements
const cartToggle = document.getElementById('cartToggle');
const cartContent = document.getElementById('cartContent');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartSummary = document.getElementById('cartSummary');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

const checkoutFields = {
    lastName: document.getElementById('checkoutLastName'),
    firstName: document.getElementById('checkoutFirstName'),
    address: document.getElementById('checkoutAddress'),
    city: document.getElementById('checkoutCity'),
    phone: document.getElementById('checkoutPhone'),
    paymentMethod: document.getElementById('checkoutPaymentMethod')
};

/**
 * Configuration pour la validation du formulaire
 * Centraliser les patterns de validation facilite la maintenance
 */
const VALIDATION_PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\d{3}(?:\s?\d{3})(?:\s?\d{2}){2}$/,
    name: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/
};

const CHECKOUT_PATTERNS = {
    name: VALIDATION_PATTERNS.name,
    phone: VALIDATION_PATTERNS.phone
};
const PAYMENT_LABELS = {
    cash: 'Cash',
    card: 'Carte bancaire',
    twint: 'Twint'
};
const MIN_ORDER_TOTAL = 15;

/**
 * Messages d'erreur personnalisés
 * Utilisation d'un objet pour faciliter la traduction/modification
 */
const ERROR_MESSAGES = {
    required: 'Ce champ est obligatoire',
    invalidEmail: 'Veuillez entrer une adresse email valide',
    invalidPhone: 'Veuillez entrer un numéro à 10 chiffres (ex: 0781234567 ou 078 123 45 67)',
    invalidName: 'Veuillez entrer un nom valide',
    invalidSubject: 'Veuillez sélectionner un sujet',
    shortMessage: 'Le message doit contenir au moins 10 caractères'
};

/* ========================================
   2. NAVIGATION MOBILE (MENU HAMBURGER)
   ======================================== */

/**
 * Fonction pour basculer l'état du menu mobile
 * Toggle permet d'ajouter/retirer une classe selon son état actuel
 */
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    
    // Empêcher le scroll du body quand le menu est ouvert (meilleure UX mobile)
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';

    if (header) {
        header.classList.toggle('header--menu-open', navMenu.classList.contains('active'));
    }
}

/**
 * Fonction pour fermer le menu mobile
 * Utile quand on clique sur un lien ou en dehors du menu
 */
function closeMobileMenu() {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';

    if (header) {
        header.classList.remove('header--menu-open');
    }
}

/**
 * Mettre à jour la hauteur de l'en-tête dans le CSS
 * Expose la hauteur de l'en-tête pour d'autres utilisations CSS (comme des décalages)
 */
function updateHeaderHeight() {
    if (!header) return;
    document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
}

/**
 * Fonction d'initialisation de l'observateur de contraste pour l'en-tête
 * Change l'apparence de l'en-tête quand on scroll past le hero
 */
function initHeaderContrastObserver() {
    if (!header || !heroSection) return;
    const contrastObserver = new IntersectionObserver(([entry]) => {
        header.classList.toggle('header--contrast', !entry.isIntersecting);
    }, {
        root: null,
        rootMargin: '-80px 0px 0px 0px',
        threshold: 0
    });
    contrastObserver.observe(heroSection);
}

/**
 * Gestionnaire d'événement pour le bouton hamburger
 * On vérifie que l'élément existe avant d'ajouter l'écouteur (défensif)
 */
if (navToggle) {
    navToggle.addEventListener('click', toggleMobileMenu);
}

/**
 * Fermer le menu quand on clique sur un lien de navigation
 * Améliore l'expérience utilisateur sur mobile
 */
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeMobileMenu();
    });
});

/**
 * Fermer le menu si on clique en dehors
 * Utilisation de event.target pour détecter où le clic a eu lieu
 */
document.addEventListener('click', (event) => {
    const isClickInsideMenu = navMenu.contains(event.target);
    const isClickOnToggle = navToggle.contains(event.target);
    
    // Si le menu est ouvert et qu'on clique en dehors du menu et du bouton
    if (navMenu.classList.contains('active') && !isClickInsideMenu && !isClickOnToggle) {
        closeMobileMenu();
    }
});

/* ========================================
   3. SCROLL SMOOTH ET NAVIGATION ACTIVE
   ======================================== */

/**
 * Fonction pour mettre à jour le lien de navigation actif
 * selon la section visible à l'écran
 * 
 * IntersectionObserver est une API moderne pour détecter quand
 * un élément entre/sort de la vue (meilleure performance que scroll)
 */
function initScrollObserver() {
    const sections = document.querySelectorAll('section[id]');
    
    // Configuration de l'observer
    const observerOptions = {
        root: null, // viewport
        rootMargin: '-50% 0px -50% 0px', // Zone de détection au milieu de l'écran
        threshold: 0 // Déclenche dès qu'un pixel est visible
    };
    
    // Callback appelé quand une section entre/sort de la zone de détection
    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Retirer la classe active de tous les liens
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // Ajouter la classe active au lien correspondant à la section visible
                const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    };
    
    // Créer l'observer et observer chaque section
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));
}

// Veille à garder le header visible en permanence malgré le scroll
window.addEventListener('scroll', () => {
    if (!header) return;
    header.style.transform = 'translateY(0)';
});

window.addEventListener('resize', updateHeaderHeight);

/* ========================================
   4. VALIDATION DU FORMULAIRE
   ======================================== */

/**
 * CLASSE FormValidator
 * Encapsule toute la logique de validation dans une classe
 * Avantages : réutilisable, maintenable, testable
 */
class FormValidator {
    /**
     * Constructeur de la classe
     * @param {HTMLFormElement} form - L'élément formulaire à valider
     */
    constructor(form) {
        this.form = form;
        this.fields = {
            name: this.form.querySelector('#name'),
            email: this.form.querySelector('#email'),
            phone: this.form.querySelector('#phone'),
            subject: this.form.querySelector('#subject'),
            message: this.form.querySelector('#message')
        };
        this.init();
    }
    
    /**
     * Initialisation : ajout des écouteurs d'événements
     */
    init() {
        // Validation en temps réel (à la saisie)
        Object.values(this.fields).forEach(field => {
            // Validation pendant la saisie (après le premier blur)
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => {
                // Nettoyer les erreurs pendant la saisie si le champ avait une erreur
                if (field.classList.contains('error')) {
                    this.validateField(field);
                }
            });
        });
        
        // Validation à la soumission du formulaire
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    /**
     * Valider un champ individuel
     * @param {HTMLInputElement} field - Le champ à valider
     * @returns {boolean} true si valide, false sinon
     */
    validateField(field) {
        const fieldName = field.id;
        const value = field.value.trim();
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        // Réinitialiser l'état du champ
        field.classList.remove('error', 'success');
        errorElement.textContent = '';
        
        // Vérifier si le champ est vide
        if (!value) {
            this.showError(field, errorElement, ERROR_MESSAGES.required);
            return false;
        }
        
        // Validation spécifique selon le type de champ
        let isValid = true;
        let errorMessage = '';
        
        switch(fieldName) {
            case 'name':
                if (!VALIDATION_PATTERNS.name.test(value)) {
                    isValid = false;
                    errorMessage = ERROR_MESSAGES.invalidName;
                }
                break;
                
            case 'email':
                if (!VALIDATION_PATTERNS.email.test(value)) {
                    isValid = false;
                    errorMessage = ERROR_MESSAGES.invalidEmail;
                }
                break;
                
            case 'phone':
                if (!VALIDATION_PATTERNS.phone.test(value)) {
                    isValid = false;
                    errorMessage = ERROR_MESSAGES.invalidPhone;
                }
                break;
                
            case 'subject':
                if (value === '') {
                    isValid = false;
                    errorMessage = ERROR_MESSAGES.invalidSubject;
                }
                break;
                
            case 'message':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = ERROR_MESSAGES.shortMessage;
                }
                break;
        }
        
        // Afficher l'erreur ou le succès
        if (!isValid) {
            this.showError(field, errorElement, errorMessage);
            return false;
        } else {
            this.showSuccess(field);
            return true;
        }
    }
    
    /**
     * Afficher un message d'erreur
     * @param {HTMLInputElement} field - Le champ en erreur
     * @param {HTMLElement} errorElement - L'élément où afficher l'erreur
     * @param {string} message - Le message d'erreur
     */
    showError(field, errorElement, message) {
        field.classList.add('error');
        errorElement.textContent = message;
        // Annoncer l'erreur aux lecteurs d'écran (accessibilité)
        field.setAttribute('aria-invalid', 'true');
    }
    
    /**
     * Indiquer visuellement que le champ est valide
     * @param {HTMLInputElement} field - Le champ valide
     */
    showSuccess(field) {
        field.classList.add('success');
        field.setAttribute('aria-invalid', 'false');
    }
    
    /**
     * Valider tous les champs du formulaire
     * @returns {boolean} true si tous les champs sont valides
     */
    validateAllFields() {
        let isFormValid = true;
        
        // Valider chaque champ et garder trace du résultat global
        Object.values(this.fields).forEach(field => {
            const isFieldValid = this.validateField(field);
            if (!isFieldValid) {
                isFormValid = false;
            }
        });
        
        return isFormValid;
    }
    
    /**
     * Gérer la soumission du formulaire
     * @param {Event} event - L'événement de soumission
     */
    handleSubmit(event) {
        event.preventDefault(); // Empêcher la soumission par défaut
        
        // Valider tous les champs
        const isValid = this.validateAllFields();
        
        if (isValid) {
            this.submitForm();
        } else {
            // Scroller vers le premier champ en erreur
            const firstError = this.form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
        }
    }
    
    /**
     * Soumettre le formulaire (simulation)
     * Dans un vrai projet, on enverrait les données à un serveur
     */
    submitForm() {
        // Récupérer les données du formulaire
        const formData = {
            name: this.fields.name.value.trim(),
            email: this.fields.email.value.trim(),
            phone: this.fields.phone.value.trim(),
            subject: this.fields.subject.value,
            message: this.fields.message.value.trim(),
            timestamp: new Date().toISOString()
        };
        
        // Simuler un délai d'envoi (comme une requête serveur)
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Envoi en cours...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            // Afficher le message de succès
            this.showSuccessMessage();
            
            // Logger les données (en développement seulement)
            console.log('Données du formulaire:', formData);
            
            // Réinitialiser le formulaire
            this.resetForm();
            
            // Restaurer le bouton
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }, 1500);
    }
    
    /**
     * Afficher le message de succès
     */
    showSuccessMessage() {
        const successMessage = document.getElementById('formSuccess');
        successMessage.classList.add('show');
        
        // Masquer le message après 5 secondes
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 5000);
        
        // Scroller vers le message de succès
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    /**
     * Réinitialiser le formulaire
     */
    resetForm() {
        this.form.reset();
        
        // Retirer les classes de validation
        Object.values(this.fields).forEach(field => {
            field.classList.remove('error', 'success');
            field.removeAttribute('aria-invalid');
            
            const errorElement = document.getElementById(`${field.id}Error`);
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
    }
}

/* ========================================
   5. SHOPPING CART SYSTEM
   ======================================== */

/**
 * CLASSE ShoppingCart
 * Gère toute la logique du panier d'achat
 * Fonctionnalités : ajout, suppression, quantités, total, persistance
 */
class ShoppingCart {
    /**
     * Constructeur de la classe ShoppingCart
     */
    constructor() {
        this.items = this.loadCartFromStorage();
        this.isCartOpen = false;
        this.init();
    }
    
    /**
     * Initialisation du panier
     */
    init() {
        this.bindEvents();
        this.updateCartDisplay();
        this.setupAddToCartButtons();
        
        console.log('🛒 Système de panier initialisé');
    }
    
    /**
     * Liaison des événements
     */
    bindEvents() {
        // Toggle du panier
        if (cartToggle) {
            cartToggle.addEventListener('click', () => this.toggleCart());
        }
        
        // Bouton de commande
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }
    }
    
    /**
     * Configuration des boutons "Ajouter au panier"
     */
    setupAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const menuItem = button.closest('.menu-item');
                
                if (!menuItem) {
                    return;
                }

                const hasOptions = menuItem.dataset.hasOptions === 'true';
                const optionsWrapper = menuItem.querySelector('.menu-item-options');
                let optionData = { options: [], isComplete: true };

                if (hasOptions && optionsWrapper && optionsWrapper.dataset.stepMode === 'enabled') {
                    const stepper = optionsWrapper._stepper;
                    const isComplete = optionsWrapper.dataset.stepComplete === 'true';

                    if (!isComplete) {
                        if (stepper) {
                            if (optionsWrapper.classList.contains('menu-item-options--visible')) {
                                stepper.open();
                                stepper.focusStep();
                            } else {
                                stepper.start();
                            }
                        } else {
                            optionsWrapper.classList.add('menu-item-options--visible');
                            optionsWrapper.setAttribute('aria-hidden', 'false');
                            menuItem.classList.add('menu-item--configuring');
                        }
                        return;
                    }
                }

                if (hasOptions) {
                    optionData = this.collectMenuItemOptions(menuItem);

                    if (!optionData.isComplete) {
                        return;
                    }
                }

                const item = {
                    id: this.generateItemId(menuItem, optionData.options),
                    name: menuItem.dataset.name,
                    price: parseFloat(menuItem.dataset.price),
                    category: menuItem.dataset.category
                };

                if (optionData.options && optionData.options.length) {
                    item.options = optionData.options;
                }
                
                this.addItem(item);
                this.showAddToCartFeedback(button);

                if (hasOptions) {
                    this.resetMenuItemOptions(optionData);
                }
            });
        });
    }
    
    /**
     * Gérer la récupération et la validation des options d'un menu item
     * @param {HTMLElement} menuItem - L'élément du menu concerné
    * @returns {{options: Array, isComplete: boolean, wrapper: HTMLElement|null, selects: HTMLElement[], optionGroups: HTMLElement[], hint: HTMLElement|null}}
     */
    collectMenuItemOptions(menuItem) {
        const optionsWrapper = menuItem.querySelector('.menu-item-options');
        const result = {
            options: [],
            isComplete: true,
            wrapper: optionsWrapper,
            selects: [],
            optionGroups: [],
            hint: null,
            menuItem
        };

        if (!optionsWrapper) {
            return result;
        }

        optionsWrapper.classList.add('menu-item-options--visible');
        optionsWrapper.setAttribute('aria-hidden', 'false');

        const hint = optionsWrapper.querySelector('.menu-item-options-hint');
        result.hint = hint;

        let isComplete = true;
        const missingLabels = [];

        const optionGroups = Array.from(optionsWrapper.querySelectorAll('.menu-option'));
        result.optionGroups = optionGroups;

        const isStepped = optionsWrapper.dataset.stepMode === 'enabled';
        if (isStepped && optionsWrapper.dataset.stepComplete !== 'true') {
            optionsWrapper.classList.add('menu-item-options--error');
            const stepper = optionsWrapper._stepper;
            if (stepper) {
                stepper.open();
                stepper.focusStep();
            }
            if (hint) {
                const stepHint = hint.dataset.stepHint || hint.dataset.defaultHint || hint.textContent;
                hint.textContent = stepHint;
                hint.classList.add('menu-item-options-hint--error');
            }
            result.isComplete = false;
            return result;
        }

        if (optionGroups.length > 0) {
            optionGroups.forEach(option => {
                option.classList.remove('menu-option--error');

                const selectionType = option.dataset.selectionType || 'single';
                const max = parseInt(option.dataset.max, 10);
                const maxSelections = Number.isFinite(max) && max > 0
                    ? max
                    : (selectionType === 'multiple' ? option.querySelectorAll('.menu-option-button').length : 1);
                const required = option.dataset.required !== 'false';
                const buttons = Array.from(option.querySelectorAll('.menu-option-button'));
                const selectedButtons = buttons.filter(btn => btn.classList.contains('menu-option-button--selected'));

                if (selectedButtons.length > maxSelections) {
                    option.classList.add('menu-option--error');
                    isComplete = false;
                    return;
                }

                if (required && selectedButtons.length === 0) {
                    option.classList.add('menu-option--error');
                    missingLabels.push(option.dataset.optionLabel || option.dataset.optionKey || 'option');
                    isComplete = false;
                    return;
                }

                if (selectedButtons.length > 0) {
                    const values = selectedButtons.map(btn => btn.dataset.value || btn.textContent.trim());
                    const valueString = selectionType === 'multiple' ? values.join(', ') : values[0];
                    result.options.push({
                        key: option.dataset.optionKey || option.dataset.optionLabel || 'option',
                        label: option.dataset.optionLabel || option.dataset.optionKey || 'Option',
                        value: valueString
                    });
                }
            });
        } else {
            const selects = Array.from(optionsWrapper.querySelectorAll('select[data-required="true"]'));
            result.selects = selects;

            selects.forEach(select => {
                select.classList.remove('menu-option-select--error');
                if (!select.value) {
                    isComplete = false;
                    select.classList.add('menu-option-select--error');
                }
            });

            if (!isComplete) {
                const firstEmpty = selects.find(select => !select.value);
                if (firstEmpty) {
                    firstEmpty.focus();
                }
            } else {
                result.options = selects.map(select => {
                    const optionLabel = select.dataset.optionLabel || select.getAttribute('aria-label') || select.previousElementSibling?.textContent?.trim() || '';
                    const optionKey = select.dataset.optionKey || select.name || optionLabel.toLowerCase();
                    const selectedOption = select.options[select.selectedIndex];
                    const displayValue = selectedOption ? selectedOption.text.trim() : select.value;
                    return {
                        key: optionKey,
                        label: optionLabel || optionKey,
                        value: displayValue
                    };
                });
            }
        }

        if (!isComplete) {
            optionsWrapper.classList.add('menu-item-options--error');
            if (hint) {
                const defaultHint = hint.dataset.defaultHint || hint.textContent;
                const errorHint = hint.dataset.errorHint || (missingLabels.length ? `Veuillez sélectionner : ${missingLabels.join(', ')}.` : defaultHint);
                hint.textContent = errorHint;
                hint.classList.add('menu-item-options-hint--error');
            }

            if (optionGroups.length > 0) {
                const firstInvalidGroup = optionGroups.find(option => option.classList.contains('menu-option--error'));
                const firstButton = firstInvalidGroup?.querySelector('.menu-option-button');
                if (firstButton) {
                    firstButton.focus();
                }
            }
        } else {
            optionsWrapper.classList.remove('menu-item-options--error');
            if (hint) {
                const defaultHint = hint.dataset.defaultHint || hint.textContent;
                hint.textContent = defaultHint;
                hint.classList.remove('menu-item-options-hint--error');
            }
        }

        result.isComplete = isComplete;
        return result;
    }

    /**
     * Réinitialiser les options après ajout au panier
     * @param {Object} optionData - Données des options collectées
     */
    resetMenuItemOptions(optionData) {
        const { selects = [], optionGroups = [], wrapper, hint, menuItem } = optionData;

        selects.forEach(select => {
            if (select.querySelector('option[value=""]')) {
                select.value = '';
            } else {
                select.selectedIndex = 0;
            }
            select.classList.remove('menu-option-select--error');
        });

        optionGroups.forEach(option => {
            option.classList.remove('menu-option--error');
            option.classList.remove('menu-option--active');
            option.querySelectorAll('.menu-option-button').forEach(button => {
                button.classList.remove('menu-option-button--selected');
                button.setAttribute('aria-pressed', 'false');
            });
        });

        if (wrapper) {
            wrapper.classList.remove('menu-item-options--error');
            wrapper.dataset.stepComplete = 'false';

            if (wrapper._stepper && typeof wrapper._stepper.reset === 'function') {
                wrapper._stepper.reset();
            } else {
                wrapper.classList.remove('menu-item-options--visible');
                wrapper.setAttribute('aria-hidden', 'true');
            }
        }

        if (hint) {
            const defaultHint = hint.dataset.defaultHint || hint.textContent;
            hint.textContent = defaultHint;
            hint.classList.remove('menu-item-options-hint--error');
        }

        if (menuItem) {
            menuItem.classList.remove('menu-item--configuring', 'menu-item--ready');
        }
    }

    /**
     * Générer un ID unique pour un item
     * @param {HTMLElement} menuItem - L'élément menu
     * @returns {string} ID unique
     */
    generateItemId(menuItem, options = []) {
        const name = menuItem.dataset.name;
        const price = menuItem.dataset.price;
        const baseId = `${name}-${price}`.toLowerCase().replace(/\s+/g, '-');

        if (!options || !options.length) {
            return baseId;
        }

        const optionId = options
            .map(option => `${option.key}-${option.value}`.toLowerCase().replace(/\s+/g, '-'))
            .join('-');

        return `${baseId}-${optionId}`;
    }
    
    /**
     * Ajouter un article au panier
     * @param {Object} item - L'article à ajouter
     */
    addItem(item) {
        const existingItem = this.items.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...item,
                quantity: 1,
                addedAt: Date.now()
            });
        }
        
        this.updateCartDisplay();
        this.saveCartToStorage();
        
        // Ouvrir le panier automatiquement après ajout
        if (!this.isCartOpen) {
            this.toggleCart();
        }
        
        console.log('📦 Article ajouté:', item.name);
    }
    
    /**
     * Retirer un article du panier
     * @param {string} itemId - ID de l'article
     */
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.updateCartDisplay();
        this.saveCartToStorage();
        
        console.log('🗑️ Article retiré:', itemId);
    }
    
    /**
     * Modifier la quantité d'un article
     * @param {string} itemId - ID de l'article
     * @param {number} newQuantity - Nouvelle quantité
     */
    updateQuantity(itemId, newQuantity) {
        const item = this.items.find(cartItem => cartItem.id === itemId);
        
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = newQuantity;
                this.updateCartDisplay();
                this.saveCartToStorage();
            }
        }
    }
    
    /**
     * Calculer le total du panier
     * @returns {number} Total en euros
     */
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    /**
     * Obtenir le nombre total d'articles
     * @returns {number} Nombre total d'articles
     */
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
    
    /**
     * Basculer l'affichage du panier
     */
    toggleCart() {
        this.isCartOpen = !this.isCartOpen;
        
        if (cartContent) {
            cartContent.style.display = this.isCartOpen ? 'block' : 'none';
        }
        
        // Animation du bouton
        if (cartToggle) {
            cartToggle.classList.toggle('cart-bounce');
            setTimeout(() => {
                cartToggle.classList.remove('cart-bounce');
            }, 300);
        }
    }
    
    /**
     * Mettre à jour l'affichage du panier
     */
    updateCartDisplay() {
        this.updateCartCount();
        this.updateCartItems();
        this.updateCartSummary();
    }
    
    /**
     * Mettre à jour le compteur du panier
     */
    updateCartCount() {
        const totalItems = this.getTotalItems();
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            
            // Animation si il y a des articles
            if (totalItems > 0) {
                cartCount.parentElement.classList.add('cart-bounce');
                setTimeout(() => {
                    cartCount.parentElement.classList.remove('cart-bounce');
                }, 300);
            }
        }
    }
    
    /**
     * Mettre à jour la liste des articles dans le panier
     */
    updateCartItems() {
        if (!cartItems || !cartEmpty) return;
        
        // Vider le conteneur
        cartItems.innerHTML = '';
        
        if (this.items.length === 0) {
            cartEmpty.style.display = 'block';
        } else {
            cartEmpty.style.display = 'none';
            
            this.items.forEach(item => {
                const itemElement = this.createCartItemElement(item);
                cartItems.appendChild(itemElement);
            });
        }
    }
    
    /**
     * Créer l'élément HTML pour un article du panier
     * @param {Object} item - L'article
     * @returns {HTMLElement} Élément HTML
     */
    createCartItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        const itemTotal = (item.price * item.quantity).toFixed(2);
        const optionsHtml = item.options && item.options.length
            ? `<ul class="cart-item-options">${item.options.map(option => `<li><span>${option.label} :</span> ${option.value}</li>`).join('')}</ul>`
            : '';
        itemDiv.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                ${optionsHtml}
                <div class="cart-item-price">${item.price.toFixed(2)} CHF chacun</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" data-action="decrease" data-item-id="${item.id}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase" data-item-id="${item.id}">+</button>
                </div>
                <div class="cart-item-total">${itemTotal} CHF</div>
            </div>
        `;
        
        // Événements pour les contrôles
        const decreaseBtn = itemDiv.querySelector('[data-action="decrease"]');
        const increaseBtn = itemDiv.querySelector('[data-action="increase"]');
        
        decreaseBtn.addEventListener('click', () => {
            this.updateQuantity(item.id, item.quantity - 1);
        });
        
        increaseBtn.addEventListener('click', () => {
            this.updateQuantity(item.id, item.quantity + 1);
        });
        
        return itemDiv;
    }
    
    /**
     * Mettre à jour le résumé du panier
     */
    updateCartSummary() {
        if (!cartSummary || !cartTotal) return;

        const total = this.getTotal();

        if (this.items.length === 0) {
            cartSummary.style.display = 'none';
        } else {
            cartSummary.style.display = 'block';
            cartTotal.textContent = `${total.toFixed(2)} CHF`;
        }
    }
    
    /**
     * Feedback visuel lors de l'ajout au panier
     * @param {HTMLButtonElement} button - Le bouton cliqué
     */
    showAddToCartFeedback(button) {
        const originalText = button.textContent;
        
        // Animation du bouton
        button.classList.add('adding');
        button.textContent = 'Ajouté !';
        button.disabled = true;
        
        setTimeout(() => {
            button.classList.remove('adding');
            button.textContent = originalText;
            button.disabled = false;
        }, 1000);
    }
    
    /**
     * Processus de commande
     */
    checkout() {
        if (this.items.length === 0) {
            alert('Votre panier est vide !');
            return;
        }

        if (!this.validateCheckoutDetails()) {
            alert('Veuillez remplir tous les champs correctement.');
            return;
        }

        const total = this.getTotal();
        if (total < MIN_ORDER_TOTAL) {
            alert(`Désolé !\n Nous ne livrons pas en dessous de ${MIN_ORDER_TOTAL.toFixed(2)} CHF de commande.`);
            return;
        }
        const totalItems = this.getTotalItems();
        const customer = {
            lastName: checkoutFields.lastName.value.trim(),
            firstName: checkoutFields.firstName.value.trim(),
            address: checkoutFields.address.value.trim(),
            city: checkoutFields.city.value.trim(),
            phone: checkoutFields.phone.value.trim(),
            paymentMethod: checkoutFields.paymentMethod.value
        };

        const orderSummary = this.items.map(item => {
            const optionDetails = item.options && item.options.length
                ? ` (${item.options.map(opt => `${opt.label}: ${opt.value}`).join(', ')})`
                : '';
            return `${item.quantity}x ${item.name}${optionDetails} - ${(item.price * item.quantity).toFixed(2)} CHF`;
        }).join('\n');

        const customerSummary =
            `👤 Client : ${customer.firstName} ${customer.lastName}\n` +
            `🏠 Adresse : ${customer.address}, ${customer.city}\n` +
            `📞 Téléphone : ${customer.phone}\n` +
            `💳 Paiement : ${PAYMENT_LABELS[customer.paymentMethod] || '—'}`;

        const confirmMessage =
            `${customerSummary}\n\n🍽️ Commande :\n${orderSummary}\n\n` +
            `💰 Total : ${total.toFixed(2)} CHF\n📦 Nombre d'articles : ${totalItems}\n\nConfirmer la commande ?`;

        if (confirm(confirmMessage)) {
            alert('🎉 Commande confirmée ! \nVotre commande sera prête dans 15-20 minutes.\nMerci de votre confiance !');
            Object.values(checkoutFields).forEach(field => {
                if (!field) return;
                if (field.tagName === 'SELECT') {
                    field.selectedIndex = 0;
                } else {
                    field.value = '';
                }
                field.classList.remove('checkout-error');
            });
            
            // Vider le panier
            this.clearCart();
            
            // Fermer le panier
            if (this.isCartOpen) {
                this.toggleCart();
            }
            
            console.log('✅ Commande réalisée avec succès');
        }
    }
    
    /**
     * Valider les détails de la commande (checkout)
     * @returns {boolean} true si valide, false sinon
     */
    validateCheckoutDetails() {
        const values = {
            lastName: checkoutFields.lastName?.value.trim(),
            firstName: checkoutFields.firstName?.value.trim(),
            address: checkoutFields.address?.value.trim(),
            city: checkoutFields.city?.value.trim(),
            phone: checkoutFields.phone?.value.trim(),
            paymentMethod: checkoutFields.paymentMethod?.value.trim()
        };

        let isValid = true;

        for (const [key, value] of Object.entries(values)) {
            const field = checkoutFields[key];
            if (!field) continue;

            const baseInvalid = !value;
            const patternInvalid =
                key === 'phone' ? !CHECKOUT_PATTERNS.phone.test(value) :
                (key === 'lastName' || key === 'firstName') ? !CHECKOUT_PATTERNS.name.test(value) :
                key === 'paymentMethod' ? value === '' :
                false;

            if (baseInvalid || patternInvalid) {
                field.classList.add('checkout-error');
                isValid = false;
            } else {
                field.classList.remove('checkout-error');
            }
        }

        return isValid;
    }
    
    /**
     * Vider complètement le panier
     */
    clearCart() {
        this.items = [];
        this.updateCartDisplay();
        this.saveCartToStorage();
    }
    
    /**
     * Sauvegarder le panier dans le localStorage
     */
    saveCartToStorage() {
        try {
            localStorage.setItem('kebab_cart', JSON.stringify(this.items));
        } catch (error) {
            console.warn('⚠️ Impossible de sauvegarder le panier:', error);
        }
    }
    
    /**
     * Charger le panier depuis le localStorage
     * @returns {Array} Articles du panier
     */
    loadCartFromStorage() {
        try {
            const saved = localStorage.getItem('kebab_cart');
            if (!saved) {
                return [];
            }

            const parsed = JSON.parse(saved);

            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed.map(item => ({
                ...item,
                options: Array.isArray(item?.options) ? item.options : []
            }));
        } catch (error) {
            console.warn('⚠️ Impossible de charger le panier:', error);
            return [];
        }
    }
}

/**
 * Prépare les éléments de personnalisation des menus
 */
function initializeMenuItemOptions() {
    const menuItems = document.querySelectorAll('.menu-item[data-has-options="true"]');

    menuItems.forEach(menuItem => {
        const optionsWrapper = menuItem.querySelector('.menu-item-options');
        if (!optionsWrapper) {
            return;
        }

        const hint = optionsWrapper.querySelector('.menu-item-options-hint');

        if (hint && !hint.dataset.defaultHint) {
            hint.dataset.defaultHint = hint.textContent.trim();
        }

        optionsWrapper.setAttribute('aria-hidden', 'true');
        optionsWrapper.dataset.stepComplete = 'false';

        const optionGroups = Array.from(optionsWrapper.querySelectorAll('.menu-option'));

        if (optionGroups.length > 0) {
            const stepper = createMenuOptionStepper(menuItem, optionsWrapper, optionGroups, hint);
            if (stepper) {
                optionsWrapper._stepper = stepper;
            }
        }

        optionGroups.forEach(option => {
            const buttons = Array.from(option.querySelectorAll('.menu-option-button'));
            const selectionType = option.dataset.selectionType || 'single';
            const max = parseInt(option.dataset.max, 10);
            const maxSelections = Number.isFinite(max) && max > 0
                ? max
                : (selectionType === 'multiple' ? buttons.length : 1);

            buttons.forEach(button => {
                button.type = 'button';
                button.setAttribute('aria-pressed', 'false');

                button.addEventListener('click', () => {
                    optionsWrapper.classList.add('menu-item-options--visible');
                    optionsWrapper.setAttribute('aria-hidden', 'false');
                    menuItem.classList.add('menu-item--configuring');
                    if (optionsWrapper._stepper && typeof optionsWrapper._stepper.open === 'function') {
                        optionsWrapper._stepper.open();
                    }

                    const isSelected = button.classList.contains('menu-option-button--selected');

                    if (selectionType === 'single') {
                        if (isSelected) {
                            button.classList.remove('menu-option-button--selected');
                            button.setAttribute('aria-pressed', 'false');
                        } else {
                            buttons.forEach(btn => {
                                btn.classList.remove('menu-option-button--selected');
                                btn.setAttribute('aria-pressed', 'false');
                            });
                            button.classList.add('menu-option-button--selected');
                            button.setAttribute('aria-pressed', 'true');
                        }
                    } else {
                        if (isSelected) {
                            button.classList.remove('menu-option-button--selected');
                            button.setAttribute('aria-pressed', 'false');
                        } else {
                            const currentSelection = option.querySelectorAll('.menu-option-button--selected').length;
                            if (currentSelection >= maxSelections) {
                                option.classList.add('menu-option--error');
                                if (hint) {
                                    const limitMessage = option.dataset.limitMessage || `Vous pouvez sélectionner jusqu'à ${maxSelections} options.`;
                                    hint.textContent = limitMessage;
                                    hint.classList.add('menu-item-options-hint--error');
                                }
                                optionsWrapper.classList.add('menu-item-options--error');
                                return;
                            }
                            button.classList.add('menu-option-button--selected');
                            button.setAttribute('aria-pressed', 'true');
                        }
                    }

                    option.classList.remove('menu-option--error');

                    if (hint) {
                        const defaultHint = hint.dataset.defaultHint || hint.textContent;
                        hint.textContent = defaultHint;
                        hint.classList.remove('menu-item-options-hint--error');
                    }

                    optionsWrapper.classList.remove('menu-item-options--error');

                    if (optionsWrapper._stepper && typeof optionsWrapper._stepper.handleSelectionChange === 'function') {
                        optionsWrapper._stepper.handleSelectionChange(option);
                    }
                });
            });
        });

        const selects = Array.from(optionsWrapper.querySelectorAll('select[data-required="true"]'));
        selects.forEach(select => {
            select.addEventListener('focus', () => {
                optionsWrapper.classList.add('menu-item-options--visible');
                optionsWrapper.setAttribute('aria-hidden', 'false');
                menuItem.classList.add('menu-item--configuring');
                if (optionsWrapper._stepper && typeof optionsWrapper._stepper.open === 'function') {
                    optionsWrapper._stepper.open();
                }
            });

            select.addEventListener('change', () => {
                select.classList.remove('menu-option-select--error');
                optionsWrapper.classList.remove('menu-item-options--error');

                if (hint) {
                    const defaultHint = hint.dataset.defaultHint || hint.textContent;
                    hint.textContent = defaultHint;
                    hint.classList.remove('menu-item-options-hint--error');
                }

                if (optionsWrapper._stepper && typeof optionsWrapper._stepper.markDirty === 'function') {
                    optionsWrapper._stepper.markDirty();
                }
            });
        });
    });
}

function createMenuOptionStepper(menuItem, optionsWrapper, optionGroups, hint) {
    if (!optionsWrapper || !optionGroups.length) {
        return null;
    }

    optionsWrapper.classList.add('menu-item-options--stepped');
    optionsWrapper.dataset.stepMode = 'enabled';

    if (hint) {
        if (!hint.dataset.stepHint) {
            hint.dataset.stepHint = 'Complétez chaque étape pour continuer.';
        }
        if (!hint.dataset.completeHint) {
            hint.dataset.completeHint = 'Étapes terminées ! Cliquez sur "Ajouter au panier" pour confirmer.';
        }
    }

    const controls = document.createElement('div');
    controls.className = 'menu-options-controls';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'menu-options-prev';
    prevBtn.textContent = 'Précédent';

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'menu-options-next';
    nextBtn.textContent = optionGroups.length === 1 ? 'Valider' : 'Suivant';

    controls.append(prevBtn, nextBtn);

    const addToCartButton = menuItem.querySelector('.btn-add-to-cart');

    function setAddButtonDisabled(disabled) {
        if (!addToCartButton) {
            return;
        }
        addToCartButton.disabled = disabled;
        addToCartButton.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    }

    function focusAddButton() {
        if (!addToCartButton) {
            return;
        }
        requestAnimationFrame(() => addToCartButton.focus());
    }

    if (hint) {
        optionsWrapper.insertBefore(controls, hint);
    } else {
        optionsWrapper.appendChild(controls);
    }

    optionGroups.forEach((group, index) => {
        group.dataset.stepIndex = String(index);
        group.classList.toggle('menu-option--active', index === 0);
        group.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
    });

    optionsWrapper.dataset.activeStep = '0';
    setAddButtonDisabled(false);

    const state = {
        currentStep: 0,
        totalSteps: optionGroups.length,
        completed: false
    };

    function clearStepError() {
        optionsWrapper.classList.remove('menu-item-options--error');
        if (!hint) {
            return;
        }
        const defaultHint = hint.dataset.defaultHint || hint.textContent;
        hint.textContent = defaultHint;
        hint.classList.remove('menu-item-options-hint--error');
    }

    function showStepError(message) {
        if (!hint) {
            return;
        }
        hint.textContent = message;
        hint.classList.add('menu-item-options-hint--error');
    }

    function setStep(step) {
        state.currentStep = step;
        optionsWrapper.dataset.activeStep = String(step);
        optionGroups.forEach((group, index) => {
            const isActive = index === step;
            group.classList.toggle('menu-option--active', isActive);
            group.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });
        prevBtn.disabled = step === 0;
        if (!state.completed) {
            nextBtn.textContent = step === state.totalSteps - 1 ? 'Valider' : 'Suivant';
        }
        clearStepError();
    }

    function validateStep(stepIndex) {
        const group = optionGroups[stepIndex];
        if (!group) {
            return true;
        }

        const selectionType = group.dataset.selectionType || 'single';
        const required = group.dataset.required !== 'false';
        const buttons = Array.from(group.querySelectorAll('.menu-option-button'));
        const selectedButtons = buttons.filter(btn => btn.classList.contains('menu-option-button--selected'));
        const max = parseInt(group.dataset.max, 10);
        const maxSelections = Number.isFinite(max) && max > 0
            ? max
            : (selectionType === 'multiple' ? buttons.length : 1);

        if (selectedButtons.length > maxSelections) {
            group.classList.add('menu-option--error');
            const limitMessage = group.dataset.limitMessage || `Vous pouvez sélectionner jusqu'à ${maxSelections} options.`;
            showStepError(limitMessage);
            optionsWrapper.classList.add('menu-item-options--error');
            return false;
        }

        if (required && selectedButtons.length === 0) {
            group.classList.add('menu-option--error');
            const message = group.dataset.errorMessage || hint?.dataset.errorHint || 'Merci de compléter cette étape.';
            showStepError(message);
            optionsWrapper.classList.add('menu-item-options--error');
            const firstButton = buttons[0];
            if (firstButton) {
                firstButton.focus();
            }
            return false;
        }

        group.classList.remove('menu-option--error');
        clearStepError();
        return true;
    }

    function focusStep(step = state.currentStep) {
        const group = optionGroups[step];
        if (!group) {
            return;
        }
        const firstInteractive = group.querySelector('.menu-option-button, select, input');
        if (firstInteractive && typeof firstInteractive.focus === 'function') {
            firstInteractive.focus();
        }
    }

    function complete() {
        if (!validateStep(state.currentStep)) {
            return false;
        }

        state.completed = true;
        optionsWrapper.dataset.stepComplete = 'true';
        menuItem.classList.add('menu-item--ready');
        nextBtn.textContent = 'Étape validée';
        nextBtn.disabled = true;
        nextBtn.classList.add('menu-options-next--completed');
        clearStepError();
        setAddButtonDisabled(false);
        focusAddButton();
        if (hint) {
            const completeHint = hint.dataset.completeHint || hint.dataset.defaultHint || hint.textContent;
            hint.textContent = completeHint;
        }
        return true;
    }

    function advance() {
        if (!validateStep(state.currentStep)) {
            return false;
        }

        if (state.currentStep === state.totalSteps - 1) {
            return complete();
        }

        const nextStepIndex = state.currentStep + 1;
        state.completed = false;
        optionsWrapper.dataset.stepComplete = 'false';
        menuItem.classList.remove('menu-item--ready');
        nextBtn.disabled = false;
        nextBtn.classList.remove('menu-options-next--completed');
        setStep(nextStepIndex);
        requestAnimationFrame(() => focusStep(nextStepIndex));
        return true;
    }

    prevBtn.addEventListener('click', () => {
        if (state.currentStep === 0) {
            return;
        }
        state.completed = false;
        optionsWrapper.dataset.stepComplete = 'false';
        menuItem.classList.remove('menu-item--ready');
        nextBtn.disabled = false;
        nextBtn.classList.remove('menu-options-next--completed');
        setStep(state.currentStep - 1);
        requestAnimationFrame(() => focusStep());
    });

    nextBtn.addEventListener('click', () => {
        if (state.completed) {
            return;
        }
        if (state.currentStep === state.totalSteps - 1) {
            complete();
        } else {
            advance();
        }
    });

    // Initial UI state
    prevBtn.disabled = true;

    return {
        start() {
            state.currentStep = 0;
            state.completed = false;
            optionsWrapper.dataset.stepComplete = 'false';
            menuItem.classList.add('menu-item--configuring');
            optionsWrapper.classList.add('menu-item-options--visible');
            optionsWrapper.setAttribute('aria-hidden', 'false');
            nextBtn.disabled = false;
            nextBtn.classList.remove('menu-options-next--completed');
            prevBtn.disabled = true;
            setStep(0);
            clearStepError();
            setAddButtonDisabled(true);
            requestAnimationFrame(() => focusStep(0));
        },
        open() {
            optionsWrapper.classList.add('menu-item-options--visible');
            optionsWrapper.setAttribute('aria-hidden', 'false');
            menuItem.classList.add('menu-item--configuring');
            if (!state.completed) {
                setAddButtonDisabled(true);
            }
        },
        reset() {
            state.currentStep = 0;
            state.completed = false;
            optionsWrapper.dataset.stepComplete = 'false';
            menuItem.classList.remove('menu-item--configuring', 'menu-item--ready');
            optionsWrapper.classList.remove('menu-item-options--visible');
            optionsWrapper.setAttribute('aria-hidden', 'true');
            nextBtn.disabled = false;
            nextBtn.classList.remove('menu-options-next--completed');
            prevBtn.disabled = true;
            setStep(0);
            clearStepError();
            setAddButtonDisabled(false);
        },
        markDirty() {
            setAddButtonDisabled(true);
            if (state.completed) {
                state.completed = false;
                optionsWrapper.dataset.stepComplete = 'false';
                nextBtn.disabled = false;
                nextBtn.classList.remove('menu-options-next--completed');
                nextBtn.textContent = state.currentStep === state.totalSteps - 1 ? 'Valider' : 'Suivant';
                menuItem.classList.remove('menu-item--ready');
                clearStepError();
            }
        },
        handleSelectionChange(group) {
            this.markDirty();
            if (!group) {
                return;
            }

            const stepIndex = Number(group.dataset.stepIndex);
            if (!Number.isFinite(stepIndex) || stepIndex !== state.currentStep) {
                return;
            }

            if (state.completed) {
                return;
            }

            group.classList.remove('menu-option--error');
            clearStepError();
        },
        focusStep,
        advance,
        complete
    };
}

/* ========================================
   6. INITIALISATION
   ======================================== */

/**
 * Fonction d'initialisation principale
 * Exécutée quand le DOM est complètement chargé
 */
function init() {
    console.log('🥙 Site du Kebab du Campus initialisé avec succès!');
    
    // Initialiser l'observer pour la navigation active
    initScrollObserver();
    updateHeaderHeight();
    initHeaderContrastObserver();
    
    // Initialiser la validation du formulaire
    if (contactForm) {
        new FormValidator(contactForm);
    }
    
    initializeMenuItemOptions();

    // Initialiser le système de panier
    window.shoppingCart = new ShoppingCart();
    
    // Ajouter une animation au chargement de la page
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 100);
}

/**
 * Attendre que le DOM soit complètement chargé
 * DOMContentLoaded est préféré à window.onload car plus rapide
 * (ne attend pas les images et autres ressources)
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // Le DOM est déjà chargé, exécuter immédiatement
    init();
}

/**
 * FONCTIONNALITÉS ADDITIONNELLES (OPTIONNELLES)
 * Ces fonctions peuvent être décommentées pour ajouter des features
 */

/**
 * Ajouter un effet parallax au hero (décommenter pour activer)
 */
/*
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
});
*/

/**
 * Ajouter un bouton "retour en haut"
 */
function addScrollToTopButton() {
    // Créer le bouton
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'scroll-to-top';
    button.setAttribute('aria-label', 'Retour en haut');
    
    // Styles inline (ou ajouter au CSS)
    Object.assign(button.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        display: 'none',
        zIndex: '1000',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.3s'
    });
    
    // Ajouter au DOM
    document.body.appendChild(button);
    
    // Afficher/masquer selon le scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
    
    // Action au clic
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Effet hover
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
}

// Activer le bouton scroll to top (décommenter pour activer)
// addScrollToTopButton();

/**
 * FIN DU FICHIER JAVASCRIPT
 * 
 * RÉSUMÉ DES CONCEPTS UTILISÉS :
 * ✓ ES6+ (const, let, arrow functions, classes, template literals)
 * ✓ DOM manipulation moderne
 * ✓ Event listeners et delegation
 * ✓ Validation de formulaire robuste
 * ✓ IntersectionObserver API
 * ✓ Animation et transitions
 * ✓ Code modulaire et réutilisable
 * ✓ Commentaires pédagogiques
 * ✓ Accessibilité (ARIA, focus management)
 * ✓ Performance (debouncing, observer)
 * 
 * EXERCICES POUR LES ÉTUDIANTS :
 * 1. Ajouter la sauvegarde des données du formulaire dans localStorage
 * 2. Implémenter un système de filtrage pour le menu
 * 3. Ajouter une fonctionnalité de "favoris" pour les plats
 * 4. Créer un panier de commande avec calcul du total
 * 5. Ajouter une galerie d'images avec lightbox
 */
