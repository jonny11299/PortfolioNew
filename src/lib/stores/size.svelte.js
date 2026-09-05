function createSizeStore() {
	const aspects = ['desktop', 'square', 'phone'];
	const desktopMin = 1.33; // above = 'desktop', below = 'square'
	const squareMin = 1; // above = 'square', below = 'phone'

	let aspect = $state(aspects[0]);
	let initialized = false;

	function setAspect(newAspect) {
		aspect = newAspect;
	}

	function checkSize() {
		const r = window?.innerWidth / window?.innerHeight;
		if (r) {
			if (r > desktopMin) {
				setAspect('desktop');
			} else if (r > squareMin) {
				setAspect('square');
			} else {
				setAspect('phone');
			}
		} else {
			setAspect('desktop');
		}
		console.log(
			`Screen is ${window?.innerWidth} x ${window?.innerHeight} (r = ${r.toFixed(2)}), so let's serve the ${aspect} layout.`
		);
	}

	function init() {
		if (initialized) return; // guard against double-init
		initialized = true;
		checkSize();
		window.addEventListener('resize', checkSize);
	}

	function destroy() {
		window.removeEventListener('resize', checkSize);
		initialized = false;
	}

	return {
		get aspect() {
			return aspect;
		},
		setAspect,
		init,
		destroy
	};
}

export const sizeStore = createSizeStore();
