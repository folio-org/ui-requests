jest.mock('react-final-form', () => ({
  Field: ({ name, label, component, onChange, required, validate, children }) => {
    const Component = component;
    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <Component
          id={name}
          name={name}
          onChange={onChange}
          required={required}
          validate={validate}
        >
          {children}
        </Component>
      </div>
    );
  },
}));
