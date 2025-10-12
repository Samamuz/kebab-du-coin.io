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

// Shopping cart elements
const cartToggle = document.getElementById('cartToggle');
const cartContent = document.getElementById('cartContent');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartSummary = document.getElementById('cartSummary');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

/**
 * Configuration pour la validation du formulaire
 * Centraliser les patterns de validation facilite la maintenance
 */
const VALIDATION_PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    name: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/
};

/**
 * Messages d'erreur personnalisés
 * Utilisation d'un objet pour faciliter la traduction/modification
 */
const ERROR_MESSAGES = {
    required: 'Ce champ est obligatoire',
    invalidEmail: 'Veuillez entrer une adresse email valide',
    invalidPhone: 'Veuillez entrer un numéro de téléphone valide (ex: 06 12 34 56 78)',
    invalidName: 'Veuillez entrer un nom valide (2-50 caractères)',
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
}

/**
 * Fonction pour fermer le menu mobile
 * Utile quand on clique sur un lien ou en dehors du menu
 */
function closeMobileMenu() {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
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

/**
 * Masquer/afficher le header au scroll (optionnel)
 * Améliore l'espace d'affichage sur mobile
 */
let lastScrollTop = 0;
let scrollTimer;

window.addEventListener('scroll', () => {
    // Utilisation d'un timer pour limiter la fréquence d'exécution (debouncing)
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Si on scroll vers le bas de plus de 100px, masquer le header
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            // Si on scroll vers le haut, afficher le header
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    }, 100); // Exécuter maximum une fois toutes les 100ms
});

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
                // Nettoyer le numéro de téléphone (retirer espaces, points, tirets)
                const cleanPhone = value.replace(/[\s.-]/g, '');
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
                
                if (menuItem) {
                    const item = {
                        id: this.generateItemId(menuItem),
                        name: menuItem.dataset.name,
                        price: parseFloat(menuItem.dataset.price),
                        category: menuItem.dataset.category
                    };
                    
                    this.addItem(item);
                    this.showAddToCartFeedback(button);
                }
            });
        });
    }
    
    /**
     * Générer un ID unique pour un item
     * @param {HTMLElement} menuItem - L'élément menu
     * @returns {string} ID unique
     */
    generateItemId(menuItem) {
        const name = menuItem.dataset.name;
        const price = menuItem.dataset.price;
        return `${name}-${price}`.toLowerCase().replace(/\s+/g, '-');
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
        itemDiv.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price.toFixed(2)}€ chacun</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" data-action="decrease" data-item-id="${item.id}">-</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" data-action="increase" data-item-id="${item.id}">+</button>
                <button class="remove-item" data-item-id="${item.id}">Supprimer</button>
            </div>
        `;
        
        // Événements pour les contrôles
        const decreaseBtn = itemDiv.querySelector('[data-action="decrease"]');
        const increaseBtn = itemDiv.querySelector('[data-action="increase"]');
        const removeBtn = itemDiv.querySelector('.remove-item');
        
        decreaseBtn.addEventListener('click', () => {
            this.updateQuantity(item.id, item.quantity - 1);
        });
        
        increaseBtn.addEventListener('click', () => {
            this.updateQuantity(item.id, item.quantity + 1);
        });
        
        removeBtn.addEventListener('click', () => {
            this.removeItem(item.id);
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
            cartTotal.textContent = `${total.toFixed(2)}€`;
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
        
        const total = this.getTotal();
        const totalItems = this.getTotalItems();
        
        // Simulation d'une commande
        const orderSummary = this.items.map(item => 
            `${item.quantity}x ${item.name} - ${(item.price * item.quantity).toFixed(2)}€`
        ).join('\n');
        
        const confirmMessage = `🍽️ Résumé de votre commande :\n\n${orderSummary}\n\n💰 Total : ${total.toFixed(2)}€\n📦 Nombre d'articles : ${totalItems}\n\nConfirmer la commande ?`;
        
        if (confirm(confirmMessage)) {
            // Simulation de la commande réussie
            alert('🎉 Commande confirmée !\n\nVotre commande sera prête dans 15-20 minutes.\nMerci de votre confiance !');
            
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
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.warn('⚠️ Impossible de charger le panier:', error);
            return [];
        }
    }
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
    
    // Initialiser la validation du formulaire
    if (contactForm) {
        new FormValidator(contactForm);
    }
    
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
