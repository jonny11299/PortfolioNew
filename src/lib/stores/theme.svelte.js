function createThemeStore() {
	let theme = $state('light');
	const THEME_UID = 'theme_project_head_paosubdfp02840tu2'; // so I can nest my projects without their theme interfering with my theme

	const isDark = $derived(
		theme === 'dark' ||
			(theme === 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
	);

	function setTheme(newTheme) {
		theme = newTheme;
		localStorage.setItem(THEME_UID, newTheme);

		document.documentElement.classList.add('no-transition');
		document.documentElement.setAttribute('data-theme', newTheme);

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				document.documentElement.classList.remove('no-transition');
			});
		});
	}

	function init() {
		const saved = localStorage.getItem(THEME_UID);
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
