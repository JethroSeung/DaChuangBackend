/**
 * UAV Docking Management System - Frontend JavaScript
 * Enhanced interactivity and user experience
 */

class UAVManagementApp {
    constructor() {
        this.performanceOptimizer = window.PerformanceOptimizer;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.setupFormValidation();
        this.setupTableEnhancements();
    }

    setupEventListeners() {
        // Form submission with loading states
        document.addEventListener('submit', this.handleFormSubmit.bind(this));

        // Action buttons with confirmation
        document.addEventListener('click', this.handleActionClick.bind(this));

        // Real-time form validation
        document.addEventListener('input', this.handleInputValidation.bind(this));

        // Modal handling
        document.addEventListener('click', this.handleModalClick.bind(this));

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));

        // Focus management for accessibility
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
        document.addEventListener('focusout', this.handleFocusOut.bind(this));
    }

    initializeComponents() {
        // Add loading indicators
        this.createLoadingIndicators();
        
        // Initialize tooltips
        this.initializeTooltips();
        
        // Setup auto-refresh for hibernate pod status
        this.setupAutoRefresh();
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[required], select[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        });
    }

    setupTableEnhancements() {
        // Enhanced table row interactions
        const tableRows = document.querySelectorAll('tbody tr');
        tableRows.forEach(row => {
            row.addEventListener('mouseenter', this.handleRowHover.bind(this));
            row.addEventListener('mouseleave', this.handleRowLeave.bind(this));
        });

        // Add sorting capabilities
        this.setupTableSorting();

        // Add search functionality
        this.setupTableSearch();

        // Optimize table rendering for large datasets
        if (this.performanceOptimizer) {
            this.performanceOptimizer.optimizeTableRendering('table', 25);
        }
    }

    handleFormSubmit(event) {
        const form = event.target;
        if (!this.validateForm(form)) {
            event.preventDefault();
            return false;
        }

        // Add loading state
        this.setLoadingState(form, true);
        
        // Show success message after form submission
        setTimeout(() => {
            this.showMessage('UAV operation completed successfully!', 'success');
        }, 1000);
    }

    handleActionClick(event) {
        const target = event.target.closest('a');
        if (!target) return;

        // Handle delete actions with confirmation
        if (target.href && target.href.includes('/delete/')) {
            event.preventDefault();
            this.showConfirmationModal(
                'Delete UAV',
                'Are you sure you want to delete this UAV? This action cannot be undone.',
                () => {
                    this.deleteUAV(target.href);
                }
            );
        }

        // Handle status toggle with confirmation
        if (target.href && target.href.includes('/update-status/')) {
            event.preventDefault();
            this.showConfirmationModal(
                'Toggle UAV Status',
                'Are you sure you want to change the authorization status of this UAV?',
                () => {
                    this.updateUAVStatus(target.href);
                }
            );
        }

        // Handle region removal with AJAX
        if (target.href && target.href.includes('/remove-region/')) {
            event.preventDefault();
            this.showConfirmationModal(
                'Remove Region',
                'Are you sure you want to remove this region from the UAV?',
                () => {
                    this.removeRegionFromUAV(target.href);
                }
            );
        }
    }

    handleInputValidation(event) {
        const input = event.target;
        if (input.hasAttribute('required')) {
            this.validateField(input);
        }
    }

    handleModalClick(event) {
        if (event.target.classList.contains('modal')) {
            this.closeModal(event.target);
        }
        if (event.target.classList.contains('close')) {
            this.closeModal(event.target.closest('.modal'));
        }
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    async validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        this.clearFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            errorMessage = 'This field is required';
            isValid = false;
        }

        // RFID tag validation
        if (field.name === 'rfidTag' && value) {
            if (value.length < 3) {
                errorMessage = 'RFID tag must be at least 3 characters long';
                isValid = false;
            } else if (!/^[A-Za-z0-9-_]+$/.test(value)) {
                errorMessage = 'RFID tag should only contain letters, numbers, hyphens, and underscores';
                isValid = false;
            } else {
                // Check RFID uniqueness
                const isUnique = await this.validateRfidUniqueness(value);
                if (!isUnique) {
                    errorMessage = 'This RFID tag is already in use';
                    isValid = false;
                }
            }
        }

        // Owner name validation
        if (field.name === 'ownerName' && value) {
            if (!/^[a-zA-Z\s]+$/.test(value)) {
                errorMessage = 'Owner name should only contain letters and spaces';
                isValid = false;
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            // Show success indicator for valid fields
            field.classList.add('success');
            setTimeout(() => {
                field.classList.remove('success');
            }, 2000);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    setLoadingState(element, loading) {
        if (loading) {
            element.classList.add('loading');
            const submitBtn = element.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.textContent;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            }
        } else {
            element.classList.remove('loading');
            const submitBtn = element.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = submitBtn.dataset.originalText || submitBtn.textContent;
            }
        }
    }

    showMessage(text, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const icon = this.getMessageIcon(type);
        messageDiv.innerHTML = `<i class="${icon}"></i> ${text}`;
        
        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    getMessageIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    showConfirmationModal(title, message, onConfirm) {
        const modal = this.createModal(title, message, [
            { text: 'Cancel', class: 'btn-secondary', action: 'close' },
            { text: 'Confirm', class: 'btn-danger', action: onConfirm }
        ]);
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${content}</p>
                </div>
                <div class="modal-footer">
                    ${buttons.map(btn => 
                        `<button class="action-btn ${btn.class}" data-action="${btn.action}">${btn.text}</button>`
                    ).join('')}
                </div>
            </div>
        `;

        // Add button event listeners
        modal.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-action')) {
                const action = e.target.getAttribute('data-action');
                if (action === 'close') {
                    this.closeModal(modal);
                } else if (typeof action === 'function') {
                    action();
                    this.closeModal(modal);
                }
            }
        });

        return modal;
    }

    closeModal(modal) {
        modal.style.display = 'none';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    createLoadingIndicators() {
        // Add loading indicators to action buttons
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.href || btn.href.includes('#')) return;
                this.setLoadingState(btn, true);
            });
        });
    }

    initializeTooltips() {
        // Add tooltips to action buttons
        const tooltips = {
            'btn-toggle': 'Toggle authorization status',
            'btn-delete': 'Delete this UAV',
            'btn-add': 'Add region to UAV',
            'btn-remove': 'Remove region from UAV'
        };

        Object.keys(tooltips).forEach(className => {
            const elements = document.querySelectorAll(`.${className}`);
            elements.forEach(el => {
                el.title = tooltips[className];
            });
        });
    }

    setupAutoRefresh() {
        // Auto-refresh hibernate pod status every 30 seconds
        setInterval(() => {
            this.refreshHibernatePodStatus();
        }, 30000);

        // Initial refresh
        this.refreshHibernatePodStatus();
    }

    setupTableSorting() {
        const headers = document.querySelectorAll('th.sortable');
        headers.forEach((header, index) => {
            header.addEventListener('click', () => this.sortTable(header));
        });
    }

    setupTableSearch() {
        const searchInput = document.getElementById('tableSearch');
        if (searchInput) {
            // Use debounced search for better performance
            const debouncedFilter = this.performanceOptimizer ?
                this.performanceOptimizer.debounce((value) => this.filterTable(value), 300) :
                (value) => this.filterTable(value);

            searchInput.addEventListener('input', (e) => {
                debouncedFilter(e.target.value);
            });
        }
    }

    filterTable(searchTerm) {
        const table = document.querySelector('table tbody');
        const rows = table.querySelectorAll('tr');
        const term = searchTerm.toLowerCase();
        let visibleCount = 0;

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            let rowText = '';

            // Combine text from relevant columns (skip actions column)
            for (let i = 0; i < cells.length - 1; i++) {
                rowText += cells[i].textContent.toLowerCase() + ' ';
            }

            if (rowText.includes(term)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Update count
        const countElement = document.getElementById('tableCount');
        if (countElement) {
            const totalCount = rows.length;
            countElement.textContent = searchTerm ?
                `Showing ${visibleCount} of ${totalCount} UAVs` :
                `Total: ${totalCount} UAVs`;
        }
    }

    sortTable(header) {
        const table = document.querySelector('table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const columnIndex = Array.from(header.parentNode.children).indexOf(header);

        // Clear previous sort indicators
        document.querySelectorAll('th.sortable').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });

        const isAscending = !header.classList.contains('sort-asc');

        rows.sort((a, b) => {
            let aText = a.cells[columnIndex].textContent.trim();
            let bText = b.cells[columnIndex].textContent.trim();

            // Handle numeric columns
            if (header.dataset.column === 'id') {
                aText = parseInt(aText) || 0;
                bText = parseInt(bText) || 0;
            }

            // Handle date columns
            if (header.dataset.column === 'createdAt' || header.dataset.column === 'updatedAt') {
                aText = new Date(aText);
                bText = new Date(bText);
            }

            if (isAscending) {
                return aText > bText ? 1 : aText < bText ? -1 : 0;
            } else {
                return aText < bText ? 1 : aText > bText ? -1 : 0;
            }
        });

        // Update sort indicator
        header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');

        rows.forEach(row => tbody.appendChild(row));
    }

    handleRowHover(event) {
        const row = event.currentTarget;
        row.style.transform = 'scale(1.01)';
        row.style.transition = 'transform 0.2s ease';
        row.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
    }

    handleRowLeave(event) {
        const row = event.currentTarget;
        row.style.transform = 'scale(1)';
        row.style.backgroundColor = '';
    }

    async updateUAVStatus(url) {
        try {
            // Extract UAV ID from URL
            const uavId = url.match(/\/update-status\/(\d+)/)[1];

            this.showMessage('Updating UAV status...', 'info');

            const response = await fetch(`/api/uav/${uavId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage(`UAV status updated from ${result.oldStatus} to ${result.newStatus}`, 'success');
                // Update the UI without page refresh
                this.updateStatusInTable(uavId, result.newStatus);
            } else {
                this.showMessage(result.message || 'Failed to update UAV status', 'error');
            }

        } catch (error) {
            console.error('Error updating UAV status:', error);
            this.showMessage('Failed to update UAV status. Please try again.', 'error');
        }
    }

    updateStatusInTable(uavId, newStatus) {
        // Find the table row for this UAV and update the status
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const idCell = row.cells[0];
            if (idCell && idCell.textContent.trim() === uavId) {
                const statusCell = row.cells[4]; // Status column
                if (statusCell) {
                    const statusSpan = statusCell.querySelector('.status-pill');
                    if (statusSpan) {
                        statusSpan.textContent = newStatus;
                        statusSpan.className = `status-pill ${newStatus.toLowerCase()}`;
                    }
                }
            }
        });
    }

    async deleteUAV(url) {
        try {
            // Extract UAV ID from URL
            const uavId = url.match(/\/delete\/(\d+)/)[1];

            this.showMessage('Deleting UAV...', 'info');

            const response = await fetch(`/api/uav/${uavId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('UAV deleted successfully', 'success');
                // Remove the row from the table
                this.removeRowFromTable(uavId);
                // Update the UAV count
                this.updateUAVCount();
            } else {
                this.showMessage(result.message || 'Failed to delete UAV', 'error');
            }

        } catch (error) {
            console.error('Error deleting UAV:', error);
            this.showMessage('Failed to delete UAV. Please try again.', 'error');
        }
    }

    removeRowFromTable(uavId) {
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const idCell = row.cells[0];
            if (idCell && idCell.textContent.trim() === uavId) {
                row.remove();
            }
        });
    }

    updateUAVCount() {
        const countElement = document.getElementById('tableCount');
        const rows = document.querySelectorAll('tbody tr');
        if (countElement) {
            countElement.textContent = `Total: ${rows.length} UAVs`;
        }

        // Update status dashboard
        const statusValue = document.querySelector('.status-card .status-value');
        if (statusValue) {
            statusValue.textContent = rows.length;
        }
    }

    async removeRegionFromUAV(url) {
        try {
            // Extract UAV ID and Region ID from URL
            const matches = url.match(/\/uav\/(\d+)\/remove-region\/(\d+)/);
            if (!matches) return;

            const uavId = matches[1];
            const regionId = matches[2];

            this.showMessage('Removing region from UAV...', 'info');

            const response = await fetch(`/api/uav/${uavId}/regions/${regionId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('Region removed from UAV successfully', 'success');
                // Refresh the page to update the regions display
                // In a more advanced implementation, we could update just the regions cell
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                this.showMessage(result.message || 'Failed to remove region from UAV', 'error');
            }

        } catch (error) {
            console.error('Error removing region from UAV:', error);
            this.showMessage('Failed to remove region from UAV. Please try again.', 'error');
        }
    }

    async validateRfidUniqueness(rfidTag) {
        if (!rfidTag || rfidTag.length < 3) return true; // Skip validation for short tags

        try {
            const response = await fetch(`/api/uav/validate-rfid/${encodeURIComponent(rfidTag)}`);
            const result = await response.json();

            return result.isUnique;
        } catch (error) {
            console.error('Error validating RFID tag:', error);
            return true; // Allow submission if validation fails
        }
    }

    async refreshHibernatePodStatus() {
        try {
            const status = this.performanceOptimizer ?
                await this.performanceOptimizer.cachedFetch('/api/hibernate-pod/status', {}, 30000) :
                await fetch('/api/hibernate-pod/status').then(r => r.json());

            // Update status dashboard
            const statusCards = document.querySelectorAll('.status-card');
            statusCards.forEach(card => {
                const title = card.querySelector('h3');
                if (title && title.textContent.includes('Hibernate Pod')) {
                    const valueElement = card.querySelector('.status-value');
                    const labelElement = card.querySelector('.status-label');

                    if (valueElement) {
                        valueElement.textContent = `${status.currentCapacity} / ${status.maxCapacity}`;
                    }

                    if (labelElement) {
                        labelElement.textContent = status.isFull ? 'Full' : 'Available';
                        labelElement.className = `status-label ${status.isFull ? 'full' : 'available'}`;
                    }
                }
            });

        } catch (error) {
            console.error('Error refreshing hibernate pod status:', error);
        }
    }

    handleKeyboardNavigation(event) {
        // ESC key closes modals
        if (event.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="block"]');
            if (openModal) {
                this.closeModal(openModal);
            }
        }

        // Enter key on action buttons
        if (event.key === 'Enter' && event.target.classList.contains('action-btn')) {
            event.target.click();
        }

        // Tab navigation enhancement
        if (event.key === 'Tab') {
            this.handleTabNavigation(event);
        }
    }

    handleTabNavigation(event) {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const focusableArray = Array.from(focusableElements);
        const currentIndex = focusableArray.indexOf(document.activeElement);

        if (event.shiftKey) {
            // Shift + Tab (backward)
            if (currentIndex === 0) {
                event.preventDefault();
                focusableArray[focusableArray.length - 1].focus();
            }
        } else {
            // Tab (forward)
            if (currentIndex === focusableArray.length - 1) {
                event.preventDefault();
                focusableArray[0].focus();
            }
        }
    }

    handleFocusIn(event) {
        // Add focus indicator for better accessibility
        if (event.target.matches('button, a, input, select')) {
            event.target.classList.add('focused');
        }
    }

    handleFocusOut(event) {
        // Remove focus indicator
        event.target.classList.remove('focused');
    }

    // Accessibility: Announce changes to screen readers
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Enhanced error handling with user-friendly messages
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);

        let userMessage = 'An unexpected error occurred. Please try again.';

        if (error.name === 'NetworkError' || error.message.includes('fetch')) {
            userMessage = 'Network error. Please check your connection and try again.';
        } else if (error.status === 404) {
            userMessage = 'The requested resource was not found.';
        } else if (error.status === 403) {
            userMessage = 'You do not have permission to perform this action.';
        } else if (error.status >= 500) {
            userMessage = 'Server error. Please try again later.';
        }

        this.showMessage(userMessage, 'error');
        this.announceToScreenReader(userMessage);
    }

    // Hibernate Pod Management Functions
    async addToHibernatePod(uavId) {
        try {
            const response = await fetch('/api/hibernate-pod/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `uavId=${uavId}`
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage(result.message, 'success');
                this.refreshHibernatePodStatus();
                this.refreshTable();
            } else {
                this.showMessage(result.message, 'error');
            }

            return result;
        } catch (error) {
            this.handleError(error, 'adding UAV to hibernate pod');
            return { success: false, message: 'Failed to add UAV to hibernate pod' };
        }
    }

    async removeFromHibernatePod(uavId) {
        try {
            const response = await fetch('/api/hibernate-pod/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `uavId=${uavId}`
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage(result.message, 'success');
                this.refreshHibernatePodStatus();
                this.refreshTable();
            } else {
                this.showMessage(result.message, 'error');
            }

            return result;
        } catch (error) {
            this.handleError(error, 'removing UAV from hibernate pod');
            return { success: false, message: 'Failed to remove UAV from hibernate pod' };
        }
    }

    async getSystemStatistics() {
        try {
            const response = await fetch('/api/uav/statistics');
            const stats = await response.json();
            return stats;
        } catch (error) {
            this.handleError(error, 'fetching system statistics');
            return null;
        }
    }

    // Enhanced table refresh with loading indicator
    async refreshTable() {
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
            tableContainer.classList.add('loading');
        }

        try {
            // Refresh the page to get updated data
            // In a more sophisticated implementation, we would update the table dynamically
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            this.handleError(error, 'refreshing table');
            if (tableContainer) {
                tableContainer.classList.remove('loading');
            }
        }
    }

    // Add loading states to buttons
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || button.innerHTML;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UAVManagementApp();
});
