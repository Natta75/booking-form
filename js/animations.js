// Управление визуальными состояниями полей

function addErrorState(fieldId) {
    const formGroup = document.getElementById(fieldId).closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('success');
        formGroup.classList.add('error');
    }
}

function addSuccessState(fieldId) {
    const formGroup = document.getElementById(fieldId).closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
    }
}

function removeAllStates(fieldId) {
    const formGroup = document.getElementById(fieldId).closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error', 'success');
    }
}

function showErrorMessage(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function hideErrorMessage(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

function scrollToFirstError() {
    const firstError = document.querySelector('.form-group.error');
    if (firstError) {
        firstError.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

function setButtonLoadingState(isLoading) {
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        if (isLoading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }
}
