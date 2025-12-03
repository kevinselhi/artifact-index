/**
 * AI Opportunity Index Dashboard - Data Management
 * Handles data loading, caching, and state management
 */

window.DashboardData = (function() {
    'use strict';

    const config = window.DashboardConfig;
    const utils = window.DashboardUtils;

    // ==========================================================================
    // State Management
    // ==========================================================================

    const state = {
        // Data stores
        artifacts: [],
        artifactSummaries: {},
        artifactMarketData: {},
        youSearchData: null,
        industryReportsData: null,

        // Loading states
        dataLoaded: false,
        isLoading: false,

        // View states
        currentView: 'overview',
        currentArtifactSort: 'alpha',
        currentIndustryFilter: 'all',
        currentConfidenceFilter: 'all',

        // Pagination states
        comparisonPage: 0,
        disruptionIndustriesShown: config.PAGINATION.DISRUPTION_INITIAL_COUNT,
        top25Count: 25,
        top25Model: 'chatgpt5',
        agreementExpanded: false,
        industryAgreementExpanded: false,
        controversyExpanded: false
    };

    // ==========================================================================
    // State Getters/Setters
    // ==========================================================================

    function getState(key) {
        return state[key];
    }

    function setState(key, value) {
        state[key] = value;
        // Emit change event for reactive updates
        document.dispatchEvent(new CustomEvent('dashboardStateChange', {
            detail: { key, value }
        }));
    }

    // ==========================================================================
    // Data Loading
    // ==========================================================================

    /**
     * Load all initial data
     * @returns {Promise<Object>} Loaded data
     */
    async function loadAllData() {
        if (state.isLoading) {
            console.warn('Data loading already in progress');
            return null;
        }

        setState('isLoading', true);
        utils.showLoadingOverlay('Loading dashboard data...');

        try {
            // Load main valuations data
            const valuationsData = await loadValuationsData();

            // Update state
            setState('artifacts', valuationsData.artifacts || []);
            setState('dataLoaded', true);

            utils.hideLoadingOverlay();
            utils.announceToScreenReader('Dashboard data loaded successfully');

            return valuationsData;
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            utils.hideLoadingOverlay();
            utils.announceToScreenReader('Failed to load dashboard data. Please refresh the page.');
            throw error;
        } finally {
            setState('isLoading', false);
        }
    }

    /**
     * Load main valuations data
     * @returns {Promise<Object>}
     */
    async function loadValuationsData() {
        try {
            const data = await utils.loadJSON(config.DATA_PATHS.MASTER_VALUATIONS);

            // Update artifact count in UI
            const countEl = document.getElementById('artifactCount');
            if (countEl) {
                countEl.textContent = data.artifacts?.length || 0;
            }

            console.log(`Loaded ${data.artifacts?.length || 0} artifacts from JSON`);
            return data;
        } catch (error) {
            console.error('Error loading valuations data:', error);

            // Update UI to show error
            const countEl = document.getElementById('artifactCount');
            if (countEl) {
                countEl.textContent = 'Error';
            }

            throw error;
        }
    }

    /**
     * Load You.com search results (lazy loaded on demand)
     * @returns {Promise<Object|null>}
     */
    async function loadYouSearchData() {
        if (state.youSearchData) return state.youSearchData;

        try {
            const data = await utils.loadJSON(config.DATA_PATHS.YOU_SEARCH_RESULTS);
            setState('youSearchData', data);
            return data;
        } catch (error) {
            console.error('Failed to load You.com search results:', error);
            return null;
        }
    }

    /**
     * Load industry reports data (lazy loaded on demand)
     * @returns {Promise<Object|null>}
     */
    async function loadIndustryReportsData() {
        if (state.industryReportsData) return state.industryReportsData;

        try {
            const data = await utils.loadJSON(config.DATA_PATHS.INDUSTRY_REPORTS);
            setState('industryReportsData', data);
            return data;
        } catch (error) {
            console.error('Failed to load industry reports:', error);
            return null;
        }
    }

    // ==========================================================================
    // Data Accessors
    // ==========================================================================

    /**
     * Get all artifacts
     * @returns {Array}
     */
    function getArtifacts() {
        return state.artifacts;
    }

    /**
     * Get artifact by ID
     * @param {string} id - Artifact ID
     * @returns {Object|undefined}
     */
    function getArtifactById(id) {
        const sanitizedId = utils.sanitizeArtifactId(id);
        return state.artifacts.find(a => a.id === sanitizedId);
    }

    /**
     * Get unique industries from artifacts
     * @returns {Array<string>}
     */
    function getUniqueIndustries() {
        return [...new Set(state.artifacts.map(a => a.sector))].sort();
    }

    /**
     * Get artifacts filtered by current filters
     * @returns {Array}
     */
    function getFilteredArtifacts() {
        let filtered = [...state.artifacts];

        // Filter by industry
        if (state.currentIndustryFilter !== 'all') {
            filtered = filtered.filter(a => a.sector === state.currentIndustryFilter);
        }

        // Filter by confidence
        if (state.currentConfidenceFilter !== 'all') {
            filtered = filtered.filter(a => {
                const marketData = state.artifactMarketData[a.id];
                const confidence = marketData ? marketData.confidence : 0;
                const level = utils.getConfidenceLevel(confidence);
                return level === state.currentConfidenceFilter;
            });
        }

        return filtered;
    }

    /**
     * Get artifacts sorted by current sort
     * @param {Array} artifacts - Artifacts to sort
     * @returns {Array}
     */
    function getSortedArtifacts(artifacts) {
        const sorted = [...artifacts];

        switch (state.currentArtifactSort) {
            case 'alpha':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'value':
                sorted.sort((a, b) => utils.calculateAverageValue(b) - utils.calculateAverageValue(a));
                break;
            case 'market':
                sorted.sort((a, b) => {
                    const aMarket = getArtifactMarketValue(a.id);
                    const bMarket = getArtifactMarketValue(b.id);
                    return bMarket - aMarket;
                });
                break;
            case 'consensus':
                sorted.sort((a, b) => utils.calculateConsensusScore(b) - utils.calculateConsensusScore(a));
                break;
        }

        return sorted;
    }

    /**
     * Get market value for an artifact
     * @param {string} artifactId - Artifact ID
     * @returns {number}
     */
    function getArtifactMarketValue(artifactId) {
        const marketData = state.artifactMarketData[artifactId];
        if (!marketData || !marketData.totalMarketValue) return 0;
        return (marketData.totalMarketValue.low + marketData.totalMarketValue.high) / 2;
    }

    /**
     * Get artifact summary
     * @param {string} artifactId - Artifact ID
     * @returns {Object|undefined}
     */
    function getArtifactSummary(artifactId) {
        return state.artifactSummaries[artifactId];
    }

    /**
     * Get artifact market data
     * @param {string} artifactId - Artifact ID
     * @returns {Object|undefined}
     */
    function getArtifactMarketData(artifactId) {
        return state.artifactMarketData[artifactId];
    }

    /**
     * Get news results for an artifact
     * @param {string} artifactId - Artifact ID
     * @returns {Promise<Array>}
     */
    async function getArtifactNews(artifactId) {
        const data = await loadYouSearchData();
        if (!data || !data.artifacts || !data.artifacts[artifactId]) {
            return [];
        }
        return data.artifacts[artifactId].results || [];
    }

    /**
     * Get industry report
     * @param {string} sector - Industry sector
     * @returns {Promise<Object|null>}
     */
    async function getIndustryReport(sector) {
        const data = await loadIndustryReportsData();
        if (!data || !data.sectors || !data.sectors[sector]) {
            return null;
        }
        return data.sectors[sector];
    }

    // ==========================================================================
    // Data Analysis
    // ==========================================================================

    /**
     * Get high variance artifacts
     * @param {number} limit - Max number to return
     * @returns {Array}
     */
    function getHighVarianceArtifacts(limit = 15, sectorFilter = 'all') {
        let filtered = state.artifacts
            .filter(a => Object.values(a.valuations).filter(v => v !== null).length >= 2);

        if (sectorFilter && sectorFilter !== 'all') {
            filtered = filtered.filter(a => a.sector === sectorFilter);
        }

        return filtered
            .sort((a, b) => b.variance_ratio - a.variance_ratio)
            .slice(0, limit);
    }

    /**
     * Get low variance artifacts
     * @param {number} limit - Max number to return
     * @param {string} sectorFilter - Optional sector filter
     * @returns {Array}
     */
    function getLowVarianceArtifacts(limit = 15, sectorFilter = 'all') {
        let filtered = state.artifacts
            .filter(a => Object.values(a.valuations).filter(v => v !== null).length >= 2);

        if (sectorFilter && sectorFilter !== 'all') {
            filtered = filtered.filter(a => a.sector === sectorFilter);
        }

        return filtered
            .sort((a, b) => a.variance_ratio - b.variance_ratio)
            .slice(0, limit);
    }

    /**
     * Get mid variance artifacts
     * @param {number} limit - Max number to return
     * @returns {Array}
     */
    function getMidVarianceArtifacts(limit = 15, sectorFilter = 'all') {
        let filtered = state.artifacts
            .filter(a => Object.values(a.valuations).filter(v => v !== null).length >= 2);

        if (sectorFilter && sectorFilter !== 'all') {
            filtered = filtered.filter(a => a.sector === sectorFilter);
        }

        const sorted = filtered.sort((a, b) => b.variance_ratio - a.variance_ratio);
        const highCount = sorted.filter(a => a.variance_ratio > config.VARIANCE_THRESHOLDS.HIGH).length;
        const midStart = Math.min(highCount, Math.floor(sorted.length / 3));
        return sorted.slice(midStart, midStart + limit);
    }

    /**
     * Get variance tier counts for display
     * @param {string} sectorFilter - Optional sector filter
     * @returns {Object} Counts for high, mid, low variance tiers
     */
    function getVarianceTierCounts(sectorFilter = 'all') {
        let filtered = state.artifacts
            .filter(a => Object.values(a.valuations).filter(v => v !== null).length >= 2);

        if (sectorFilter && sectorFilter !== 'all') {
            filtered = filtered.filter(a => a.sector === sectorFilter);
        }

        const highThreshold = config.VARIANCE_THRESHOLDS.HIGH;
        const midThreshold = config.VARIANCE_THRESHOLDS.MEDIUM;

        return {
            high: filtered.filter(a => a.variance_ratio > highThreshold).length,
            mid: filtered.filter(a => a.variance_ratio >= midThreshold && a.variance_ratio <= highThreshold).length,
            low: filtered.filter(a => a.variance_ratio < midThreshold).length,
            total: filtered.length
        };
    }

    /**
     * Get unique sectors that have variance data
     * @returns {Array} Sorted array of sector names
     */
    function getVarianceSectors() {
        const sectors = state.artifacts
            .filter(a => Object.values(a.valuations).filter(v => v !== null).length >= 2)
            .map(a => a.sector)
            .filter(Boolean);
        return [...new Set(sectors)].sort();
    }

    /**
     * Get methodology tag for an artifact based on its sector
     * @param {Object} artifact - Artifact object
     * @returns {Object} Tag and explanation
     */
    function getMethodologyTag(artifact) {
        const sector = artifact.sector || '';
        const ratio = artifact.variance_ratio || 1;

        // Sector-specific methodology explanations
        const methodologyMap = {
            'Medical/Pharma': { tag: 'R&D vs Fee', explanation: 'R&D cost vs consulting fee' },
            'Engineering': { tag: 'Scope Scale', explanation: 'Project scope varies widely' },
            'Financial Services': { tag: 'Deal Premium', explanation: 'Fee scales with deal size' },
            'Technology': { tag: 'Scale Dependent', explanation: 'Implementation scope varies' },
            'Legal': { tag: 'Hourly vs Fixed', explanation: 'Billing approach varies' },
            'Environmental/Engineering': { tag: 'Scope Scale', explanation: 'Basic vs comprehensive study' },
            'Management Consulting': { tag: 'Scope Dependent', explanation: 'Engagement size varies' }
        };

        // Check for specific artifact patterns
        if (artifact.name?.toLowerCase().includes('clinical trial')) {
            return { tag: 'R&D vs Fee', explanation: 'Full trial cost vs management fee' };
        }
        if (artifact.name?.toLowerCase().includes('drug') || artifact.name?.toLowerCase().includes('nda')) {
            return { tag: 'R&D vs Fee', explanation: 'Development cost vs filing fee' };
        }
        if (artifact.name?.toLowerCase().includes('infrastructure') || artifact.name?.toLowerCase().includes('nuclear')) {
            return { tag: 'Scope Scale', explanation: 'Basic design vs full delivery' };
        }
        if (artifact.name?.toLowerCase().includes('erp') || artifact.name?.toLowerCase().includes('implementation')) {
            return { tag: 'Scale Dependent', explanation: 'SMB vs enterprise scale' };
        }

        // Return sector-specific or default
        return methodologyMap[sector] || { tag: 'Methodology', explanation: 'Different valuation approaches' };
    }

    /**
     * Get consensus artifacts (high model agreement)
     * @param {string} industry - Optional industry filter
     * @param {number} limit - Max number to return
     * @returns {Array}
     */
    function getConsensusArtifacts(industry = 'all', limit = 15) {
        let source = state.artifacts;
        if (industry !== 'all') {
            source = source.filter(a => a.sector === industry);
        }

        return source
            .map(a => {
                const values = Object.entries(a.valuations).filter(([k, v]) => v !== null);
                const modelCount = values.length;
                const vals = values.map(([k, v]) => v);
                const minVal = Math.min(...vals);
                const maxVal = Math.max(...vals);
                const avgVal = vals.reduce((sum, v) => sum + v, 0) / vals.length;
                return { ...a, modelCount, minVal, maxVal, avgVal };
            })
            .filter(a => a.modelCount >= 3)
            .sort((a, b) => {
                if (a.variance_ratio !== b.variance_ratio) {
                    return a.variance_ratio - b.variance_ratio;
                }
                return b.modelCount - a.modelCount;
            })
            .slice(0, limit);
    }

    /**
     * Get top artifacts by model
     * @param {string} modelKey - Model key
     * @param {number} count - Number to return
     * @returns {Array}
     */
    function getTopArtifactsByModel(modelKey, count = 25) {
        return state.artifacts
            .filter(a => a.valuations[modelKey] !== null && a.valuations[modelKey] !== undefined)
            .sort((a, b) => b.valuations[modelKey] - a.valuations[modelKey])
            .slice(0, count);
    }

    /**
     * Get sector statistics
     * @returns {Object}
     */
    function getSectorStats() {
        const stats = {};

        state.artifacts.forEach(a => {
            const sector = a.sector;
            if (!stats[sector]) {
                stats[sector] = {
                    count: 0,
                    totalVariance: 0,
                    totalValue: 0,
                    artifacts: []
                };
            }
            stats[sector].count++;
            stats[sector].totalVariance += a.variance_ratio;
            stats[sector].totalValue += utils.calculateAverageValue(a);
            stats[sector].artifacts.push(a);
        });

        // Calculate averages
        for (const sector in stats) {
            stats[sector].avgVariance = stats[sector].totalVariance / stats[sector].count;
            stats[sector].avgValue = stats[sector].totalValue / stats[sector].count;
        }

        return stats;
    }

    // ==========================================================================
    // Set artifact summaries and market data (called from HTML)
    // ==========================================================================

    function setArtifactSummaries(summaries) {
        state.artifactSummaries = summaries || {};
    }

    function setArtifactMarketData(marketData) {
        state.artifactMarketData = marketData || {};
    }

    // ==========================================================================
    // Public API
    // ==========================================================================

    return Object.freeze({
        // State management
        getState,
        setState,

        // Data loading
        loadAllData,
        loadValuationsData,
        loadYouSearchData,
        loadIndustryReportsData,

        // Data accessors
        getArtifacts,
        getArtifactById,
        getUniqueIndustries,
        getFilteredArtifacts,
        getSortedArtifacts,
        getArtifactMarketValue,
        getArtifactSummary,
        getArtifactMarketData,
        getArtifactNews,
        getIndustryReport,

        // Data analysis
        getHighVarianceArtifacts,
        getLowVarianceArtifacts,
        getMidVarianceArtifacts,
        getVarianceTierCounts,
        getVarianceSectors,
        getMethodologyTag,
        getConsensusArtifacts,
        getTopArtifactsByModel,
        getSectorStats,

        // Data setters
        setArtifactSummaries,
        setArtifactMarketData
    });
})();
