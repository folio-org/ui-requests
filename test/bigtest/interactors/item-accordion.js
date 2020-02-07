import {
  attribute,
  interactor,
} from '@bigtest/interactor';


@interactor class ItemAccordion {
  isExpanded = attribute('#accordion-toggle-button-item-info', 'aria-expanded') === 'true';
}

export default ItemAccordion;
