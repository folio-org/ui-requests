import {
  clickable,
  interactor,
  isPresent,
  scoped,
} from '@bigtest/interactor';
import { isEmpty } from 'lodash';

import {
  NotesAccordion,
  NotesModal,
  // eslint-disable-next-line import/no-extraneous-dependencies
} from '@folio/stripes-smart-components/lib/Notes/NotesSmartAccordion/tests/interactors';

import CancelRequestDialog from './cancel-request-dialog';
import MoveRequestDialog from './move-request-dialog';
import ChooseRequestTypeDialog from './choose-request-type-dialog';
import HeaderDropdown from './header-dropdown';
import HeaderDropdownMenu from './header-dropdown-menu';
import ItemAccordion from './item-accordion';
import MoveToSecondPositionDialog from './move-to-second-position-dialog';
import KeyValue from './KeyValue';

import { contains } from './helpers';

@interactor class ViewRequestInteractor {
  headerDropdown = new HeaderDropdown();
  headerDropdownMenu = new HeaderDropdownMenu();
  itemAccordion = new ItemAccordion('#item-info');
  cancelRequestDialog = new CancelRequestDialog('[data-test-cancel-request-modal]');
  moveRequestDialog = new MoveRequestDialog('[data-test-move-request-modal]');
  moveToSecondPositionDialog = new MoveToSecondPositionDialog('#move-to-second-position-modal');
  chooseRequestTypeDialog = new ChooseRequestTypeDialog('[data-test-choose-request-type-modal]');
  requestSectionPresent = isPresent('#request-info');
  requesterSectionPresent = isPresent('#requester-info');
  requesterInfoContains = contains('#requester-info');
  requestInfoContains = contains('#request-info');
  patronComments = scoped('[data-test-request-patron-comments] div', KeyValue);
  requestsOnItem = scoped('[data-test-requests-on-item] div', KeyValue);
  staffNotesAccordion = new NotesAccordion('#staff-notes');
  notesModal = new NotesModal();
  clickCloseNoteButton = clickable('[data-test-leave-note-view]');

  itemAccordionClick = clickable('#accordion-toggle-button-item-info');

  whenNotesLoaded() {
    return this.when(() => this.staffNotesAccordion && !isEmpty(this.staffNotesAccordion.notes()));
  }
}

export default ViewRequestInteractor;
