import { interactor } from '@bigtest/interactor';

import ReferredRecordInteractor from './referred-record';

@interactor class NoteViewInteractor {
  static defaultScope = '[class*=note-view-content---]';

  referredRecord = new ReferredRecordInteractor();
}

export default NoteViewInteractor;
