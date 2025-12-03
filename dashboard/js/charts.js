/**
 * AI Opportunity Index Dashboard - Chart Management
 * Handles Chart.js instances with proper memory management
 */

window.DashboardCharts = (function() {
    'use strict';

    const config = window.DashboardConfig;
    const utils = window.DashboardUtils;
    const data = window.DashboardData;

    // ==========================================================================
    // Chart Instance Registry (prevents memory leaks)
    // ==========================================================================

    const chartRegistry = new Map();

    /**
     * Register a chart instance
     * @param {string} id - Chart identifier
     * @param {Chart} chart - Chart.js instance
     */
    function registerChart(id, chart) {
        // Destroy existing chart with same ID
        destroyChart(id);
        chartRegistry.set(id, chart);
    }

    /**
     * Destroy a chart instance
     * @param {string} id - Chart identifier
     */
    function destroyChart(id) {
        const existingChart = chartRegistry.get(id);
        if (existingChart) {
            existingChart.destroy();
            chartRegistry.delete(id);
        }
    }

    /**
     * Destroy all chart instances
     */
    function destroyAllCharts() {
        chartRegistry.forEach((chart, id) => {
            chart.destroy();
        });
        chartRegistry.clear();
    }

    /**
     * Get a chart instance
     * @param {string} id - Chart identifier
     * @returns {Chart|undefined}
     */
    function getChart(id) {
        return chartRegistry.get(id);
    }

    // ==========================================================================
    // Chart Creation Helpers
    // ==========================================================================

    /**
     * Get default chart options
     * @returns {Object}
     */
    function getDefaultOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: config.CHART.ANIMATION_DURATION
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#a0a0a0'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.95)',
                    titleColor: '#eaeaea',
                    bodyColor: '#a0a0a0',
                    borderColor: '#0f3460',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12
                }
            },
            scales: {
                x: {
                    ticks: { color: '#a0a0a0' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                y: {
                    ticks: { color: '#a0a0a0' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        };
    }

    /**
     * Create a chart with safe registration
     * @param {string} id - Chart identifier
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} chartConfig - Chart.js configuration
     * @returns {Chart}
     */
    function createChart(id, canvas, chartConfig) {
        if (!canvas) {
            console.error(`Canvas not found for chart: ${id}`);
            return null;
        }

        const chart = new Chart(canvas, chartConfig);
        registerChart(id, chart);
        return chart;
    }

    // ==========================================================================
    // Overview Charts
    // ==========================================================================

    /**
     * Initialize the automation matrix bubble chart
     * @param {Array} artifacts - Artifact data
     */
    function initAutomationMatrixChart(artifacts) {
        const canvas = document.getElementById('automationMatrixChart');
        if (!canvas) return;

        const sectorStats = data.getSectorStats();
        const industryData = [];

        for (const [sector, stats] of Object.entries(sectorStats)) {
            const marketInfo = config.INDUSTRY_MARKET_DATA[sector];
            const marketSize = marketInfo ? marketInfo.spend / 1000000000 : 1;

            industryData.push({
                label: sector,
                x: 100 - (stats.avgVariance * 5), // Lower variance = higher feasibility
                y: stats.count,
                r: Math.min(Math.max(marketSize / 5, 5), 40), // Scale bubble size
                backgroundColor: config.INDUSTRY_COLORS[sector] || '#666',
                marketSize: marketSize
            });
        }

        const chartConfig = {
            type: 'bubble',
            data: {
                datasets: industryData.map(d => ({
                    label: d.label,
                    data: [{ x: d.x, y: d.y, r: d.r }],
                    backgroundColor: d.backgroundColor + '80',
                    borderColor: d.backgroundColor,
                    borderWidth: 2
                }))
            },
            options: {
                ...getDefaultOptions(),
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const d = industryData[context.datasetIndex];
                                return [
                                    d.label,
                                    `Artifacts: ${d.y}`,
                                    `Market: $${d.marketSize.toFixed(0)}B`,
                                    `Feasibility: ${d.x.toFixed(0)}%`
                                ];
                            }
                        }
                    },
                    zoom: {
                        pan: { enabled: true, mode: 'xy' },
                        zoom: {
                            wheel: { enabled: true },
                            pinch: { enabled: true },
                            mode: 'xy'
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Automation Feasibility (%)',
                            color: '#a0a0a0'
                        },
                        min: 0,
                        max: 100,
                        ticks: { color: '#a0a0a0' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Number of Artifacts',
                            color: '#a0a0a0'
                        },
                        ticks: { color: '#a0a0a0' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        };

        const chart = createChart('bubbleChart', canvas, chartConfig);
        window.bubbleChart = chart; // For zoom controls
    }

    /**
     * Initialize the top value by model chart
     * @param {Array} artifacts - Artifact data
     */
    function initTopValueChart(artifacts) {
        const canvas = document.getElementById('topValueChart');
        if (!canvas) return;

        const modelKeys = Object.keys(config.MODEL_COLORS);
        const topValues = modelKeys.map(key => {
            const modelArtifacts = artifacts.filter(a => a.valuations[key] !== null);
            if (modelArtifacts.length === 0) return 0;
            return Math.max(...modelArtifacts.map(a => a.valuations[key]));
        });

        const chartConfig = {
            type: 'bar',
            data: {
                labels: modelKeys.map(k => config.MODEL_NAMES[k]),
                datasets: [{
                    data: topValues,
                    backgroundColor: modelKeys.map(k => config.MODEL_COLORS[k])
                }]
            },
            options: {
                ...getDefaultOptions(),
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => utils.formatCurrency(ctx.raw)
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#a0a0a0',
                            callback: v => utils.formatCurrency(v)
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        ticks: { color: '#a0a0a0' },
                        grid: { display: false }
                    }
                }
            }
        };

        createChart('topValueChart', canvas, chartConfig);
    }

    /**
     * Initialize the valuation approach distribution chart
     * @param {Array} artifacts - Artifact data
     */
    function initApproachChart(artifacts) {
        const canvas = document.getElementById('approachChart');
        if (!canvas) return;

        // Count artifacts by variance category
        const high = artifacts.filter(a => a.variance_ratio > 10).length;
        const medium = artifacts.filter(a => a.variance_ratio > 3 && a.variance_ratio <= 10).length;
        const low = artifacts.filter(a => a.variance_ratio <= 3).length;

        const chartConfig = {
            type: 'doughnut',
            data: {
                labels: ['High Variance (>10x)', 'Medium (3-10x)', 'Low (<3x)'],
                datasets: [{
                    data: [high, medium, low],
                    backgroundColor: ['#FF6B6B', '#F9844A', '#81B29A'],
                    borderWidth: 0
                }]
            },
            options: {
                ...getDefaultOptions(),
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#a0a0a0' }
                    }
                }
            }
        };

        createChart('approachChart', canvas, chartConfig);
    }

    // ==========================================================================
    // Comparison Charts
    // ==========================================================================

    /**
     * Initialize the comparison chart with pagination
     * @param {Array} artifacts - Artifact data
     * @param {number} page - Current page
     */
    function initComparisonChart(artifacts, page = 0) {
        const canvas = document.getElementById('comparisonChart');
        if (!canvas) return;

        const itemsPerPage = config.PAGINATION.COMPARISON_ITEMS_PER_PAGE;
        const sortedArtifacts = [...artifacts]
            .filter(a => Object.values(a.valuations).some(v => v !== null))
            .sort((a, b) => utils.calculateAverageValue(b) - utils.calculateAverageValue(a));

        const totalPages = Math.ceil(sortedArtifacts.length / itemsPerPage);
        const pageArtifacts = sortedArtifacts.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

        const modelKeys = Object.keys(config.MODEL_COLORS);
        const datasets = modelKeys.map(key => ({
            label: config.MODEL_NAMES[key],
            data: pageArtifacts.map(a => a.valuations[key] || null),
            backgroundColor: config.MODEL_COLORS[key],
            borderColor: config.MODEL_COLORS[key],
            borderWidth: 1
        }));

        const chartConfig = {
            type: 'bar',
            data: {
                labels: pageArtifacts.map(a => {
                    const maxLen = window.innerWidth < 768 ? 15 : 25;
                    return a.name.length > maxLen ? a.name.substring(0, maxLen - 2) + '...' : a.name;
                }),
                datasets
            },
            options: {
                ...getDefaultOptions(),
                scales: {
                    x: {
                        ticks: {
                            color: '#a0a0a0',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: { display: false }
                    },
                    y: {
                        type: 'logarithmic',
                        ticks: {
                            color: '#a0a0a0',
                            callback: v => utils.formatCurrency(v)
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: '#a0a0a0', usePointStyle: true }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${utils.formatCurrency(ctx.raw)}`
                        }
                    }
                },
                onClick: function(event, elements) {
                    if (elements.length > 0) {
                        const idx = elements[0].index;
                        const artifact = pageArtifacts[idx];
                        if (artifact) {
                            window.DashboardApp?.navigateToArtifact(artifact.id);
                        }
                    }
                }
            }
        };

        createChart('comparisonChart', canvas, chartConfig);

        // Update pagination UI
        updateComparisonPagination(page, totalPages);
    }

    /**
     * Update comparison pagination UI
     * @param {number} currentPage - Current page index
     * @param {number} totalPages - Total number of pages
     */
    function updateComparisonPagination(currentPage, totalPages) {
        const pageInfo = document.getElementById('comparisonPageInfo');
        const prevBtn = document.getElementById('comparisonPrevBtn');
        const nextBtn = document.getElementById('comparisonNextBtn');
        const dotsContainer = document.getElementById('comparisonPageDots');

        if (pageInfo) {
            pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
        }

        if (prevBtn) {
            prevBtn.disabled = currentPage === 0;
            prevBtn.style.opacity = currentPage === 0 ? '0.5' : '1';
        }

        if (nextBtn) {
            nextBtn.disabled = currentPage >= totalPages - 1;
            nextBtn.style.opacity = currentPage >= totalPages - 1 ? '0.5' : '1';
        }

        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalPages; i++) {
                const dot = utils.createElement('button', {
                    className: `pagination-dot ${i === currentPage ? 'active' : ''}`,
                    'aria-label': `Go to page ${i + 1}`,
                    onclick: () => {
                        data.setState('comparisonPage', i);
                        initComparisonChart(data.getArtifacts(), i);
                    }
                });
                dotsContainer.appendChild(dot);
            }
        }
    }

    /**
     * Initialize the sector chart
     * @param {Array} artifacts - Artifact data
     */
    function initSectorChart(artifacts) {
        const canvas = document.getElementById('sectorChart');
        if (!canvas) return;

        const sectorStats = data.getSectorStats();
        const sortedSectors = Object.entries(sectorStats)
            .sort((a, b) => b[1].avgValue - a[1].avgValue)
            .slice(0, 10);

        const chartConfig = {
            type: 'bar',
            data: {
                labels: sortedSectors.map(([sector]) => sector),
                datasets: [{
                    data: sortedSectors.map(([, stats]) => stats.avgValue),
                    backgroundColor: sortedSectors.map(([sector]) =>
                        config.INDUSTRY_COLORS[sector] || '#666'
                    )
                }]
            },
            options: {
                ...getDefaultOptions(),
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `Avg: ${utils.formatCurrency(ctx.raw)}`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#a0a0a0',
                            callback: v => utils.formatCurrency(v)
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        ticks: { color: '#a0a0a0' },
                        grid: { display: false }
                    }
                }
            }
        };

        createChart('sectorChart', canvas, chartConfig);
    }

    // ==========================================================================
    // Artifact Detail Chart
    // ==========================================================================

    /**
     * Initialize the artifact value chart
     * @param {Object} artifact - Artifact data
     */
    function initArtifactValueChart(artifact) {
        const canvas = document.getElementById('artifactValueChart');
        if (!canvas || !artifact) return;

        const values = Object.entries(artifact.valuations)
            .filter(([k, v]) => v !== null)
            .map(([k, v]) => ({
                model: config.MODEL_NAMES[k],
                value: v,
                color: config.MODEL_COLORS[k]
            }));

        const chartConfig = {
            type: 'bar',
            data: {
                labels: values.map(v => v.model),
                datasets: [{
                    data: values.map(v => v.value),
                    backgroundColor: values.map(v => v.color)
                }]
            },
            options: {
                ...getDefaultOptions(),
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => utils.formatCurrency(ctx.raw)
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#a0a0a0',
                            callback: v => utils.formatCurrency(v)
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        ticks: { color: '#a0a0a0' },
                        grid: { display: false }
                    }
                }
            }
        };

        createChart('artifactValueChart', canvas, chartConfig);
    }

    // ==========================================================================
    // Variance Charts
    // ==========================================================================

    /**
     * Initialize the variance chart
     * @param {Array} artifacts - Artifact data
     * @param {string} varianceType - 'high', 'mid', or 'low'
     */
    function initVarianceChart(artifacts, varianceType = 'high') {
        const canvas = document.getElementById('varianceChart');
        if (!canvas) return;

        const isMobile = window.innerWidth < 768;
        const maxLabelLength = isMobile ? config.CHART.MAX_LABEL_LENGTH_MOBILE : config.CHART.MAX_LABEL_LENGTH;

        // Get min and max values for each artifact
        const chartData = artifacts.map(a => {
            const values = Object.entries(a.valuations).filter(([k, v]) => v !== null);
            const minVal = Math.min(...values.map(([k, v]) => v));
            const maxVal = Math.max(...values.map(([k, v]) => v));
            const minModel = values.find(([k, v]) => v === minVal)[0];
            const maxModel = values.find(([k, v]) => v === maxVal)[0];
            return {
                id: a.id,
                name: a.name,
                min: minVal,
                max: maxVal,
                ratio: a.variance_ratio,
                minModel,
                maxModel
            };
        });

        // Store for click handling
        window.varianceChartData = chartData;

        const truncatedLabels = chartData.map(d =>
            d.name.length > maxLabelLength ? d.name.substring(0, maxLabelLength - 2) + '...' : d.name
        );

        const chartConfig = {
            type: 'bar',
            data: {
                labels: truncatedLabels,
                datasets: [{
                    label: 'Value Range',
                    data: chartData.map(d => [d.min, d.max]),
                    backgroundColor: chartData.map(d =>
                        d.ratio > 10 ? 'rgba(255, 107, 107, 0.7)' :
                        d.ratio > 3 ? 'rgba(249, 132, 74, 0.7)' : 'rgba(129, 178, 154, 0.7)'
                    ),
                    borderColor: chartData.map(d =>
                        d.ratio > 10 ? '#FF6B6B' :
                        d.ratio > 3 ? '#F9844A' : '#81B29A'
                    ),
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                ...getDefaultOptions(),
                indexAxis: 'y',
                onClick: function(event, elements) {
                    if (elements.length > 0) {
                        const idx = elements[0].index;
                        const artifact = window.varianceChartData[idx];
                        if (artifact?.id) {
                            window.DashboardApp?.navigateToArtifact(artifact.id);
                        }
                    }
                },
                onHover: function(event, elements) {
                    event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const idx = context.dataIndex;
                                const d = chartData[idx];
                                const minBias = config.MODEL_BIAS?.[d.minModel];
                                const maxBias = config.MODEL_BIAS?.[d.maxModel];

                                const lines = [
                                    `Range: ${utils.formatCurrency(d.min)} - ${utils.formatCurrency(d.max)}`,
                                    `Low: ${config.MODEL_NAMES[d.minModel]}${minBias && minBias.direction !== 'neutral' ? ' (' + minBias.label + ')' : ''}`,
                                    `High: ${config.MODEL_NAMES[d.maxModel]}${maxBias && maxBias.direction !== 'neutral' ? ' (' + maxBias.label + ')' : ''}`,
                                    `Variance: ${d.ratio.toFixed(2)}x`
                                ];

                                // Add bias warning for extreme models
                                if ((minBias && minBias.percentage > 50) || (maxBias && maxBias.percentage > 50)) {
                                    lines.push('⚠️ Extreme model bias detected');
                                }

                                lines.push('(Click to view details)');
                                return lines;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'logarithmic',
                        title: {
                            display: true,
                            text: isMobile ? 'Value (USD)' : 'Value Range (USD, log scale)',
                            color: '#a0a0a0',
                            font: { size: isMobile ? 10 : 12 }
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: { size: isMobile ? 9 : 11 },
                            maxTicksLimit: isMobile ? 5 : 10,
                            callback: function(value) {
                                if (value >= 1000000000) return '$' + (value / 1000000000) + 'B';
                                if (value >= 1000000) return '$' + (value / 1000000) + 'M';
                                if (value >= 1000) return '$' + (value / 1000) + 'K';
                                return '$' + value;
                            }
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        ticks: {
                            color: '#a0a0a0',
                            font: { size: isMobile ? 9 : 11 }
                        },
                        grid: { display: false }
                    }
                }
            }
        };

        createChart('varianceChart', canvas, chartConfig);

        // Update chart title
        const titles = {
            'high': 'Highest Variance: Value Range Comparison (>10x)',
            'mid': 'Mid-Range Variance: Value Range Comparison (3x-10x)',
            'low': 'Lowest Variance: Value Range Comparison (<3x)'
        };
        const titleEl = document.getElementById('varianceChartTitle');
        if (titleEl) {
            titleEl.textContent = titles[varianceType] || titles['high'];
        }
    }

    // ==========================================================================
    // Public API
    // ==========================================================================

    return Object.freeze({
        // Registry management
        registerChart,
        destroyChart,
        destroyAllCharts,
        getChart,

        // Chart creation
        createChart,
        getDefaultOptions,

        // Overview charts
        initAutomationMatrixChart,
        initTopValueChart,
        initApproachChart,

        // Comparison charts
        initComparisonChart,
        initSectorChart,

        // Artifact charts
        initArtifactValueChart,

        // Variance charts
        initVarianceChart
    });
})();
