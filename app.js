// CALCULADORA FINANCIERA - LÓGICA PRINCIPAL

// === ESTADO DE LA APLICACIÓN ===
const state = {
    amount: '',
    interestRate: '',
    installments: 12,
    theme: 'light'
};

// === ELEMENTOS DEL DOM ===
const elements = {
    // Inputs
    amountInput: document.getElementById('amount'),
    interestRateInput: document.getElementById('interestRate'),
    installmentsInput: document.getElementById('installments'),
    installmentsValue: document.getElementById('installmentsValue'),

    // Mensajes de error
    amountError: document.getElementById('amount-error'),
    interestRateError: document.getElementById('interestRate-error'),
    installmentsError: document.getElementById('installments-error'),

    // Resultados
    monthlyPayment: document.getElementById('monthlyPayment'),
    totalPayment: document.getElementById('totalPayment'),
    totalInterest: document.getElementById('totalInterest'),
    infoMessage: document.getElementById('infoMessage'),
    resultsCard: document.getElementById('resultsCard'),

    // Botones
    resetBtn: document.getElementById('resetBtn'),
    themeToggle: document.getElementById('themeToggle'),

    // Formulario
    form: document.getElementById('calculatorForm')
};

// MOTOR DE CÁLCULO

/**
 * Calcula la cuota mensual usando el sistema de amortización francés (interés compuesto)
 * Fórmula: M = P × [r(1+r)^n] / [(1+r)^n - 1]
 * @param {number} principal - Monto del préstamo
 * @param {number} annualRate - Tasa de interés anual (%)
 * @param {number} months - Número de meses
 * @returns {number} Cuota mensual
 */
function calculateCompoundInterest(principal, annualRate, months) {
    // Si la tasa es 0, simplemente dividir el monto entre las cuotas
    if (annualRate === 0) {
        return principal / months;
    }

    // Convertir tasa anual a tasa mensual decimal
    const monthlyRate = (annualRate / 100) / 12;

    // Aplicar fórmula de amortización francesa
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;

    return principal * (numerator / denominator);
}

/**
 * Calcula la cuota mensual usando interés simple
 * Fórmula: Interés Total = P × r × t, Cuota = (P + Interés Total) / n
 * @param {number} principal - Monto del préstamo
 * @param {number} annualRate - Tasa de interés anual (%)
 * @param {number} months - Número de meses
 * @returns {number} Cuota mensual
 */
function calculateSimpleInterest(principal, annualRate, months) {
    // Calcular interés total sobre el monto original
    const totalInterest = principal * (annualRate / 100) * (months / 12);

    // Dividir el total (principal + interés) entre las cuotas
    return (principal + totalInterest) / months;
}

/**
 * Calcula todos los valores financieros usando el sistema francés (Chile)
 * @param {number} principal - Monto del préstamo
 * @param {number} annualRate - Tasa de interés anual (%)
 * @param {number} months - Número de meses
 * @returns {Object} Objeto con monthlyPayment, totalPayment, totalInterest
 */
function calculateLoan(principal, annualRate, months) {
    // Calcular usando sistema francés (cuotas fijas)
    const monthlyPayment = calculateCompoundInterest(principal, annualRate, months);

    // Calcular totales
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;

    return {
        monthlyPayment: Math.round(monthlyPayment * 100) / 100, // Redondear a 2 decimales
        totalPayment: Math.round(totalPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100
    };
}

// VALIDACIÓN DE INPUTS

/**
 * Valida que un valor sea un número válido
 * @param {string} value - Valor a validar
 * @returns {boolean} True si es válido
 */
function isValidNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
}

/**
 * Valida que un valor sea positivo
 * @param {string} value - Valor a validar
 * @returns {boolean} True si es positivo
 */
function isPositive(value) {
    return parseFloat(value) > 0;
}

/**
 * Valida el campo de monto
 * @param {string} value - Valor del input
 * @returns {Object} { valid: boolean, message: string }
 */
function validateAmount(value) {
    if (!value || value.trim() === '') {
        return { valid: false, message: 'El monto es obligatorio' };
    }

    if (!isValidNumber(value)) {
        return { valid: false, message: 'Ingresa un monto válido (solo números)' };
    }

    if (!isPositive(value)) {
        return { valid: false, message: 'El monto debe ser mayor a cero' };
    }

    if (parseFloat(value) > 999999999) {
        return { valid: false, message: 'El monto es demasiado grande' };
    }

    return { valid: true, message: '' };
}

/**
 * Valida el campo de tasa de interés
 * @param {string} value - Valor del input
 * @returns {Object} { valid: boolean, message: string }
 */
function validateInterestRate(value) {
    if (!value || value.trim() === '') {
        return { valid: false, message: 'La tasa de interés es obligatoria' };
    }

    if (!isValidNumber(value)) {
        return { valid: false, message: 'Ingresa una tasa válida (solo números)' };
    }

    const rate = parseFloat(value);

    if (rate < 0) {
        return { valid: false, message: 'La tasa no puede ser negativa' };
    }

    if (rate > 100) {
        return { valid: false, message: 'La tasa no puede ser mayor a 100%' };
    }

    return { valid: true, message: '' };
}

/**
 * Muestra u oculta un mensaje de error
 * @param {HTMLElement} errorElement - Elemento del mensaje de error
 * @param {HTMLElement} inputElement - Elemento del input
 * @param {string} message - Mensaje a mostrar
 * @param {boolean} show - Mostrar u ocultar
 */
