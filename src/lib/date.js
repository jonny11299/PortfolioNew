/*
	Display strings stay human ('Jul 6 2026'); this derives the ISO form that
	<time datetime> and schema.org dates both require. Returns null on anything
	unparseable so a bad string degrades to plain text rather than emitting an
	invalid attribute.
*/
export function iso(dateString) {
	if (!dateString) return null;
	const d = new Date(dateString);
	return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}
