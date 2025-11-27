/**
 * AI Opportunity Index Dashboard - Utility Functions
 * Includes XSS protection, formatting, error handling
 */

window.DashboardUtils = (function() {
    'use strict';

    const config = window.DashboardConfig;

    // ==========================================================================
    // XSS Protection - CRITICAL SECURITY
    // ==========================================================================

    /**
     * Escape HTML entities to prevent XSS attacks
     * @param {string} str - String to escape
     * @returns {string} Escaped string safe for HTML insertion
     */
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }

    /**
     * Escape HTML attribute values
     * @param {string} str - String to escape
     * @returns {string} Escaped string safe for attribute values
     */
    function escapeAttr(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    /**
     * Create a safe DOM element with escaped content
     * @param {string} tag - HTML tag name
     * @param {Object} attrs - Attributes object
     * @param {string|Node|Array} content - Content (will be escaped if string)
     * @returns {HTMLElement}
     */
    function createElement(tag, attrs = {}, content = null) {
        const el = document.createElement(tag);

        for (const [key, value] of Object.entries(attrs)) {
            if (key === 'className') {
                el.className = value;
            } else if (key === 'dataset') {
                for (const [dataKey, dataValue] of Object.entries(value)) {
                    el.dataset[dataKey] = dataValue;
                }
            } else if (key.startsWith('on') && typeof value === 'function') {
                el.addEventListener(key.slice(2).toLowerCase(), value);
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value);
            } else {
                el.setAttribute(key, value);
            }
        }

        if (content !== null) {
            if (typeof content === 'string') {
                el.textContent = content; // Safe: uses textContent
            } else if (content instanceof Node) {
                el.appendChild(content);
            } else if (Array.isArray(content)) {
                content.forEach(child => {
                    if (child instanceof Node) {
                        el.appendChild(child);
                    } else if (typeof child === 'string') {
                        el.appendChild(document.createTextNode(child));
                    }
                });
            }
        }

        return el;
    }

    // ==========================================================================
    // Formatting Functions
    // ==========================================================================

    /**
     * Format a number as currency
     * @param {number} value - Value to format
     * @returns {string} Formatted currency string
     */
    function formatCurrency(value) {
        if (value === null || value === undefined || isNaN(value)) return 'N/A';

        if (value >= 1000000000) {
            return '$' + (value / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
        }
        if (value >= 1000000) {
            return '$' + (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (value >= 1000) {
            return '$' + (value / 1000).toFixed(0) + 'K';
        }
        return '$' + value.toLocaleString();
    }

    /**
     * Format currency in short form for chart labels
     * @param {number} value - Value to format
     * @returns {string} Short currency string
     */
    function formatCurrencyShort(value) {
        if (value >= 1000000000) return (value / 1000000000).toFixed(0) + 'B';
        if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
        return String(value);
    }

    /**
     * Format volume numbers with abbreviations
     * @param {number} num - Number to format
     * @returns {string} Formatted volume string
     */
    function formatVolume(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return num.toLocaleString();
    }

    /**
     * Format percentage
     * @param {number} value - Value between 0 and 100
     * @param {number} decimals - Decimal places
     * @returns {string} Formatted percentage
     */
    function formatPercent(value, decimals = 0) {
        if (value === null || value === undefined || isNaN(value)) return 'N/A';
        return value.toFixed(decimals) + '%';
    }

    // ==========================================================================
    // Network / Fetch with Retry
    // ==========================================================================

    /**
     * Fetch with retry, timeout, and error handling
     * @param {string} url - URL to fetch
     * @param {Object} options - Fetch options
     * @returns {Promise<Response>}
     */
    async function fetchWithRetry(url, options = {}) {
        const maxRetries = options.maxRetries || config.NETWORK.MAX_RETRIES;
        const timeout = options.timeout || config.NETWORK.FETCH_TIMEOUT;
        const baseDelay = config.NETWORK.RETRY_DELAY_BASE;

        let lastError;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response;
            } catch (error) {
                lastError = error;

                if (error.name === 'AbortError') {
                    console.warn(`Fetch timeout for ${url} (attempt ${attempt + 1}/${maxRetries})`);
                } else {
                    console.warn(`Fetch failed for ${url} (attempt ${attempt + 1}/${maxRetries}):`, error.message);
                }

                // Don't retry on last attempt
                if (attempt < maxRetries - 1) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    await sleep(delay);
                }
            }
        }

        throw lastError;
    }

    /**
     * Load JSON with retry and error handling
     * @param {string} url - URL to fetch
     * @returns {Promise<Object>}
     */
    async function loadJSON(url) {
        const response = await fetchWithRetry(url);
        return response.json();
    }

    // ==========================================================================
    // DOM Utilities
    // ==========================================================================

    /**
     * Show loading state in an element
     * @param {HTMLElement} element - Target element
     * @param {string} message - Loading message
     */
    function showLoading(element, message = 'Loading...') {
        if (!element) return;
        element.innerHTML = '';
        element.appendChild(
            createElement('div', { className: 'loading-inline' }, message)
        );
    }

    /**
     * Show error state in an element
     * @param {HTMLElement} element - Target element
     * @param {string} message - Error message
     * @param {Function} retryFn - Optional retry function
     */
    function showError(element, message, retryFn = null) {
        if (!element) return;

        const errorDiv = createElement('div', { className: 'error-message' });
        errorDiv.appendChild(createElement('p', {}, message));

        if (retryFn) {
            const retryBtn = createElement('button', {}, 'Retry');
            retryBtn.addEventListener('click', retryFn);
            errorDiv.appendChild(retryBtn);
        }

        element.innerHTML = '';
        element.appendChild(errorDiv);
    }

    /**
     * Show global loading overlay
     * @param {string} message - Loading message
     */
    function showLoadingOverlay(message = 'Loading dashboard...') {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = createElement('div', {
                id: 'loading-overlay',
                className: 'loading-overlay',
                role: 'alert',
                'aria-live': 'polite'
            });
            overlay.appendChild(createElement('div', { className: 'loading-spinner' }));
            overlay.appendChild(createElement('p', { className: 'loading-text' }, message));
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
        overlay.querySelector('.loading-text').textContent = message;
    }

    /**
     * Hide global loading overlay
     */
    function hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * Debounce function calls
     * @param {Function} fn - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function}
     */
    function debounce(fn, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    /**
     * Throttle function calls
     * @param {Function} fn - Function to throttle
     * @param {number} limit - Minimum time between calls
     * @returns {Function}
     */
    function throttle(fn, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Sleep for a given duration
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ==========================================================================
    // Calculation Utilities
    // ==========================================================================

    /**
     * Calculate consensus score for an artifact
     * @param {Object} artifact - Artifact object with valuations
     * @returns {number} Consensus score
     */
    function calculateConsensusScore(artifact) {
        const values = Object.values(artifact.valuations).filter(v => v !== null);
        const modelCount = values.length;
        if (modelCount < 2) return 0;

        const varianceFactor = Math.max(0, 10 - Math.log10(artifact.variance_ratio + 1) * 3);
        return modelCount * varianceFactor;
    }

    /**
     * Calculate average value for an artifact
     * @param {Object} artifact - Artifact object with valuations
     * @returns {number} Average value
     */
    function calculateAverageValue(artifact) {
        const values = Object.values(artifact.valuations).filter(v => v !== null);
        if (values.length === 0) return 0;
        return values.reduce((sum, v) => sum + v, 0) / values.length;
    }

    /**
     * Get variance class based on ratio
     * @param {number} ratio - Variance ratio
     * @returns {string} CSS class name
     */
    function getVarianceClass(ratio) {
        const thresholds = config.VARIANCE_THRESHOLDS;
        if (ratio > thresholds.HIGH) return 'variance-high';
        if (ratio > thresholds.MEDIUM) return 'variance-medium';
        return 'variance-low';
    }

    /**
     * Get confidence level from percentage
     * @param {number} confidence - Confidence percentage
     * @returns {string} 'high', 'medium', or 'lower'
     */
    function getConfidenceLevel(confidence) {
        const thresholds = config.CONFIDENCE_THRESHOLDS;
        if (confidence >= thresholds.HIGH) return 'high';
        if (confidence >= thresholds.MEDIUM) return 'medium';
        return 'lower';
    }

    /**
     * Get confidence color based on percentage
     * @param {number} confidence - Confidence percentage
     * @returns {string} Color hex code
     */
    function getConfidenceColor(confidence) {
        const level = getConfidenceLevel(confidence);
        switch (level) {
            case 'high': return '#81B29A';
            case 'medium': return '#F4A261';
            default: return '#E07A5F';
        }
    }

    // ==========================================================================
    // Accessibility Utilities
    // ==========================================================================

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - 'polite' or 'assertive'
     */
    function announceToScreenReader(message, priority = 'polite') {
        let announcer = document.getElementById('sr-announcer');
        if (!announcer) {
            announcer = createElement('div', {
                id: 'sr-announcer',
                className: 'sr-only',
                role: 'status',
                'aria-live': priority,
                'aria-atomic': 'true'
            });
            document.body.appendChild(announcer);
        }

        announcer.setAttribute('aria-live', priority);
        announcer.textContent = message;
    }

    /**
     * Make an element keyboard navigable as a button
     * @param {HTMLElement} element - Target element
     * @param {Function} callback - Click callback
     */
    function makeKeyboardAccessible(element, callback) {
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'button');

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                callback(e);
            }
        });
    }

    // ==========================================================================
    // Validation Utilities
    // ==========================================================================

    /**
     * Check if a value is a valid artifact ID
     * @param {string} id - ID to validate
     * @returns {boolean}
     */
    function isValidArtifactId(id) {
        if (!id || typeof id !== 'string') return false;
        // Only allow alphanumeric, underscore, and hyphen
        return /^[a-zA-Z0-9_-]+$/.test(id);
    }

    /**
     * Sanitize artifact ID for safe use
     * @param {string} id - ID to sanitize
     * @returns {string} Sanitized ID
     */
    function sanitizeArtifactId(id) {
        if (!id || typeof id !== 'string') return '';
        return id.replace(/[^a-zA-Z0-9_-]/g, '');
    }

    // ==========================================================================
    // Public API
    // ==========================================================================

    return Object.freeze({
        // XSS Protection
        escapeHtml,
        escapeAttr,
        createElement,

        // Formatting
        formatCurrency,
        formatCurrencyShort,
        formatVolume,
        formatPercent,

        // Network
        fetchWithRetry,
        loadJSON,

        // DOM
        showLoading,
        showError,
        showLoadingOverlay,
        hideLoadingOverlay,
        debounce,
        throttle,
        sleep,

        // Calculations
        calculateConsensusScore,
        calculateAverageValue,
        getVarianceClass,
        getConfidenceLevel,
        getConfidenceColor,

        // Accessibility
        announceToScreenReader,
        makeKeyboardAccessible,

        // Validation
        isValidArtifactId,
        sanitizeArtifactId
    });
})();
