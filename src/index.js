import express from 'express';
import NodeCache from 'node-cache';

import getComments from './getComments.js';
import popularAuthor from './popularAuthor.js';
import popularWords from './popularWords.js';

const app = express();
const appCache = new NodeCache();

app.listen(process.env.PORT || 3000);

appCache.mset([
  { key: 'executions', val: 0 },
  { key: 'executionTimers', val: [] },
  { key: 'isAuth', val: false },
]);

app.post('/api/auth', (req, res) => {
  if (appCache.get('isAuth')) res.send({ message: 'You are already authorized' });
  else {
    appCache.set('isAuth', true);
    res.send({ message: 'Succesfully authorized' });
  }
});

app.post('/api/comments', (req, res) => {
  if (appCache.get('isAuth')) {
    if (appCache.get('executions') < 5) {
      appCache.set('executions', appCache.get('executions') + 1);

      const timerStart = new Date().getTime();

      getComments().then((data) => {
        const user = popularAuthor(data);
        const words = popularWords(data);

        const timerEnd = new Date().getTime() - timerStart;
        const timerArr = appCache.get('executionTimers');
        if (timerArr.length > 3) {
          timerArr.unshift(); timerArr.push(timerEnd);
        } else timerArr.push(timerEnd);
        appCache.set('executionTimers', timerArr);

        res.send({
          popularAuthor: {
            email: user[0],
            comments: user[1],
          },
          popularWords: words,
          executionTime: timerEnd,
          avgExecTime: appCache.get('executionTimers').reduce((acc, cur) => acc + cur) / (appCache.get('executionTimers')).length,
        });
      }).catch((e) => res.send({ error: e }));
    } else {
      res.send({ message: 'You have made too many requests, please try again later' });
      setTimeout(() => appCache.set('executions', 0), 10000);
    }
  } else res.send({ message: 'You are not authorized. Visit "/api/auth".' });
});
