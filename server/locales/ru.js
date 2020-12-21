export default {
  translation: {
    appName: 'Таск Менеджер',
    layouts: {
      application: {
        users: 'Пользователи',
        statuses: 'Статусы',
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
      statuses: {
        create: {
          success: 'Статус успешно создан',
          error: 'Не удалось создать статус',
        },
        edit: {
          success: 'Статус успешно изменен',
          error: 'Не удалось изменить статус',
        },
      },
      session: {
        new: {
          success: 'Аутентификация прошла успешно',
          error: 'Неверная электронная почта или пароль',
        },
      },
      common: {
        unauthenticated: 'Необходимо аутентифицироваться',
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
        fullName: 'Полное имя',
        firstName: 'Имя',
        lastName: 'Фамилия',
        createdAt: 'Дата создания',
      },
      statuses: {
        index: {
          delete: 'Удалить',
          create: 'Создать статус',
        },
        new: {
          title: 'Новый статус',
          submit: 'Создать',
        },
        edit: {
          title: 'Редактирование статуса',
          submit: 'Сохранить',
        },
        id: 'id',
        name: 'Название',
        createdAt: 'Дата создания',
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
