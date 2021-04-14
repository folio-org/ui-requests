import {
  interactor,
  scoped,
} from '@bigtest/interactor';

@interactor class BlockModalInteractor {
  static defaultScope = 'body';

  overrideButton = scoped('[data-test-override-patron-block]');
}

export default BlockModalInteractor;
