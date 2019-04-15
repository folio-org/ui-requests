import { computed, action } from '@bigtest/interactor';

export function contains(selector) {
  return action(function (text) {
    const result = [].filter.call(this.$$(selector), (element) => {
      return RegExp(text).test(element.textContent);
    });

    return !!result.length;
  });
}

export function getSelectValues(selector) {
  return computed(function () {
    return Array.from(document.querySelectorAll(selector))
      .map(option => option.value);
  });
}

export default {};
