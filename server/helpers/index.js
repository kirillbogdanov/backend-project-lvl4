import i18next from 'i18next';
import _ from 'lodash';

export default () => ({
  t(key) {
    return i18next.t(key);
  },
  getAlertClass(type) {
    switch (type) {
      case 'error':
        return 'danger';
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      default:
        throw new Error(`Unknown flash type: '${type}'`);
    }
  },
  _,
});