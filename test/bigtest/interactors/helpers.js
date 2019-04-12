import { computed } from '@bigtest/interactor';

export function contains(selector, text) {
  return computed(function () {
    const result = [].filter.call(this.$$(selector), (element) => {
      return RegExp(text).test(element.textContent);
    });

    return !!result.length;
  });
}

export default {};
