export default {
  translation: {
    appName: 'Task Manager',
    layouts: {
      application: {
        users: 'Users',
        signin: 'Sign in',
        signup: 'Sign up',
        logout: 'Log out',
      },
    },
    flash: {
      users: {
        create: {
          success: 'User successfully created',
          error: 'Failed to register',
        },
        edit: {
          success: 'User data was edited',
          error: 'Failed to edit user data',
        },
        unauthenticated: 'Only user can edit himself',
      },
      session: {
        new: {
          success: 'Successfully authenticated',
          error: 'Wrong email or password',
        },
      },
    },
    views: {
      users: {
        index: {
          delete: 'Delete',
        },
        new: {
          title: 'Sign up',
          submit: 'Sign up',
        },
        edit: {
          title: 'Edit user',
          submit: 'Save',
        },
        id: 'id',
        email: 'Email',
        password: 'Password',
        firstName: 'First name',
        lastName: 'Last name',
      },
      session: {
        title: 'Sign in',
        submit: 'Sign in',
      },
      404: {
        homeLink: 'Back to Home',
      },
    },
  },
};
