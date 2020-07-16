import {
  interactor,
  clickable,
  isPresent,
} from '@bigtest/interactor';

import ReferredRecordInteractor from './referred-record';

@interactor class NoteViewInteractor {
  isLoaded = isPresent('[class^=note-view-content]');

  referredRecord = new ReferredRecordInteractor();

  clickPaneHeaderButton = clickable('[data-test-pane-header-actions-button]');
  clickEdit = clickable('[data-test-navigate-note-edit]');

  whenLoaded() {
    return this.when(() => this.isLoaded);
  }

  clickEditButton() {
    return this.clickPaneHeaderButton()
      .clickEdit();
  }
}

export default NoteViewInteractor;
