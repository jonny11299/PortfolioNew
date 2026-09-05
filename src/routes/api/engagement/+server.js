import { json, error } from '@sveltejs/kit';
import { USE_MOCK } from '$env/static/private';
import { BLOB_SECRET } from '$env/static/private';
import { BLOB_DEPLOYMENT } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	let { content } = await request.json();
	// console.log(content);
	// console.log(JSON.stringify(content));
	// console.log(JSON.parse(JSON.stringify(content)));
	const type = 'para';
	// console.log(FOR_TEAM);
	// console.log(typeof FOR_TEAM);

	try {
		const response = await fetch(BLOB_DEPLOYMENT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				eventType: type,
				secret: BLOB_SECRET,
				timestamp: new Date(),
				content: JSON.stringify(content),
				for_team: FOR_TEAM
			})
		});

		return json({ ok: true, status: response.status });
	} catch (err) {
		console.error(`Failure on post: ${type}`, err);
		throw error(500, 'Failed to forward event');
	}
}
