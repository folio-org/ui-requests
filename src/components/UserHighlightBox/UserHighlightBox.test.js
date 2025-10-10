import { render } from '@folio/jest-config-stripes/testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import UserHighlightBox from './UserHighlightBox';

describe('userHighlightBox', () => {
  const title = 'user title';
  let uhb;
  describe('given a user', () => {
    let user;
    beforeEach(() => {
      user = { id: 'id', lastName: 'user name', barcode: 'barcode' };
      uhb = render(
        <MemoryRouter>
          <UserHighlightBox title={title} user={user} />
        </MemoryRouter>
      );
    });
    it('renders the title', () => {
      expect(uhb.queryAllByText(title)).toHaveLength(1);
    });
    it('renders the user name as a link', () => {
      expect(uhb.getByText(user.lastName).href).toMatch(`/users/view/${user.id}`);
    });
    it('renders the user barcode as a link', () => {
      expect(uhb.getByText(user.barcode).href).toMatch(`/users/view/${user.id}`);
    });
  });
  describe('given a null user', () => {
    beforeEach(() => {
      uhb = render(
        <MemoryRouter>
          <UserHighlightBox title={title} user={null} />
        </MemoryRouter>
      );
    });
    it('renders the title', () => {
      expect(uhb.queryAllByText(title)).toHaveLength(1);
    });
    it('renders no links', () => {
      expect(uhb.queryAllByRole('link')).toHaveLength(0);
    });
    it('renders anonymized user', () => {
      expect(uhb.queryAllByText('ui-requests.requestMeta.anonymized', { exact: false })).toHaveLength(1);
    });
    it('renders dash barcode', () => {
      expect(uhb.queryAllByText('No value')).toHaveLength(1);
    });
  });
});
