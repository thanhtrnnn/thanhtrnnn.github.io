/**
 * Student Class - Represents the data model
 */
class Student {
    constructor(id, name, dob, className, gpa) {
        this.id = id;
        this.name = name;
        this.dob = dob;
        this.className = className;
        this.gpa = parseFloat(gpa);
    }

    /**
     * Method to update student information
     * @param {Object} newData
     */
    update(newData) {
        if (newData.name) this.name = newData.name;
        if (newData.dob) this.dob = newData.dob;
        if (newData.className) this.className = newData.className;
        if (newData.gpa) this.gpa = parseFloat(newData.gpa);
    }

    // Helper to format date for display (DD/MM/YYYY)
    get formattedDob() {
        if (!this.dob) return 'N/A';
        const date = new Date(this.dob);
        return new Intl.DateTimeFormat('vi-VN').format(date);
    }
}

/**
 * Application Manager - Handles state and UI logic
 */
class AppManager {
    constructor() {
        this.students = [];
        this.currentEditId = null; // Track if we are editing or adding

        // DOM Elements
        this.tableBody = document.getElementById('student-list-body');
        this.emptyState = document.getElementById('empty-state');
        this.totalEl = document.getElementById('total-students');
        this.avgGpaEl = document.getElementById('avg-gpa');
        this.modal = document.getElementById('modal-overlay');
        this.form = document.getElementById('student-form');
        this.modalTitle = document.getElementById('modal-title');

        this.initEventListeners();
        this.render();
    }

    initEventListeners() {
        // Modal toggles
        document.getElementById('btn-add-manual').addEventListener('click', () => this.openModal());
        document.getElementById('btn-close-modal').addEventListener('click', () => this.closeModal());

        // Form Submit
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // File Import
        const fileInput = document.getElementById('file-input');
        document.getElementById('btn-import').addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => this.render(e.target.value));

        // Table Actions (Delegation)
        this.tableBody.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.dataset.id;

            if (btn.classList.contains('edit-btn')) this.openModal(id);
            if (btn.classList.contains('delete-btn')) this.deleteStudent(id);
        });
    }

    /**
     * Open Modal for Add or Edit
     */
    openModal(id = null) {
        this.modal.classList.remove('hidden');
        this.form.reset();

        if (id) {
            // Edit Mode
            this.currentEditId = id;
            const student = this.students.find(s => s.id === id);
            if (student) {
                this.modalTitle.textContent = `EDIT_ENTRY // ${id}`;
                document.getElementById('inp-id').value = student.id;
                document.getElementById('inp-id').disabled = true; // Cannot change ID
                document.getElementById('inp-name').value = student.name;
                document.getElementById('inp-dob').value = student.dob;
                document.getElementById('inp-class').value = student.className;
                document.getElementById('inp-gpa').value = student.gpa;
            }
        } else {
            // Add Mode
            this.currentEditId = null;
            this.modalTitle.textContent = "NEW_ENTRY //";
            document.getElementById('inp-id').disabled = false;
        }
    }

    closeModal() {
        this.modal.classList.add('hidden');
    }

    /**
     * Handle Form Submission (Add/Update)
     */
    handleFormSubmit(e) {
        e.preventDefault();

        const data = {
            id: document.getElementById('inp-id').value,
            name: document.getElementById('inp-name').value,
            dob: document.getElementById('inp-dob').value,
            className: document.getElementById('inp-class').value,
            gpa: document.getElementById('inp-gpa').value
        };

        if (this.currentEditId) {
            // Update existing
            const student = this.students.find(s => s.id === this.currentEditId);
            if (student) student.update(data);
        } else {
            // Add new
            if (this.students.some(s => s.id === data.id)) {
                alert('ERROR: Student ID already exists.');
                return;
            }
            const newStudent = new Student(data.id, data.name, data.dob, data.className, data.gpa);
            this.students.push(newStudent);
        }

        this.closeModal();
        this.render();
    }

    deleteStudent(id) {
        if (confirm(`CONFIRM DELETION: ${id}?`)) {
            this.students = this.students.filter(s => s.id !== id);
            this.render();
        }
    }

    /**
     * Handle Excel/CSV Import using SheetJS
     */
    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Remove header row if it exists and process
            if (jsonData.length > 1) {
                // Assumption: Order is ID, Name, DOB, Class, GPA
                // Skipping row 0 (headers)
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (row.length >= 5) {
                        // Basic Date parsing (assuming YYYY-MM-DD or standard format)
                        // If Excel date number, needs conversion, but relying on string for simple csv/xlsx
                        const student = new Student(row[0], row[1], row[2], row[3], row[4]);
                        // Avoid duplicates on import
                        if (!this.students.some(s => s.id == student.id)) {
                            this.students.push(student);
                        }
                    }
                }
                this.render();
            }
        };
        reader.readAsArrayBuffer(file);
        // Reset input
        e.target.value = '';
    }

    /**
     * Render the table and stats
     */
    render(searchQuery = '') {
        this.tableBody.innerHTML = '';

        let filtered = this.students;
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            filtered = this.students.filter(s =>
                s.name.toLowerCase().includes(lowerQ) ||
                s.id.toLowerCase().includes(lowerQ)
            );
        }

        if (filtered.length === 0) {
            this.emptyState.style.display = 'block';
        } else {
            this.emptyState.style.display = 'none';
            filtered.forEach(s => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="font-mono">${s.id}</td>
                    <td>${s.name}</td>
                    <td>${s.formattedDob}</td>
                    <td>${s.className}</td>
                    <td style="color: ${this.getGpaColor(s.gpa)}">${s.gpa.toFixed(2)}</td>
                    <td>
                        <button class="action-icon edit-btn" data-id="${s.id}" title="Edit">
                            <i class="ri-edit-2-line"></i>
                        </button>
                        <button class="action-icon delete-btn" data-id="${s.id}" title="Delete">
                            <i class="ri-delete-bin-2-line"></i>
                        </button>
                    </td>
                `;
                this.tableBody.appendChild(tr);
            });
        }

        this.updateStats();
    }

    updateStats() {
        this.totalEl.textContent = this.students.length.toString().padStart(3, '0');

        if (this.students.length === 0) {
            this.avgGpaEl.textContent = "0.0";
            return;
        }

        const sum = this.students.reduce((acc, s) => acc + s.gpa, 0);
        const avg = sum / this.students.length;
        this.avgGpaEl.textContent = avg.toFixed(2);
    }

    getGpaColor(gpa) {
        if (gpa >= 3.6) return 'var(--accent-primary)';
        if (gpa >= 2.5) return 'var(--accent-secondary)';
        return 'var(--accent-danger)';
    }
}

// Initialize
const app = new AppManager();
