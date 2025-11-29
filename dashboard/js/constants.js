/**
 * AI Opportunity Index Dashboard - Constants
 * Single source of truth for configuration values
 */

// Use IIFE to avoid global pollution
window.DashboardConfig = (function() {
    'use strict';

    // Model colors - matches CSS variables
    const MODEL_COLORS = Object.freeze({
        chatgpt5: '#FF6B6B',
        chatgpt51: '#10A37F',
        o3pro: '#9B5DE5',
        perplexity: '#F9844A',
        claude_sonnet45: '#E07A5F',
        opus45: '#81B29A',
        gemini: '#4285F4',
        gemini30: '#00BFA5'
    });

    // Model display names
    const MODEL_NAMES = Object.freeze({
        chatgpt5: 'ChatGPT 5',
        chatgpt51: 'ChatGPT 5-1',
        o3pro: 'o3pro',
        perplexity: 'Perplexity Pro',
        claude_sonnet45: 'Claude Sonnet 4.5',
        opus45: 'Claude Opus 4.5',
        gemini: 'Gemini 2.5 Pro',
        gemini30: 'Gemini 3.0 Pro'
    });

    // Industry colors for consistent visualization
    const INDUSTRY_COLORS = Object.freeze({
        'Medical/Pharma': '#E07A5F',
        'Financial Services': '#4285F4',
        'Technology': '#81B29A',
        'Legal/Financial': '#10A37F',
        'Management Consulting': '#9B5DE5',
        'Engineering': '#FF6B6B',
        'Real Estate': '#F9844A',
        'Environmental/Engineering': '#00BFA5',
        'Operations/Consulting': '#FFD93D',
        'Legal/Compliance': '#6BCB77',
        'Healthcare': '#E91E63',
        'Energy': '#FF9800',
        'Government': '#3F51B5',
        'Media/Entertainment': '#9C27B0',
        'Telecommunications': '#00BCD4',
        'Retail/Consumer': '#8BC34A',
        'Manufacturing': '#795548',
        'Agriculture': '#4CAF50',
        'Legal': '#26A69A'
    });

    // US Annual Market Spend by Industry (2024, in USD)
    // Sources: Grand View Research, Mordor Intelligence, Statista, etc.
    const INDUSTRY_MARKET_DATA = Object.freeze({
        'Medical/Pharma': { spend: 29000000000, source: 'Healthcare consulting services (MarketsandMarkets 2024)' },
        'Financial Services': { spend: 150000000000, source: 'Financial advisory & consulting (Big Four + independent, Statista 2024)' },
        'Technology': { spend: 115000000000, source: 'IT/Software consulting North America (Precedence Research 2024)' },
        'Management Consulting': { spend: 85000000000, source: 'US management consulting services (Mordor Intelligence 2024)' },
        'Legal': { spend: 350000000000, source: 'US legal services market (Grand View Research 2024)' },
        'Legal/Financial': { spend: 200000000000, source: 'Combined legal & financial advisory services' },
        'Financial/Legal': { spend: 200000000000, source: 'Combined financial & legal advisory services' },
        'Engineering': { spend: 163000000000, source: 'US engineering services (Verified Market Research 2024)' },
        'Technology/Compliance': { spend: 95000000000, source: 'IT compliance & GRC consulting (Gartner estimates)' },
        'Operations/Consulting': { spend: 70000000000, source: 'Operations management consulting (IBISWorld 2024)' },
        'Environmental/Engineering': { spend: 45000000000, source: 'Environmental consulting services (Grand View Research 2024)' },
        'Tax/International': { spend: 40000000000, source: 'Tax advisory services US (Straits Research 2024)' },
        'HR Consulting': { spend: 37000000000, source: 'US HR consulting market (Mordor Intelligence 2024)' },
        'Architecture': { spend: 45000000000, source: 'US architectural services (IBISWorld 2024)' },
        'Creative/Marketing': { spend: 81000000000, source: 'US advertising agencies (IBISWorld 2024)' },
        'Environmental': { spend: 35000000000, source: 'Environmental consulting (Precedence Research 2024)' },
        'Real Estate': { spend: 27000000000, source: 'Real estate advisory services (Business Research Insights 2024)' },
        'Legal/Compliance': { spend: 120000000000, source: 'Legal compliance & regulatory services' },
        'Marketing': { spend: 81000000000, source: 'US marketing services (Mordor Intelligence 2024)' }
    });

    // Variance thresholds
    const VARIANCE_THRESHOLDS = Object.freeze({
        HIGH: 10,      // > 10x is high variance
        MEDIUM: 3,     // 3x - 10x is medium variance
        LOW: 3         // < 3x is low variance
    });

    // Confidence thresholds (percentage)
    const CONFIDENCE_THRESHOLDS = Object.freeze({
        HIGH: 80,      // >= 80% is high confidence
        MEDIUM: 65,    // 65-79% is medium confidence
        LOWER: 65      // < 65% is lower confidence
    });

    // Pagination settings
    const PAGINATION = Object.freeze({
        ITEMS_PER_PAGE: 10,
        COMPARISON_ITEMS_PER_PAGE: 10,
        DISRUPTION_INITIAL_COUNT: 6,
        TOP_ARTIFACTS_OPTIONS: [25, 50, 100]
    });

    // Network settings
    const NETWORK = Object.freeze({
        FETCH_TIMEOUT: 10000,       // 10 seconds
        MAX_RETRIES: 3,
        RETRY_DELAY_BASE: 1000,     // 1 second, exponential backoff
        MCP_RATE_LIMIT_DELAY: 2000  // 2 seconds between MCP calls
    });

    // Chart settings
    const CHART = Object.freeze({
        ANIMATION_DURATION: 400,
        TOOLTIP_DELAY: 200,
        MAX_LABEL_LENGTH: 30,
        MAX_LABEL_LENGTH_MOBILE: 18
    });

    // Data file paths
    const DATA_PATHS = Object.freeze({
        MASTER_VALUATIONS: 'data/master_valuations.json',
        YOU_SEARCH_RESULTS: 'data/you-search-results.json',
        INDUSTRY_REPORTS: 'data/industry-reports.json'
    });

    // Public API
    return Object.freeze({
        MODEL_COLORS,
        MODEL_NAMES,
        INDUSTRY_COLORS,
        INDUSTRY_MARKET_DATA,
        VARIANCE_THRESHOLDS,
        CONFIDENCE_THRESHOLDS,
        PAGINATION,
        NETWORK,
        CHART,
        DATA_PATHS
    });
})();
