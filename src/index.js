import express from 'express';
import NodeCache from 'node-cache';

import getComments from './getComments.js';
import topUser from './topUser.js';
import topWords from './topWords.js';

const app = express();
const appCache = new NodeCache();

app.listen(process.env.PORT || 3000);

appCache.mset([
  { key: 'executions', val: 0 },
  { key: 'executionTimers', val: [] },
  { key: 'isAuth', val: false },
]);

app.post('/api/auth', (req, res) => {
  if (appCache.get('isAuth')) res.send('You are already authorized');
  else {
    appCache.set('isAuth', true);
    res.send('Succesfully authorized');
  }
});

app.post('/api/comments', (req, res) => {
  if (appCache.get('isAuth')) {
    if (appCache.get('executions') < 5) {
      appCache.set('executions', appCache.get('executions') + 1);

      const timerStart = new Date().getTime();

      getComments().then((data) => {
        const user = topUser(data);
        const words = topWords(data);

        const timerEnd = new Date().getTime() - timerStart;
        const timerArr = appCache.get('executionTimers');
        timerArr.length > 3 ? () => { timerArr.unshift(); timerArr.push(timerEnd); }
          : timerArr.push(timerEnd);
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
      }).catch((e) => res.send(e));
    } else {
      res.send('You have made too many requests, please try again later');
      setTimeout(() => appCache.set('executions', 0), 10000);
    }
  } else res.send('You are not authorized. Visit "/api/auth".');
});
