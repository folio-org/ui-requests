jest.mock('react-final-form', () => ({
  ...jest.requireActual('react-final-form'),
  Field: jest.fn(({
    label,
    children,
    component: Component,
    'data-testid': testId,
    validate = jest.fn(),
    ...rest
  }) => {
    if (Component) {
      return (
        <Component
          {...rest}
          label={label}
          validate={validate}
          data-testid={testId}
        />
      );
    } else {
      return children({
        meta: {},
        input: {
          validate,
          'data-testid': testId,
          onChange: (e) => {
            validate(e.target.value);
          },
        },
      });
    }
  }),
}));
