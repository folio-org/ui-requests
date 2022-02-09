jest.mock('@folio/react-intl-safe-html', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));
