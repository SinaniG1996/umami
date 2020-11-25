import { getWebsiteStats } from 'lib/queries';
import { methodNotAllowed, ok, unauthorized } from 'lib/response';
import { allowQuery } from 'lib/auth';

export default async (req, res) => {
  if (req.method === 'GET') {
    if (!req.query.ids) throw new Error('ids required');
    const validIds = req.query.ids.split(',').every(id => !!+id.trim());
    if (!validIds) throw new Error('ids should be comma separated integers');
    const ids = req.query.ids.split(',').map(id => +id.trim());

    const websitesStats = await Promise.all(
      ids.map(id => {
        req.query.id = id;
        return websiteStats(req, res);
      }),
    );

    return ok(res, websitesStats);
  }

  return methodNotAllowed(res);
};

async function websiteStats(req, res) {
  if (!(await allowQuery(req))) {
    return unauthorized(res);
  }

  const { id, start_at, end_at, url } = req.query;

  const websiteId = +id;
  const startDate = new Date(+start_at);
  const endDate = new Date(+end_at);

  const metrics = await getWebsiteStats(websiteId, startDate, endDate, { url });

  return Object.keys(metrics[0]).reduce((obj, key) => {
    obj[key] = Number(metrics[0][key]) || 0;
    return obj;
  }, {});
}
