import express from 'express';
import NodeCache from 'node-cache';

import getComments from './getComments.js';
import topUser from './topUser.js';
import topWords from './topWords.js';

const app = express();
const appCache = new NodeCache();

app.listen(process.env.PORT || 3000, () => console.log('Server working at port:', process.env.PORT || 3000));

appCache.mset([
  { key: 'executions', val: 0 },
  { key: 'executionTimers', val: [] },
]);

app.post('/api/comments', (req, res) => {
  if (appCache.get('executions') < 5) {
    appCache.set('executions', appCache.get('executions') + 1);
    const timerStart = new Date().getTime();
    getComments().then((d) => {
      const user = topUser(d);
      const words = Object.fromEntries(topWords(d));
      const timerEnd = new Date().getTime();

      res.send({
        popularAuthor: {
          email: user[0],
          comments: user[1],
        },
        popularWords: words,
        executionTime: timerEnd - timerStart,
      });
    });
  } else {
    res.send('You have made too many requests, please try again later');
    setTimeout(() => appCache.set('executions', 0), 10000);
  }
});
