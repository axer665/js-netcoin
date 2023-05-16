// Разлогин поьзователя по нажатию на кнопку выхода
let myLogout = new LogoutButton();
myLogout.action = () => {
    ApiConnector.logout((data) => {
        window.location.reload();
    });
}

// Получение данных об авторизованном пользователе
ApiConnector.current((user) => {
    ProfileWidget.showProfile(user.data);
})

// Инициируем избранных
const favorites = new FavoritesWidget();

// Инициируем курсы валют
const ratesBoard = new RatesBoard();

// Получение курсов валют
ApiConnector.getStocks((table) => {
    ratesBoard.fillTable(table.data);
})


/*
    Какие-то манипуляции с валютой 
*/

// Инициируем менеджер валют 
let myMoneyManager = new MoneyManager();

// Пополнение
myMoneyManager.addMoneyCallback = (data) => {
    if (Number(data.amount) === 0){
        myMoneyManager.setMessage(false, "Вносимая сумма должна быть  больше 0");
    } else if (data.currency === "") {
        myMoneyManager.setMessage(false, "Не выбрана валюта");
    } else {
        ApiConnector.addMoney(data, (user) => {
            ProfileWidget.showProfile(user.data); // обновляем профиль
            myMoneyManager.setMessage(true, "Ваш кошелек пополнен на " + data.amount + " " + data.currency);
        })
    }
}

// Конвертация валют
myMoneyManager.conversionMoneyCallback = (data) => {
    if (Number(data.fromAmount) === 0) {
        myMoneyManager.setMessage(false, "Конвертируемая сумма должна быть  больше 0");
    } else if (data.fromCurrency === "") {
        myMoneyManager.setMessage(false, "Не выбрана валюта, которую конвертируем");
    } else if (data.targetCurrency === "") {
        myMoneyManager.setMessage(false, "Не выбрана валюта, в которую конвертируем");
    } else {
        // Получаем текущего пользователя
        ApiConnector.current((userConnect) => {
            // Если данные получили и количество выбранной валюты позволяет сделать списание, то делаем его
            if (userConnect.success === true && userConnect?.data?.balance[data.fromCurrency] > data.fromAmount) {
                ApiConnector.convertMoney(data, (user) => {
                    ProfileWidget.showProfile(user.data); // обновляем профиль
                    myMoneyManager.setMessage(true, "Вы конвертировали " + data.fromAmount + " из " + data.fromCurrency + " в " + data.targetCurrency + " по текущему курсу");
                })
            } else {
                myMoneyManager.setMessage(false, "На вашем счету недостаточно средств " + data.fromCurrency);
            }
        })
    }
}

// Перечисление другому пользователю
myMoneyManager.sendMoneyCallback = (data) => {
    if (Number(data.amount) === 0) {
        myMoneyManager.setMessage(false, "Сумма перевода должна быть  больше 0");
    } else if (data.to === 0) {
        myMoneyManager.setMessage(false, "Получатель не установлен");
    } else if (data.currency === "") {
        myMoneyManager.setMessage(false, "Не выбрана валюта");
    } else {
        // Получаем данные текущего пользователя
        ApiConnector.current((userConnect) => {
            // Если данные получили и количество выбранной валюты позволяет сделать списание, то делаем его
            if (userConnect.success === true && userConnect?.data?.balance[data.currency] >= data.amount) {
                ApiConnector.transferMoney(data, (user) => {
                    if (favoritesObjectList.length > 0) {
                        ProfileWidget.showProfile(user.data); // обновляем профиль
                        const recipient = favoritesObjectList.find(favorite => favorite.id == data.to);
                        myMoneyManager.setMessage(true, "Вы перечислили " + data.amount + " " + data.currency + " пользователю " + recipient.name);
                    } else {
                        myMoneyManager.setMessage(false, "Ваш список избранного пуст");
                    }
                });
            } else {
                myMoneyManager.setMessage(false, "На вашем счету недостаточно средств " + data.currency);
            }
        })
        
    }
}


/*
    Манипуляции со списком избранного
*/

// Список избранных, которым будем манипулировать
let favoritesObjectList = [];

// Получение списка контактов (избранного)
ApiConnector.getFavorites((fav) => {
    const favoritesList = fav.data;
    updateFavorites(favoritesList);
    myMoneyManager.updateUsersList(favoritesList);
})

/**
   * Обновляем список контактов (избранных)
   *
   * @param {*} { id: name, id: name }
   */

updateFavorites = (data) => {
    Object.keys(data).forEach(key => {
        favorites.fillTable({[key]: data[key]});
        favoritesObjectList.push({
            id: key, 
            name: data[key]
        });
    })
}

// Добавление пользователя в избранное
favorites.addUserCallback = (data) => {
    if (Number(data.id) <= 0) { 
        favorites.setMessage(false, "Идентификато пользователя должен быть больше 0");
    } else if (data.name === "") {
        favorites.setMessage(false, "Имя пользователя не может быть пустым");
    } else {
        favorites.clearTable()
        ApiConnector.addUserToFavorites(data, (favorites) => {
            updateFavorites(favorites.data)
            myMoneyManager.updateUsersList(favorites.data);
        })
    }
}

// Удаление пользователя из избранного
favorites.removeUserCallback = (favoriteId) => {
    favorites.clearTable()
    ApiConnector.removeUserFromFavorites(favoriteId, (favorites) => {
        updateFavorites(favorites.data)
        myMoneyManager.updateUsersList(favorites.data);
    })
}