jest.mock('react-to-print', () => jest.fn(({
  content,
  trigger,
}) => (
  <div>
    {content()}
    {trigger()}
  </div>
)));
