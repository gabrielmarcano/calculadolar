export const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(1); // 1ms for the subtlest possible 'tick'
    }
};
