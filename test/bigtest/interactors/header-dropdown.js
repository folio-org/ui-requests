import {
  clickable,
  interactor,
} from '@bigtest/interactor';

@interactor class HeaderDropdown {
  click = clickable('button');
}

export default HeaderDropdown;
