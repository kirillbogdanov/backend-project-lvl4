export default {
  translation: {
    appName: 'Таск Менеджер',
    layouts: {
      application: {
        users: 'Пользователи',
        signin: 'Войти',
        signup: 'Зарегистрироваться',
        logout: 'Выйти',
      },
    },
    flash: {
      users: {
        create: {
          success: 'Пользователь успешно зарегистрирован',
          error: 'Не удалось зарегистрироваться',
        },
        edit: {
          success: 'Данные пользователя изменены',
          error: 'Не удалось изменить данные пользователя',
        },
        unauthenticated: 'Только пользователь может изменять свои данные',
      },
      session: {
        new: {
          success: 'Аутентификация прошла успешно',
          error: 'Неверная электронная почта или пароль',
        },
      },
    },
    views: {
      users: {
        index: {
          delete: 'Удалить',
        },
        new: {
          title: 'Регистрация',
          submit: 'Зарегистрироваться',
        },
        edit: {
          title: 'Редактирование пользователя',
          submit: 'Сохранить',
        },
        id: 'id',
        email: 'Электронная почта',
        password: 'Пароль',
        firstName: 'Имя',
        lastName: 'Фамилия',
      },
      session: {
        title: 'Вход',
        submit: 'Войти',
      },
      404: {
        homeLink: 'Назад к Главной',
      },
    },
  },
};
