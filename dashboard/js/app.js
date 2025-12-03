/**
 * AI Opportunity Index Dashboard - Main Application
 * Handles view switching, navigation, and user interactions
 */

window.DashboardApp = (function() {
    'use strict';

    const config = window.DashboardConfig;
    const utils = window.DashboardUtils;
    const dataManager = window.DashboardData;
    const charts = window.DashboardCharts;

    // ==========================================================================
    // Initialization
    // ==========================================================================

    /**
     * Initialize the dashboard application
     */
    async function init() {
        try {
            // Show loading state
            utils.showLoadingOverlay('Loading dashboard...');

            // Load data
            await dataManager.loadAllData();

            // Initialize all views
            initTabs();
            initOverview();
            initComparison();
            initArtifactView();
            initVarianceView();

            // Set up keyboard navigation
            initKeyboardNavigation();

            // Set up resize handler
            initResizeHandler();

            utils.hideLoadingOverlay();
            utils.announceToScreenReader('Dashboard loaded successfully');

        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            utils.hideLoadingOverlay();
            showInitError(error);
        }
    }

    /**
     * Show initialization error
     */
    function showInitError(error) {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = '';
            utils.showError(container, 'Failed to load dashboard. Please refresh the page.', init);
        }
    }

    // ==========================================================================
    // Tab Navigation
    // ==========================================================================

    /**
     * Initialize tab navigation
     */
    function initTabs() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            // Make tabs keyboard accessible
            tab.setAttribute('role', 'tab');
            tab.setAttribute('tabindex', '0');

            tab.addEventListener('click', () => switchView(tab.dataset.view));
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    switchView(tab.dataset.view);
                }
            });
        });
    }

    /**
     * Switch between views
     * @param {string} viewId - View identifier
     */
    function switchView(viewId) {
        // Update tabs
        document.querySelectorAll('.tab').forEach(tab => {
            const isActive = tab.dataset.view === viewId;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('hidden', view.id !== viewId);
        });

        // Store current view
        dataManager.setState('currentView', viewId);

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Announce to screen readers
        const viewNames = {
            'overview': 'Overview',
            'comparison': 'Model Comparison',
            'artifact': 'Artifact Deep Dive',
            'variance': 'Variance Analysis'
        };
        utils.announceToScreenReader(`Switched to ${viewNames[viewId] || viewId} view`);
    }

    // ==========================================================================
    // Overview View
    // ==========================================================================

    /**
     * Initialize overview view
     */
    function initOverview() {
        const artifacts = dataManager.getArtifacts();

        // Initialize charts
        charts.initAutomationMatrixChart(artifacts);
        charts.initTopValueChart(artifacts);
        charts.initApproachChart(artifacts);

        // Populate methodology table
        populateMethodologyTable();

        // Populate industry consensus table
        populateIndustryConsensusTable('High');

        // Initialize disruption readiness
        initDisruptionReadiness();

        // Set up chart instructions based on device
        updateChartInstructions();
    }

    /**
     * Update chart instructions based on device type
     */
    function updateChartInstructions() {
        const instructionsEl = document.getElementById('chartInstructions');
        if (instructionsEl) {
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            instructionsEl.textContent = isTouchDevice
                ? 'Pinch to zoom, drag to pan. Tap bubbles for details.'
                : 'Use mouse wheel to zoom, drag to pan. Click bubbles for details.';
        }
    }

    /**
     * Populate methodology table
     */
    function populateMethodologyTable() {
        const table = document.getElementById('methodologyTable');
        if (!table) return;

        const artifacts = dataManager.getArtifacts();
        const modelKeys = Object.keys(config.MODEL_COLORS);

        table.innerHTML = modelKeys.map(key => {
            const modelArtifacts = artifacts.filter(a => a.valuations[key] !== null);
            const topArtifact = modelArtifacts.sort((a, b) =>
                b.valuations[key] - a.valuations[key]
            )[0];

            return `
                <tr>
                    <td style="color: ${config.MODEL_COLORS[key]}; font-weight: 600;">
                        ${utils.escapeHtml(config.MODEL_NAMES[key])}
                    </td>
                    <td>${modelArtifacts.length > 0 ? 'Market-based' : 'N/A'}</td>
                    <td>${topArtifact ? utils.escapeHtml(topArtifact.name) : 'N/A'}</td>
                    <td>${topArtifact ? utils.formatCurrency(topArtifact.valuations[key]) : 'N/A'}</td>
                    <td><span class="tag tag--success">High</span></td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Populate industry consensus table
     * @param {string} readinessFilter - 'all', 'High', 'Medium', or 'Low'
     */
    function populateIndustryConsensusTable(readinessFilter = 'all') {
        const table = document.getElementById('industryConsensusTable');
        if (!table) return;

        const sectorStats = dataManager.getSectorStats();
        let industries = Object.entries(sectorStats).map(([sector, stats]) => {
            const marketInfo = config.INDUSTRY_MARKET_DATA[sector];
            const marketSize = marketInfo ? marketInfo.spend : 0;
            const readiness = stats.avgVariance < 3 ? 'High' :
                             stats.avgVariance < 10 ? 'Medium' : 'Low';

            // Find quick win (lowest variance artifact)
            const quickWin = stats.artifacts.sort((a, b) => a.variance_ratio - b.variance_ratio)[0];

            return {
                sector,
                readiness,
                marketSize,
                quickWin: quickWin?.name || 'N/A',
                quickWinId: quickWin?.id
            };
        });

        // Filter by readiness
        if (readinessFilter !== 'all') {
            industries = industries.filter(i => i.readiness === readinessFilter);
        }

        // Sort by market size
        industries.sort((a, b) => b.marketSize - a.marketSize);

        table.innerHTML = industries.map(i => `
            <tr>
                <td>
                    <span style="color: ${config.INDUSTRY_COLORS[i.sector] || '#888'}">
                        ${utils.escapeHtml(i.sector)}
                    </span>
                </td>
                <td>
                    <span class="tag tag--${i.readiness === 'High' ? 'success' : i.readiness === 'Medium' ? 'warning' : 'error'}">
                        ${i.readiness}
                    </span>
                </td>
                <td>${utils.formatCurrency(i.marketSize)}</td>
                <td>
                    ${i.quickWinId ? `
                        <a href="#" onclick="DashboardApp.navigateToArtifact('${utils.escapeAttr(i.quickWinId)}'); return false;" style="color: #4fc3f7; text-decoration: none;">
                            ${utils.escapeHtml(i.quickWin)}
                        </a>
                    ` : i.quickWin}
                </td>
            </tr>
        `).join('');

        // Update filter button states
        document.querySelectorAll('.readiness-filter-btn').forEach(btn => {
            const isActive = btn.dataset.filter === readinessFilter;
            btn.classList.toggle('active', isActive);
        });
    }

    /**
     * Initialize disruption readiness section
     */
    function initDisruptionReadiness() {
        showDisruptionIndustries(config.PAGINATION.DISRUPTION_INITIAL_COUNT);
    }

    /**
     * Show disruption industries
     * @param {number} count - Number to show
     */
    function showDisruptionIndustries(count) {
        const container = document.getElementById('disruptionReadinessContainer');
        if (!container) return;

        const sectorStats = dataManager.getSectorStats();
        const industries = Object.entries(sectorStats)
            .map(([sector, stats]) => ({
                sector,
                artifactCount: stats.count,
                avgVariance: stats.avgVariance,
                avgValue: stats.avgValue
            }))
            .sort((a, b) => a.avgVariance - b.avgVariance)
            .slice(0, count);

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
                ${industries.map(i => `
                    <div class="card" style="padding: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <strong style="color: ${config.INDUSTRY_COLORS[i.sector] || '#888'}">
                                ${utils.escapeHtml(i.sector)}
                            </strong>
                            <span class="tag tag--${i.avgVariance < 3 ? 'success' : i.avgVariance < 10 ? 'warning' : 'error'}">
                                ${i.avgVariance < 3 ? 'High' : i.avgVariance < 10 ? 'Medium' : 'Low'} Readiness
                            </span>
                        </div>
                        <div style="display: flex; gap: 20px; font-size: 0.85em; color: var(--text-secondary);">
                            <span>${i.artifactCount} artifacts</span>
                            <span>Avg: ${utils.formatCurrency(i.avgValue)}</span>
                            <span>${i.avgVariance.toFixed(1)}x variance</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Update count display
        const countEl = document.getElementById('disruptionIndustryCount');
        if (countEl) {
            countEl.textContent = `Showing ${Math.min(count, Object.keys(sectorStats).length)} of ${Object.keys(sectorStats).length} industries`;
        }

        // Update button visibility
        const btn = document.getElementById('disruptionSeeMoreBtn');
        if (btn) {
            btn.style.display = count >= Object.keys(sectorStats).length ? 'none' : 'inline-block';
        }

        dataManager.setState('disruptionIndustriesShown', count);
    }

    // ==========================================================================
    // Comparison View
    // ==========================================================================

    /**
     * Initialize comparison view
     */
    function initComparison() {
        const artifacts = dataManager.getArtifacts();

        // Initialize charts
        charts.initComparisonChart(artifacts, 0);
        charts.initSectorChart(artifacts);

        // Populate agreement zones
        populateAgreementZones();
        populateControversyZones();
        populateIndustryAgreement();

        // Populate model characteristics
        populateModelCharacteristics();

        // Initialize Top 25 table
        initTop25Table();
    }

    /**
     * Navigate to next comparison page
     */
    function nextComparisonPage() {
        const currentPage = dataManager.getState('comparisonPage');
        const artifacts = dataManager.getArtifacts();
        const totalPages = Math.ceil(artifacts.length / config.PAGINATION.COMPARISON_ITEMS_PER_PAGE);

        if (currentPage < totalPages - 1) {
            dataManager.setState('comparisonPage', currentPage + 1);
            charts.initComparisonChart(artifacts, currentPage + 1);
        }
    }

    /**
     * Navigate to previous comparison page
     */
    function prevComparisonPage() {
        const currentPage = dataManager.getState('comparisonPage');
        if (currentPage > 0) {
            dataManager.setState('comparisonPage', currentPage - 1);
            charts.initComparisonChart(dataManager.getArtifacts(), currentPage - 1);
        }
    }

    /**
     * Populate agreement zones list
     */
    function populateAgreementZones() {
        const list = document.getElementById('agreementZonesList');
        if (!list) return;

        const consensusArtifacts = dataManager.getConsensusArtifacts('all', 10);
        const expanded = dataManager.getState('agreementExpanded');
        const displayCount = expanded ? consensusArtifacts.length : 5;

        list.innerHTML = consensusArtifacts.slice(0, displayCount).map(a => `
            <li style="margin-bottom: 10px; padding: 8px; background: var(--bg-hover); border-radius: 6px; cursor: pointer;"
                onclick="DashboardApp.navigateToArtifact('${utils.escapeAttr(a.id)}')"
                tabindex="0"
                role="button"
                onkeydown="if(event.key==='Enter')DashboardApp.navigateToArtifact('${utils.escapeAttr(a.id)}')">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-primary);">${utils.escapeHtml(a.name)}</span>
                    <span class="tag tag--success">${a.modelCount} models</span>
                </div>
                <div style="font-size: 0.8em; color: var(--text-secondary); margin-top: 4px;">
                    Variance: ${a.variance_ratio.toFixed(2)}x
                </div>
            </li>
        `).join('');

        const btn = document.getElementById('expandAgreementBtn');
        if (btn) {
            btn.textContent = expanded ? 'Show Less ▲' : 'Show More ▼';
        }
    }

    /**
     * Toggle agreement zones expansion
     */
    function toggleAgreementZones() {
        const expanded = !dataManager.getState('agreementExpanded');
        dataManager.setState('agreementExpanded', expanded);
        populateAgreementZones();
    }

    /**
     * Populate controversy zones list
     */
    function populateControversyZones() {
        const list = document.getElementById('controversyZonesList');
        if (!list) return;

        const highVariance = dataManager.getHighVarianceArtifacts(10);
        const expanded = dataManager.getState('controversyExpanded');
        const displayCount = expanded ? highVariance.length : 5;

        list.innerHTML = highVariance.slice(0, displayCount).map(a => `
            <li style="margin-bottom: 10px; padding: 8px; background: var(--bg-hover); border-radius: 6px; cursor: pointer;"
                onclick="DashboardApp.navigateToArtifact('${utils.escapeAttr(a.id)}')"
                tabindex="0"
                role="button"
                onkeydown="if(event.key==='Enter')DashboardApp.navigateToArtifact('${utils.escapeAttr(a.id)}')">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-primary);">${utils.escapeHtml(a.name)}</span>
                    <span class="tag tag--error">${a.variance_ratio.toFixed(1)}x</span>
                </div>
            </li>
        `).join('');

        const btn = document.getElementById('expandControversyBtn');
        if (btn) {
            btn.textContent = expanded ? 'Show Less ▲' : 'Show More ▼';
        }
    }

    /**
     * Toggle controversy zones expansion
     */
    function toggleControversyZones() {
        const expanded = !dataManager.getState('controversyExpanded');
        dataManager.setState('controversyExpanded', expanded);
        populateControversyZones();
    }

    /**
     * Populate industry agreement list
     */
    function populateIndustryAgreement() {
        const list = document.getElementById('industryAgreementList');
        if (!list) return;

        const sectorStats = dataManager.getSectorStats();
        const industries = Object.entries(sectorStats)
            .map(([sector, stats]) => ({ sector, ...stats }))
            .sort((a, b) => a.avgVariance - b.avgVariance)
            .slice(0, 10);

        const expanded = dataManager.getState('industryAgreementExpanded');
        const displayCount = expanded ? industries.length : 5;

        list.innerHTML = industries.slice(0, displayCount).map(i => `
            <li style="margin-bottom: 10px; padding: 8px; background: var(--bg-hover); border-radius: 6px; cursor: pointer;"
                onclick="DashboardApp.filterByIndustry('${utils.escapeAttr(i.sector)}')"
                tabindex="0"
                role="button"
                onkeydown="if(event.key==='Enter')DashboardApp.filterByIndustry('${utils.escapeAttr(i.sector)}')">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: ${config.INDUSTRY_COLORS[i.sector] || '#888'}">
                        ${utils.escapeHtml(i.sector)}
                    </span>
                    <span style="color: var(--text-secondary);">${i.count} artifacts</span>
                </div>
                <div style="font-size: 0.8em; color: var(--text-secondary); margin-top: 4px;">
                    Avg variance: ${i.avgVariance.toFixed(2)}x
                </div>
            </li>
        `).join('');

        const btn = document.getElementById('expandIndustryBtn');
        if (btn) {
            btn.textContent = expanded ? 'Show Less ▲' : 'Show More ▼';
        }
    }

    /**
     * Toggle industry agreement expansion
     */
    function toggleIndustryAgreement() {
        const expanded = !dataManager.getState('industryAgreementExpanded');
        dataManager.setState('industryAgreementExpanded', expanded);
        populateIndustryAgreement();
    }

    /**
     * Populate model characteristics grid
     */
    function populateModelCharacteristics() {
        const grid = document.getElementById('modelCharacteristicsGrid');
        if (!grid) return;

        const artifacts = dataManager.getArtifacts();
        const modelKeys = Object.keys(config.MODEL_COLORS);

        grid.innerHTML = modelKeys.map(key => {
            const modelArtifacts = artifacts.filter(a => a.valuations[key] !== null);
            const coverage = (modelArtifacts.length / artifacts.length * 100).toFixed(0);

            return `
                <div class="card" style="padding: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <div style="width: 12px; height: 12px; border-radius: 3px; background: ${config.MODEL_COLORS[key]}"></div>
                        <strong>${utils.escapeHtml(config.MODEL_NAMES[key])}</strong>
                    </div>
                    <div style="font-size: 0.85em; color: var(--text-secondary);">
                        <div style="margin-bottom: 5px;">Coverage: ${coverage}%</div>
                        <div>Artifacts: ${modelArtifacts.length}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Initialize Top 25 table
     */
    function initTop25Table() {
        switchTop25Model('chatgpt5');
    }

    /**
     * Switch Top 25 model
     * @param {string} modelKey - Model key
     */
    function switchTop25Model(modelKey) {
        dataManager.setState('top25Model', modelKey);

        // Update button states
        document.querySelectorAll('.model-select-btn').forEach(btn => {
            const isActive = btn.dataset.model === modelKey;
            btn.classList.toggle('active', isActive);
            if (isActive) {
                btn.style.background = config.MODEL_COLORS[modelKey];
                btn.style.color = '#1a1a2e';
            } else {
                btn.style.background = 'transparent';
                btn.style.color = config.MODEL_COLORS[btn.dataset.model];
            }
        });

        // Update info panel
        const nameEl = document.getElementById('top25ModelName');
        const descEl = document.getElementById('top25ModelDesc');
        const infoPanel = document.getElementById('top25ModelInfo');

        if (nameEl) nameEl.textContent = config.MODEL_NAMES[modelKey];
        if (nameEl) nameEl.style.color = config.MODEL_COLORS[modelKey];
        if (descEl) descEl.textContent = `Showing top ${dataManager.getState('top25Count')} artifacts ranked by ${config.MODEL_NAMES[modelKey]}'s valuations`;
        if (infoPanel) {
            infoPanel.style.background = `rgba(${hexToRgb(config.MODEL_COLORS[modelKey])}, 0.1)`;
            infoPanel.style.borderLeftColor = config.MODEL_COLORS[modelKey];
        }

        // Populate table
        populateTop25Table(modelKey);
    }

    /**
     * Switch Top 25 count
     * @param {number} count - Number to show
     */
    function switchTop25Count(count) {
        dataManager.setState('top25Count', count);

        // Update button states
        document.querySelectorAll('.top-count-btn').forEach(btn => {
            const isActive = parseInt(btn.dataset.count) === count;
            btn.classList.toggle('active', isActive);
        });

        // Repopulate table
        populateTop25Table(dataManager.getState('top25Model'));
    }

    /**
     * Populate Top 25 table
     * @param {string} modelKey - Model key
     */
    function populateTop25Table(modelKey) {
        const tbody = document.getElementById('top25TableBody');
        if (!tbody) return;

        const count = dataManager.getState('top25Count');
        const topArtifacts = dataManager.getTopArtifactsByModel(modelKey, count);

        tbody.innerHTML = topArtifacts.map((artifact, index) => {
            const selectedValue = artifact.valuations[modelKey];
            const selectedColor = config.MODEL_COLORS[modelKey];

            // Build comparison bars
            const modelKeys = Object.keys(config.MODEL_COLORS);
            const maxValue = Math.max(...modelKeys.map(k => artifact.valuations[k] || 0));

            const barsHtml = modelKeys.map(mk => {
                const val = artifact.valuations[mk];
                const color = config.MODEL_COLORS[mk];
                const isSelected = mk === modelKey;

                if (val === null || val === undefined) {
                    return `<div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="${utils.escapeAttr(config.MODEL_NAMES[mk])}: No data">
                        <div style="width: 100%; height: 24px; background: #222; border-radius: 2px;"></div>
                        <span style="font-size: 0.6em; color: #555;">-</span>
                    </div>`;
                }

                const heightPercent = Math.max(5, (val / maxValue) * 100);
                return `<div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;" title="${utils.escapeAttr(config.MODEL_NAMES[mk])}: ${utils.formatCurrency(val)}">
                    <div style="width: 100%; height: 24px; background: #222; border-radius: 2px; display: flex; align-items: flex-end; ${isSelected ? 'box-shadow: 0 0 0 2px ' + color + ';' : ''}">
                        <div style="width: 100%; height: ${heightPercent}%; background: ${color}; border-radius: 2px; min-height: 3px;"></div>
                    </div>
                    <span style="font-size: 0.6em; color: ${color};">${utils.formatCurrencyShort(val)}</span>
                </div>`;
            }).join('');

            return `<tr style="cursor: pointer;" onclick="DashboardApp.navigateToArtifact('${utils.escapeAttr(artifact.id)}')" tabindex="0" onkeydown="if(event.key==='Enter')DashboardApp.navigateToArtifact('${utils.escapeAttr(artifact.id)}')">
                <td style="font-weight: bold; color: ${selectedColor};">${index + 1}</td>
                <td>
                    <span style="color: #4fc3f7; text-decoration: underline;">${utils.escapeHtml(artifact.name)}</span>
                </td>
                <td style="color: var(--text-secondary); font-size: 0.9em;">${utils.escapeHtml(artifact.sector)}</td>
                <td style="font-weight: bold; color: ${selectedColor};">${utils.formatCurrency(selectedValue)}</td>
                <td>
                    <div style="display: flex; gap: 4px; align-items: flex-end; padding: 5px 0;">
                        ${barsHtml}
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    // ==========================================================================
    // Artifact View
    // ==========================================================================

    /**
     * Initialize artifact view
     */
    function initArtifactView() {
        populateIndustryFilter();
        updateArtifactDropdown();
        populateConsensusView();

        // Set up artifact select handler
        const select = document.getElementById('artifactSelect');
        if (select) {
            select.addEventListener('change', handleArtifactSelection);
        }
    }

    /**
     * Populate industry filter dropdown
     */
    function populateIndustryFilter() {
        const select = document.getElementById('industryFilter');
        if (!select) return;

        const industries = dataManager.getUniqueIndustries();
        const artifacts = dataManager.getArtifacts();

        industries.forEach(industry => {
            const count = artifacts.filter(a => a.sector === industry).length;
            const option = document.createElement('option');
            option.value = industry;
            option.textContent = `${industry} (${count})`;
            select.appendChild(option);
        });
    }

    /**
     * Update artifact dropdown
     */
    function updateArtifactDropdown() {
        const select = document.getElementById('artifactSelect');
        if (!select) return;

        const currentValue = select.value;
        const filtered = dataManager.getFilteredArtifacts();
        const sorted = dataManager.getSortedArtifacts(filtered);

        select.innerHTML = '<option value="">Select an artifact to analyze...</option>';

        sorted.forEach(a => {
            const avgVal = utils.calculateAverageValue(a);
            const option = document.createElement('option');
            option.value = a.id;
            option.textContent = `${a.name} - ${utils.formatCurrency(avgVal)} avg`;
            select.appendChild(option);
        });

        // Restore selection if valid
        if (sorted.find(a => a.id === currentValue)) {
            select.value = currentValue;
        }

        // Update count label
        const countLabel = document.getElementById('artifactCountLabel');
        if (countLabel) {
            countLabel.textContent = `Showing ${sorted.length} artifacts`;
        }
    }

    /**
     * Handle artifact selection
     * @param {Event} e - Change event
     */
    function handleArtifactSelection(e) {
        const artifactId = e.target.value;
        const artifact = dataManager.getArtifactById(artifactId);

        const consensusView = document.getElementById('consensusDefaultView');
        const detailView = document.getElementById('artifactDetailView');
        const clearBtn = document.getElementById('clearArtifactBtn');
        const newsPanel = document.getElementById('newsPanel');

        if (!artifact) {
            // Show default view
            if (consensusView) consensusView.style.display = 'block';
            if (detailView) detailView.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'none';
            if (newsPanel) newsPanel.style.display = 'none';
            return;
        }

        // Show detail view
        if (consensusView) consensusView.style.display = 'none';
        if (detailView) detailView.style.display = 'block';
        if (clearBtn) clearBtn.style.display = 'inline-block';

        // Update chart
        charts.initArtifactValueChart(artifact);

        // Update details panel
        updateArtifactDetails(artifact);

        // Load news
        loadArtifactNews(artifact.id);

        utils.announceToScreenReader(`Viewing details for ${artifact.name}`);
    }

    /**
     * Update artifact details panel
     * @param {Object} artifact - Artifact data
     */
    function updateArtifactDetails(artifact) {
        const details = document.getElementById('artifactDetails');
        if (!details) return;

        const values = Object.entries(artifact.valuations).filter(([k, v]) => v !== null);
        const minVal = Math.min(...values.map(([k, v]) => v));
        const maxVal = Math.max(...values.map(([k, v]) => v));

        const varianceClass = utils.getVarianceClass(artifact.variance_ratio);

        details.innerHTML = `
            <div style="margin-bottom: 15px;">
                <strong>Sector:</strong>
                <a href="#" onclick="DashboardApp.filterByIndustry('${utils.escapeAttr(artifact.sector)}'); return false;"
                   style="color: ${config.INDUSTRY_COLORS[artifact.sector] || '#4285F4'}; text-decoration: underline; text-decoration-style: dotted;">
                    ${utils.escapeHtml(artifact.sector)}
                </a>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Variance Ratio:</strong>
                <span class="${varianceClass}">${artifact.variance_ratio.toFixed(2)}x</span>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Value Range:</strong> ${utils.formatCurrency(minVal)} - ${utils.formatCurrency(maxVal)}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Models with Data:</strong> ${values.length} / 8
            </div>
        `;
    }

    /**
     * Load artifact news
     * @param {string} artifactId - Artifact ID
     */
    async function loadArtifactNews(artifactId) {
        const newsPanel = document.getElementById('newsPanel');
        const newsResults = document.getElementById('newsResults');
        const newsCount = document.getElementById('newsCount');

        if (!newsPanel || !newsResults) return;

        newsPanel.style.display = 'block';
        utils.showLoading(newsResults, 'Loading news...');

        try {
            const results = await dataManager.getArtifactNews(artifactId);

            if (results.length === 0) {
                newsResults.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No news results available.</p>';
                if (newsCount) newsCount.textContent = '';
                return;
            }

            if (newsCount) newsCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;

            newsResults.innerHTML = results.map(result => `
                <div style="padding: 12px; border-radius: 8px; background: var(--bg-accent); border: 1px solid var(--border-hover);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
                        <a href="${utils.escapeAttr(result.url)}" target="_blank" rel="noopener noreferrer"
                           style="color: var(--text-primary); text-decoration: none; font-weight: 500; flex: 1; line-height: 1.4;">
                            ${utils.escapeHtml(result.title)}
                        </a>
                        <span style="color: var(--text-secondary); font-size: 0.75em; margin-left: 10px; white-space: nowrap;">
                            ${utils.escapeHtml(result.source)}
                        </span>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 0.85em; margin: 0; line-height: 1.5;">
                        ${utils.escapeHtml(result.snippet.substring(0, 200))}${result.snippet.length > 200 ? '...' : ''}
                    </p>
                </div>
            `).join('');
        } catch (error) {
            utils.showError(newsResults, 'Failed to load news');
        }
    }

    /**
     * Sort artifacts
     * @param {string} sortType - Sort type
     */
    function sortArtifacts(sortType) {
        dataManager.setState('currentArtifactSort', sortType);

        // Update button styles
        document.querySelectorAll('.artifact-sort-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sort === sortType);
        });

        updateArtifactDropdown();
    }

    /**
     * Filter by industry
     * @param {string} industry - Industry name or 'all'
     */
    function filterByIndustry(industry) {
        dataManager.setState('currentIndustryFilter', industry);

        // Update dropdown
        const select = document.getElementById('industryFilter');
        if (select) select.value = industry;

        updateArtifactDropdown();
        populateConsensusView(industry);

        // Switch to artifact view if not already there
        if (dataManager.getState('currentView') !== 'artifact') {
            switchView('artifact');
        }
    }

    /**
     * Filter by confidence
     * @param {string} confidence - 'all', 'high', 'medium', or 'lower'
     */
    function filterByConfidence(confidence) {
        dataManager.setState('currentConfidenceFilter', confidence);
        updateArtifactDropdown();
    }

    /**
     * Clear artifact selection
     */
    function clearArtifactSelection() {
        const select = document.getElementById('artifactSelect');
        if (select) {
            select.value = '';
            select.dispatchEvent(new Event('change'));
        }
    }

    /**
     * Reset artifact view
     */
    function resetArtifactView() {
        dataManager.setState('currentArtifactSort', 'alpha');
        dataManager.setState('currentIndustryFilter', 'all');
        dataManager.setState('currentConfidenceFilter', 'all');

        const industryFilter = document.getElementById('industryFilter');
        const confidenceFilter = document.getElementById('confidenceFilter');

        if (industryFilter) industryFilter.value = 'all';
        if (confidenceFilter) confidenceFilter.value = 'all';

        document.querySelectorAll('.artifact-sort-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sort === 'alpha');
        });

        updateArtifactDropdown();
        clearArtifactSelection();
    }

    /**
     * Populate consensus view
     * @param {string} industry - Industry filter
     */
    function populateConsensusView(industry = 'all') {
        const titleEl = document.getElementById('consensusTitle');
        const descEl = document.getElementById('consensusDescription');
        const table = document.getElementById('consensusTable');

        if (!table) return;

        if (titleEl) {
            titleEl.textContent = industry === 'all'
                ? 'Strongest Model Consensus'
                : `Strongest Model Consensus: ${industry}`;
        }

        if (descEl) {
            descEl.textContent = industry === 'all'
                ? 'These artifacts show the highest agreement across multiple AI models, indicating reliable valuation benchmarks.'
                : `These ${industry} artifacts show the highest agreement across multiple AI models.`;
        }

        const consensusArtifacts = dataManager.getConsensusArtifacts(industry, 15);

        table.innerHTML = consensusArtifacts.map(a => {
            const varianceClass = utils.getVarianceClass(a.variance_ratio);
            const clusterDesc = `~${utils.formatCurrency(Math.round(a.avgVal / 1000000) * 1000000)} range`;

            return `
                <tr style="cursor: pointer;" onclick="DashboardApp.navigateToArtifact('${utils.escapeAttr(a.id)}')" tabindex="0" onkeydown="if(event.key==='Enter')DashboardApp.navigateToArtifact('${utils.escapeAttr(a.id)}')">
                    <td>${utils.escapeHtml(a.name)}</td>
                    <td><span class="tag tag--success">${a.modelCount} models</span></td>
                    <td>${utils.formatCurrency(a.minVal)} - ${utils.formatCurrency(a.maxVal)}</td>
                    <td class="${varianceClass}">${a.variance_ratio.toFixed(2)}x</td>
                    <td><strong style="color: var(--color-success);">${clusterDesc}</strong></td>
                </tr>
            `;
        }).join('');

        if (consensusArtifacts.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 30px;">
                        No artifacts with 3+ model coverage found${industry !== 'all' ? ` in ${industry}` : ''}.
                    </td>
                </tr>
            `;
        }
    }

    // ==========================================================================
    // Variance View
    // ==========================================================================

    // Store current variance state
    let currentVarianceType = 'high';
    let currentVarianceSector = 'all';

    /**
     * Initialize variance view
     */
    function initVarianceView() {
        initVarianceSectorFilter();
        updateVarianceCounts();
        showHighVariance();
    }

    /**
     * Initialize the sector filter dropdown
     */
    function initVarianceSectorFilter() {
        const select = document.getElementById('varianceSectorFilter');
        if (!select) return;

        const sectors = dataManager.getVarianceSectors();

        // Clear existing options except "All Sectors"
        select.innerHTML = '<option value="all">All Sectors</option>';

        // Add sector options
        sectors.forEach(sector => {
            const option = document.createElement('option');
            option.value = sector;
            option.textContent = sector;
            select.appendChild(option);
        });
    }

    /**
     * Filter variance by sector
     */
    function filterVarianceBySector() {
        const select = document.getElementById('varianceSectorFilter');
        currentVarianceSector = select?.value || 'all';

        updateVarianceCounts();

        // Refresh current view with new filter
        if (currentVarianceType === 'high') {
            showHighVariance();
        } else if (currentVarianceType === 'mid') {
            showMidVariance();
        } else {
            showLowVariance();
        }
    }

    /**
     * Update variance tier counts in buttons
     */
    function updateVarianceCounts() {
        const counts = dataManager.getVarianceTierCounts(currentVarianceSector);

        const highCount = document.getElementById('highVarianceCount');
        const midCount = document.getElementById('midVarianceCount');
        const lowCount = document.getElementById('lowVarianceCount');

        if (highCount) highCount.textContent = counts.high;
        if (midCount) midCount.textContent = counts.mid;
        if (lowCount) lowCount.textContent = counts.low;
    }

    /**
     * Show high variance artifacts
     */
    function showHighVariance() {
        currentVarianceType = 'high';
        updateVarianceToggles('high');
        const artifacts = dataManager.getHighVarianceArtifacts(15, currentVarianceSector);
        charts.initVarianceChart(artifacts, 'high');
        populateVarianceTable(artifacts, 'high');

        document.getElementById('varianceTableTitle').textContent = 'Highest Variance Artifacts (>10x disagreement)';
    }

    /**
     * Show mid variance artifacts
     */
    function showMidVariance() {
        currentVarianceType = 'mid';
        updateVarianceToggles('mid');
        const artifacts = dataManager.getMidVarianceArtifacts(15, currentVarianceSector);
        charts.initVarianceChart(artifacts, 'mid');
        populateVarianceTable(artifacts, 'mid');

        document.getElementById('varianceTableTitle').textContent = 'Mid-Range Variance Artifacts (3x-10x disagreement)';
    }

    /**
     * Show low variance artifacts
     */
    function showLowVariance() {
        currentVarianceType = 'low';
        updateVarianceToggles('low');
        const artifacts = dataManager.getLowVarianceArtifacts(15, currentVarianceSector);
        charts.initVarianceChart(artifacts, 'low');
        populateVarianceTable(artifacts, 'low');

        document.getElementById('varianceTableTitle').textContent = 'Lowest Variance Artifacts (<3x strong consensus)';
    }

    /**
     * Update variance toggle button states
     * @param {string} activeType - 'high', 'mid', or 'low'
     */
    function updateVarianceToggles(activeType) {
        document.getElementById('highVarianceBtn')?.classList.toggle('active', activeType === 'high');
        document.getElementById('midVarianceBtn')?.classList.toggle('active', activeType === 'mid');
        document.getElementById('lowVarianceBtn')?.classList.toggle('active', activeType === 'low');
    }

    /**
     * Get variance tier badge HTML
     * @param {number} ratio - Variance ratio
     * @returns {string} Badge HTML
     */
    function getVarianceTierBadge(ratio) {
        if (ratio < 3) {
            return '<span class="tag tag--reliable">RELIABLE</span>';
        } else if (ratio <= 10) {
            return '<span class="tag tag--scope-dependent">SCOPE-DEPENDENT</span>';
        } else {
            return '<span class="tag tag--methodology-clash">METHODOLOGY CLASH</span>';
        }
    }

    /**
     * Populate variance table
     * @param {Array} artifacts - Artifact data
     * @param {string} varianceType - 'high', 'mid', or 'low'
     */
    function populateVarianceTable(artifacts, varianceType) {
        const table = document.getElementById('varianceTable');
        if (!table) return;

        table.innerHTML = artifacts.map(a => {
            const values = Object.entries(a.valuations).filter(([k, v]) => v !== null);
            if (values.length < 2) return '';

            const minEntry = values.reduce((min, curr) => curr[1] < min[1] ? curr : min);
            const maxEntry = values.reduce((max, curr) => curr[1] > max[1] ? curr : max);
            const varianceClass = utils.getVarianceClass(a.variance_ratio);
            const modelCount = values.length;

            // Get methodology tag and explanation
            const methodology = dataManager.getMethodologyTag(a);

            // Check for consensus (low variance + multiple models)
            const isConsensus = a.variance_ratio < 2 && modelCount >= 4;
            const rowClass = isConsensus ? 'consensus-row' : '';

            // Build explanation with methodology tag
            let explanation = '';
            if (varianceType === 'low') {
                explanation = `${modelCount} models agree within ${((a.variance_ratio - 1) * 100).toFixed(0)}%`;
            } else {
                explanation = `<span class="methodology-tag">${utils.escapeHtml(methodology.tag)}</span>${utils.escapeHtml(methodology.explanation)}`;
            }

            return `
                <tr class="${rowClass}">
                    <td>
                        <span onclick="DashboardApp.navigateToArtifact('${utils.escapeAttr(a.id)}')"
                              style="cursor: pointer; text-decoration: underline; text-decoration-style: dotted;"
                              tabindex="0"
                              onkeydown="if(event.key==='Enter')DashboardApp.navigateToArtifact('${utils.escapeAttr(a.id)}')">
                            ${utils.escapeHtml(a.name)}
                        </span>
                    </td>
                    <td>${getVarianceTierBadge(a.variance_ratio)}</td>
                    <td><span class="model-count">${modelCount}/8</span></td>
                    <td class="${varianceClass}">${a.variance_ratio.toFixed(2)}x</td>
                    <td>
                        <span style="color: ${config.MODEL_COLORS[minEntry[0]]}">${utils.formatCurrency(minEntry[1])}</span>
                        →
                        <span style="color: ${config.MODEL_COLORS[maxEntry[0]]}">${utils.formatCurrency(maxEntry[1])}</span>
                    </td>
                    <td>${explanation}</td>
                </tr>
            `;
        }).join('');
    }

    // ==========================================================================
    // Navigation
    // ==========================================================================

    /**
     * Navigate to artifact detail
     * @param {string} artifactId - Artifact ID
     */
    function navigateToArtifact(artifactId) {
        const sanitizedId = utils.sanitizeArtifactId(artifactId);
        if (!sanitizedId) return;

        // Switch to artifact view
        switchView('artifact');

        // Select artifact
        const select = document.getElementById('artifactSelect');
        if (select) {
            select.value = sanitizedId;
            select.dispatchEvent(new Event('change'));
        }
    }

    /**
     * Navigate to industry
     * @param {string} industry - Industry name
     */
    function navigateToIndustry(industry) {
        filterByIndustry(industry);
    }

    // ==========================================================================
    // Keyboard Navigation
    // ==========================================================================

    /**
     * Initialize keyboard navigation
     */
    function initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Tab switching with arrow keys when focused on tabs
            if (e.target.classList.contains('tab')) {
                const tabs = Array.from(document.querySelectorAll('.tab'));
                const currentIndex = tabs.indexOf(e.target);

                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % tabs.length;
                    tabs[nextIndex].focus();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                    tabs[prevIndex].focus();
                }
            }
        });
    }

    // ==========================================================================
    // Resize Handler
    // ==========================================================================

    /**
     * Initialize resize handler
     */
    function initResizeHandler() {
        const debouncedResize = utils.debounce(() => {
            updateChartInstructions();
            // Reinitialize charts that need responsive updates
            const currentView = dataManager.getState('currentView');
            if (currentView === 'variance') {
                // Redraw variance chart for responsive labels
                const highBtn = document.getElementById('highVarianceBtn');
                if (highBtn?.classList.contains('active')) {
                    showHighVariance();
                } else if (document.getElementById('midVarianceBtn')?.classList.contains('active')) {
                    showMidVariance();
                } else {
                    showLowVariance();
                }
            }
        }, 250);

        window.addEventListener('resize', debouncedResize);
    }

    // ==========================================================================
    // Utility
    // ==========================================================================

    /**
     * Convert hex color to RGB
     * @param {string} hex - Hex color
     * @returns {string} RGB values
     */
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '0, 0, 0';
    }

    // ==========================================================================
    // Global Functions (for onclick handlers in HTML)
    // ==========================================================================

    // Expose functions globally for inline handlers
    window.filterIndustryByReadiness = populateIndustryConsensusTable;
    window.showMoreDisruptionIndustries = () => {
        const current = dataManager.getState('disruptionIndustriesShown');
        showDisruptionIndustries(current + 6);
    };
    window.prevComparisonPage = prevComparisonPage;
    window.nextComparisonPage = nextComparisonPage;
    window.toggleAgreementZones = toggleAgreementZones;
    window.toggleControversyZones = toggleControversyZones;
    window.toggleIndustryAgreement = toggleIndustryAgreement;
    window.switchTop25Model = switchTop25Model;
    window.switchTop25Count = switchTop25Count;
    window.sortArtifacts = sortArtifacts;
    window.filterByIndustry = filterByIndustry;
    window.filterByConfidence = filterByConfidence;
    window.clearArtifactSelection = clearArtifactSelection;
    window.resetArtifactView = resetArtifactView;
    window.showHighVariance = showHighVariance;
    window.showMidVariance = showMidVariance;
    window.showLowVariance = showLowVariance;
    window.navigateToArtifact = navigateToArtifact;
    window.navigateToIndustry = navigateToIndustry;

    // ==========================================================================
    // Public API
    // ==========================================================================

    return Object.freeze({
        init,
        switchView,
        navigateToArtifact,
        navigateToIndustry,
        filterByIndustry,
        sortArtifacts,
        // Variance view functions
        showHighVariance,
        showMidVariance,
        showLowVariance,
        filterVarianceBySector
    });
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.DashboardApp.init();
});
