/**
 * Custom Vue 3 Directive: v-lazy-render
 * Prevents Cumulative Layout Shift (CLS) by locking height & aspect-ratio placeholders
 * before component viewport entry.
 */

const observerMap = new WeakMap();

export const vLazyRender = {
  mounted(el, binding) {
    const options = {
      root: null,
      rootMargin: '150px',
      threshold: 0.05,
      ...binding.value
    };

    // Prevent CLS: Lock dimensions based on element tag or binding value
    const minHeight = binding.value?.minHeight || (el.tagName === 'TR' ? '64px' : '140px');
    el.style.minHeight = minHeight;

    el._lazyIsVisible = false;
    el.classList.add('lazy-render-placeholder');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el._lazyIsVisible = true;
          el.classList.remove('lazy-render-placeholder');
          el.classList.add('lazy-render-mounted');
          
          if (binding.instance && typeof binding.instance.onLazyRender === 'function') {
            binding.instance.onLazyRender(el);
          }

          observer.unobserve(el);
          observerMap.delete(el);
        }
      });
    }, options);

    observer.observe(el);
    observerMap.set(el, observer);
  },

  unmounted(el) {
    const observer = observerMap.get(el);
    if (observer) {
      observer.unobserve(el);
      observerMap.delete(el);
    }
  }
};

export default vLazyRender;
