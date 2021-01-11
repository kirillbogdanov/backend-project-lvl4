export default {
  translation: {
    appName: 'Таск Менеджер',
    layouts: {
      application: {
        users: 'Пользователи',
        statuses: 'Статусы',
        tasks: 'Задачи',
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
        delete: {
          success: 'Пользователь успешно удален',
          error: 'Не удалось удалить пользователя',
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
      tasks: {
        create: {
          success: 'Задача успешно создана',
          error: 'Не удалось создать задачу',
        },
        edit: {
          success: 'Задача успешно изменена',
          error: 'Не удалось изменить задачу',
        },
        delete: {
          success: 'Задача успешно удалена',
          unauthorized: 'Задачу может удалить только ее создатель',
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
        id: 'ID',
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
        id: 'ID',
        name: 'Название',
        createdAt: 'Дата создания',
      },
      tasks: {
        index: {
          create: 'Создать задачу',
          delete: 'Удалить',
          edit: 'Изменить',
        },
        new: {
          title: 'Новая задача',
          submit: 'Создать',
        },
        edit: {
          title: 'Изменение задачи',
          submit: 'Сохранить',
        },
        card: {
          edit: 'Изменить',
          delete: 'Удалить',
        },
        id: 'ID',
        name: 'Название',
        description: 'Описание',
        status: 'Статус',
        creator: 'Автор',
        executor: 'Исполнитель',
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
