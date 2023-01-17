import setupStripesCore from '@folio/stripes-ui/test/bigtest/helpers/setup-application';
import mirageOptions from '../network';

export default function setupApplication({
  scenarios = ['default'],
  hasAllPerms = true,
  currentUser,
  modules,
} = {}) {
  setupStripesCore({
    mirageOptions: {
      serverType: 'miragejs',
      ...mirageOptions
    },
    currentUser,
    scenarios,
    stripesConfig: {
      hasAllPerms,
    },
    modules,
  });
}