function toggleError(errorElement, inputElement, message, show) {
    if (show) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        inputElement.classList.add('error');
    } else {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
        inputElement.classList.remove('error');
    }
}

/**
 * Valida todos los campos del formulario
 * @returns {boolean} True si todos los campos son válidos
 */
function validateForm() {
    let isValid = true;

    // Validar monto
    const amountValidation = validateAmount(state.amount);
    toggleError(
        elements.amountError,
        elements.amountInput,
        amountValidation.message,
        !amountValidation.valid
    );
    if (!amountValidation.valid) isValid = false;

    // Validar tasa de interés
    const rateValidation = validateInterestRate(state.interestRate);
    toggleError(
        elements.interestRateError,
        elements.interestRateInput,
        rateValidation.message,
        !rateValidation.valid
    );
    if (!rateValidation.valid) isValid = false;

    return isValid;
}

// UTILIDADES

/**
 * Formatea un número como moneda (con separador de miles)
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

/**
 * Parsea un valor de input eliminando caracteres no numéricos
 * @param {string} value - Valor del input
 * @returns {string} Valor limpio
 */
function parseInputValue(value) {
    // Eliminar todo excepto números, puntos y comas
    return value.replace(/[^\d.,]/g, '').replace(',', '.');
}

// RENDERIZADO Y ACTUALIZACIÓN DEL DOM

/**
 * Actualiza la visualización de los resultados
 * @param {Object} results - Objeto con los resultados del cálculo
 */
function updateResults(results) {
    // Actualizar valores con animación
    elements.monthlyPayment.textContent = formatCurrency(results.monthlyPayment);
    elements.totalPayment.textContent = formatCurrency(results.totalPayment);
    elements.totalInterest.textContent = formatCurrency(results.totalInterest);

    // Actualizar mensaje informativo
    elements.infoMessage.textContent = `Cálculo con sistema de cuotas fijas a ${state.installments} meses`;

    // Forzar re-renderizado para activar animaciones
    elements.resultsCard.style.animation = 'none';
    setTimeout(() => {
        elements.resultsCard.style.animation = '';
    }, 10);
}

/**
 * Resetea los resultados a valores iniciales
 */
function resetResults() {
    elements.monthlyPayment.textContent = '$0';
    elements.totalPayment.textContent = '$0';
    elements.totalInterest.textContent = '$0';
    elements.infoMessage.textContent = 'Ingresa los datos para calcular tus cuotas';
}

/**
 * Calcula y actualiza los resultados en tiempo real
 */
function calculate() {
    // Validar formulario
    if (!validateForm()) {
        resetResults();
        return;
    }

    // Obtener valores
    const principal = parseFloat(state.amount);
    const annualRate = parseFloat(state.interestRate);
    const months = parseInt(state.installments);

    // Calcular usando sistema francés
    const results = calculateLoan(principal, annualRate, months);

    // Actualizar UI
    updateResults(results);
}

// MANEJO DE EVENTOS

/**
 * Maneja el cambio en el input de monto
 */
function handleAmountChange(e) {
    const cleanValue = parseInputValue(e.target.value);
    state.amount = cleanValue;
    e.target.value = cleanValue;
    calculate();
}

/**
 * Maneja el cambio en el input de tasa de interés
 */
function handleInterestRateChange(e) {
    const cleanValue = parseInputValue(e.target.value);
    state.interestRate = cleanValue;
    e.target.value = cleanValue;
    calculate();
}

/**
 * Maneja el cambio en el slider de cuotas
 */
function handleInstallmentsChange(e) {
    state.installments = parseInt(e.target.value);
    elements.installmentsValue.textContent = state.installments;
    calculate();
}

/**
 * Resetea el formulario a valores iniciales
 */
function handleReset() {
    // Resetear estado
    state.amount = '';
    state.interestRate = '';
    state.installments = 12;

    // Resetear inputs
    elements.amountInput.value = '';
    elements.interestRateInput.value = '';
    elements.installmentsInput.value = 12;
    elements.installmentsValue.textContent = '12';

    // Limpiar errores
    toggleError(elements.amountError, elements.amountInput, '', false);
    toggleError(elements.interestRateError, elements.interestRateInput, '', false);

    // Resetear resultados
    resetResults();
}

/**
 * Alterna entre tema claro y oscuro
 */
function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);

    // Guardar preferencia en localStorage
    localStorage.setItem('theme', state.theme);
}

/**
 * Carga el tema guardado del localStorage
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        state.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

// INICIALIZACIÓN

/**
 * Registra todos los event listeners
 */
function attachEventListeners() {
    // Inputs de texto
    elements.amountInput.addEventListener('input', handleAmountChange);
    elements.interestRateInput.addEventListener('input', handleInterestRateChange);

    // Slider de cuotas
    elements.installmentsInput.addEventListener('input', handleInstallmentsChange);

    // Botón de reset
    elements.resetBtn.addEventListener('click', handleReset);

    // Toggle de tema
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Prevenir submit del formulario
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
    });
}

/**
 * Inicializa la aplicación
 */
function init() {
    // Cargar tema guardado
    loadTheme();

    // Registrar event listeners
    attachEventListeners();

    // Mostrar mensaje inicial
    resetResults();

    console.log('Calculadora Financiera inicializada correctamente');
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
