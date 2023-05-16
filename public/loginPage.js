// инициируем приняте данных из формы
const myUserForm = new UserForm();

// логинимся
myUserForm.loginFormCallback = (data) => {
    ApiConnector.login(
        data, (response) => {
            // если не залогинились - выводим ошибку входа
            if (response.success === false) {
                myUserForm.setLoginErrorMessage(response.error);
            } else { 
                // обновляем страничку - попадаем в ЛК
                window.location.reload();
            }
    });
    
}

// регистрируемся
myUserForm.registerFormCallback = (data) => {
    ApiConnector.register(data, (response) => {
        // если не зарегистрировались - выводим ошибку регистрации
        if (response.success === false) {
            myUserForm.setRegisterErrorMessage(response.error);
        } else {
            // обновляем страничку - попадаем в ЛК
            window.location.reload();
        }
    })
    
}