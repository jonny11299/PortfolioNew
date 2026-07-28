function createThemeStore() {
	let theme = $state('light');

	const isDark = $derived(
		theme === 'dark' ||
			(theme === 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
	);

	function setTheme(newTheme) {
		theme = newTheme;
		localStorage.setItem('theme', newTheme);

		document.documentElement.classList.add('no-transition');
		document.documentElement.setAttribute('data-theme', newTheme);

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				document.documentElement.classList.remove('no-transition');
			});
		});
	}

	function init() {
		const saved = localStorage.getItem('theme');
		setTheme(saved ?? 'notebook');
	}

	return {
		get theme() {
			return theme;
		},
		get isDark() {
			return isDark;
		},
		setTheme,
		init
	};
}

export const themeStore = createThemeStore();
