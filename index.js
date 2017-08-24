
const SUBMIT_BUTTON = 'submitButton';
const RESULT_CONTAINER = 'resultContainer';
const ACTIONS = ['success', 'error', 'progress'];
const MAX_PHONE_NUMBER_SUM = 30;
const ERROR_CLASSNAME = 'error';

class YaForm {
    constructor(formId) {
        this.form = document.forms[formId];
        this.resultContainer = document.getElementById(RESULT_CONTAINER);
        this.validation = {
            fio: /^(([а-яА-Яa-zA-Z]+)\s){2}([а-яА-Яa-zA-Z]+)$/,
            email: /^[a-zA-Z0-9_]+@(ya\.ru|yandex\.(ru|ua|by|kz|com))$/,
            phone: /^\+7\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}$/
        };
        this.timeout = null;
        this.submit = this.submit.bind(this);
    }

    validate() {
        const data = this.getData();
        const errorFields = [];
        Object.keys(data).map((item) => {
            const inputValue = data[item];
            if (this.validation.hasOwnProperty(item)) {
                if (!this.validation[item].test(inputValue)) {
                    errorFields.push(item);
                }
                if (inputValue === 'phone') {
                    const phoneSum = inputValue
                                    .replace(/\D/g, '')
                                    .split('')
                                    .reduce((prev, cur) => parseInt(cur, 10) + prev);
                    if (phoneSum > MAX_PHONE_NUMBER_SUM) {
                        errorFields.push(item);
                    }
                }
            }
        });
        if (errorFields.length === 0) {
            this.form.elements[SUBMIT_BUTTON].disabled = true;
        }
        return {
            isValid: errorFields.length === 0,
            errorFields: errorFields
        };
    }

    getData() {
        const inputs = this.form.getElementsByTagName('input');
        const data = {};
        Array.from(inputs).map(({ name, value }) => {
            data[name] = value;
        });
        return data;
    }

    setData(data) {
        if (data) {
            Object.keys(data).map((inputName) => {
                const input = this._getInput(inputName);
                if (input) {
                    input.value = data[inputName];
                }
            });
        } else {
            console.warn('Data should be provided for setData() method');
        }
    }

    submit(evt = null) {
        if (evt) {
            evt.preventDefault();
        }

        this._clearForm();

        if (!this.validate().isValid) {
            this._markErrorFields();
            return;
        }

        this._sendData()
            .then((response) => {
                this._handleResponse(response);
            })
            .catch((error) => console.error(error));
    }

    _getInput(name) {
        return this.form.querySelector(`[name="${name}"]`);
    }

    _markErrorFields() {
        const validate = this.validate();
        validate.errorFields.map((inputName) => {
            const input = this._getInput(inputName);
            if (input) {
                input.classList.add(ERROR_CLASSNAME);
            }
        });
    }

    _markResultContainer(status) {
        this.resultContainer.className = '';
        this.resultContainer.classList.add(status);
    }

    _clearForm() {
        const inputs = this.form.getElementsByTagName('input');
        Array.from(inputs).map((input) => input.classList.remove(ERROR_CLASSNAME));
        this.resultContainer.classList.remove('success', 'progress', ERROR_CLASSNAME);
        this.resultContainer.textContent = '';
    }

    _getAction() {
        return ACTIONS[Math.floor(Math.random() * (ACTIONS.length - 0)) + 0];
    }

    _handleResponse(res) {
        const status = res.status;
        this._markResultContainer(status);
        switch (status) {
            case 'success':
                this._handleSuccess();
                break;
            case ERROR_CLASSNAME:
                this._handleError(res.reason);
                break;
            case 'progress':
                this._handleProgress(res.timeout);
                break;
            default:
                console.info(`❗️ Unknown response: ${status}`);
        }
    }

    _clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    _handleSuccess() {
        this.resultContainer.innerHTML = '<h2>Success</h2>';
    }

    _handleError(text) {
        this.resultContainer.innerHTML = `<h2>${text}</h2>`;
    }

    _handleProgress(timeout) {
        this.resultContainer.innerHTML = '<h2>Progress...</h2>';
        this.timeout = setTimeout(this.submit, timeout);
    }

    _sendData() {
        const action = this.form.action;
        this._clearTimeout();
        return fetch(action)
            .then((response) => response.json());
    }
}

(() => {
    const form = new YaForm('myForm');
    window.MyForm = {
        getData: form.getData.bind(form),
        setData: form.setData.bind(form),
        validate: form.validate.bind(form),
        submit: form.submit.bind(form)
    };
})();

document.getElementById('submitButton').addEventListener('click', MyForm.submit);
