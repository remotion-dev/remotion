import * as ff from '@google-cloud/functions-framework';
import { renderMediaSingleThread } from "./functions/render-media-single-thread";
import { renderStillSingleThread } from "./functions/render-still-single-thread";
import {GCPInternals} from './internals';

const renderOnCloudRun = async (req: ff.Request, res: ff.Response) => {
  const renderType = req.body.type;

  switch (renderType) {
    case 'media':
      await renderMediaSingleThread(req, res);
      break;
    case 'still':
      await renderStillSingleThread(req, res);
      break;
    default:
      res.status(400).send('Invalid render type, must be either "media" or "still"');
  }
};

export { renderOnCloudRun, GCPInternals }