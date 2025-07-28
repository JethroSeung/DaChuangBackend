/**
 * Performance Optimization Module
 * Handles caching, lazy loading, and performance monitoring
 */

class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.defaultCacheDuration = 5 * 60 * 1000; // 5 minutes
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupCacheCleanup();
        this.monitorPerformance();
    }

    /**
     * Cache management with expiry
     */
    setCache(key, data, duration = this.defaultCacheDuration) {
        this.cache.set(key, data);
        this.cacheExpiry.set(key, Date.now() + duration);
    }

    getCache(key) {
        if (!this.cache.has(key)) return null;
        
        const expiry = this.cacheExpiry.get(key);
        if (Date.now() > expiry) {
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
            return null;
        }
        
        return this.cache.get(key);
    }

    clearCache(key = null) {
        if (key) {
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
        } else {
            this.cache.clear();
            this.cacheExpiry.clear();
        }
    }

    /**
     * Enhanced fetch with caching
     */
    async cachedFetch(url, options = {}, cacheDuration = this.defaultCacheDuration) {
        const cacheKey = `fetch_${url}_${JSON.stringify(options)}`;
        
        // Check cache first
        const cached = this.getCache(cacheKey);
        if (cached && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
            return cached;
        }

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            
            // Cache successful GET requests
            if (response.ok && (!options.method || options.method === 'GET')) {
                this.setCache(cacheKey, data, cacheDuration);
            }
            
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    /**
     * Lazy loading for images and content
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    /**
     * Image optimization
     */
    setupImageOptimization() {
        // Add loading="lazy" to images that don't have it
        document.querySelectorAll('img:not([loading])').forEach(img => {
            img.loading = 'lazy';
        });

        // Preload critical images
        const criticalImages = document.querySelectorAll('img[data-critical]');
        criticalImages.forEach(img => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = img.src || img.dataset.src;
            document.head.appendChild(link);
        });
    }

    /**
     * Debounce function for performance
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    /**
     * Throttle function for performance
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Cleanup expired cache entries
     */
    setupCacheCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, expiry] of this.cacheExpiry.entries()) {
                if (now > expiry) {
                    this.cache.delete(key);
                    this.cacheExpiry.delete(key);
                }
            }
        }, 60000); // Clean up every minute
    }

    /**
     * Performance monitoring
     */
    monitorPerformance() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Performance:', {
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                    totalTime: perfData.loadEventEnd - perfData.fetchStart
                });
            }
        });

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            console.warn('Long task detected:', entry.duration + 'ms');
                        }
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long task API not supported
            }
        }
    }

    /**
     * Optimize table rendering for large datasets
     */
    optimizeTableRendering(tableSelector, rowsPerPage = 50) {
        const table = document.querySelector(tableSelector);
        if (!table) return;

        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        if (rows.length <= rowsPerPage) return;

        let currentPage = 0;
        const totalPages = Math.ceil(rows.length / rowsPerPage);

        const showPage = (page) => {
            rows.forEach((row, index) => {
                const shouldShow = index >= page * rowsPerPage && index < (page + 1) * rowsPerPage;
                row.style.display = shouldShow ? '' : 'none';
            });
        };

        const createPagination = () => {
            const paginationContainer = document.createElement('div');
            paginationContainer.className = 'table-pagination';
            
            const prevBtn = document.createElement('button');
            prevBtn.textContent = 'Previous';
            prevBtn.disabled = currentPage === 0;
            prevBtn.addEventListener('click', () => {
                if (currentPage > 0) {
                    currentPage--;
                    showPage(currentPage);
                    updatePagination();
                }
            });

            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next';
            nextBtn.disabled = currentPage === totalPages - 1;
            nextBtn.addEventListener('click', () => {
                if (currentPage < totalPages - 1) {
                    currentPage++;
                    showPage(currentPage);
                    updatePagination();
                }
            });

            const pageInfo = document.createElement('span');
            pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;

            const updatePagination = () => {
                prevBtn.disabled = currentPage === 0;
                nextBtn.disabled = currentPage === totalPages - 1;
                pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
            };

            paginationContainer.appendChild(prevBtn);
            paginationContainer.appendChild(pageInfo);
            paginationContainer.appendChild(nextBtn);
            
            table.parentNode.insertBefore(paginationContainer, table.nextSibling);
        };

        showPage(0);
        createPagination();
    }

    /**
     * Preload critical resources
     */
    preloadCriticalResources() {
        const criticalResources = [
            '/api/uav/all',
            '/api/hibernate-pod/status'
        ];

        criticalResources.forEach(url => {
            this.cachedFetch(url).catch(() => {
                // Silently fail for preloading
            });
        });
    }

    /**
     * Memory usage monitoring
     */
    monitorMemoryUsage() {
        if ('memory' in performance) {
            const logMemory = () => {
                const memory = performance.memory;
                console.log('Memory Usage:', {
                    used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
                    total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
                    limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
                });
            };

            // Log memory usage every 30 seconds in development
            if (window.location.hostname === 'localhost') {
                setInterval(logMemory, 30000);
            }
        }
    }
}

// Initialize performance optimizer
const performanceOptimizer = new PerformanceOptimizer();

// Export for use in other modules
window.PerformanceOptimizer = performanceOptimizer;
