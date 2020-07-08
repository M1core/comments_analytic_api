import express from 'express';
import NodeCache from 'node-cache';
import throttle from 'express-throttle';

import getComments from './getComments.js';
import popularAuthor from './popularAuthor.js';
import popularWords from './popularWords.js';

const app = express();
const appCache = new NodeCache();
const options = {
  burst: 5,
  period: '60s',
  on_throttled: (req, res) => res.send('You made too many request, try again later'),
};

app.listen(process.env.PORT || 3000);

appCache.mset([
  { key: 'executionTimers', val: [] },
  { key: 'isAuth', val: false },
]);

app.post('/api/auth', throttle(options), (req, res) => {
  if (appCache.get('isAuth')) res.send({ message: 'You are already authorized' });
  else {
    appCache.set('isAuth', true);
    res.send({ message: 'Succesfully authorized' });
  }
});

app.post('/api/comments', throttle(options), async (req, res) => {
  if (appCache.get('isAuth')) {
    appCache.set('executions', appCache.get('executions') + 1);

    const timerStart = new Date().getTime(); // начало отсчёта времени выполнения запроса

    const data = await getComments().catch((e) => res.send({ error: e }));
    const user = popularAuthor(data);
    const words = popularWords(data);

    // конец отсчёта, вычисление затраченного времени
    const timerEnd = new Date().getTime() - timerStart;
    // получение массива с временами выполнения запросов из кеша
    const timerArr = appCache.get('executionTimers');
    // т.к. расчёт среднего времени ведётся с ограниченным числом записей,
    // то массив надо ограничить
    if (timerArr.length > 10) timerArr.unshift();
    // если записей больше чем задано условием, то из начала массива
    // убираем запись и добавляем новую в конец

    timerArr.push(timerEnd);
    appCache.set('executionTimers', timerArr); // сохраняем массив в кеш

    res.send({
      popularAuthor: {
        email: user[0],
        comments: user[1],
      },
      popularWords: words,
      executionTime: timerEnd,
      avgExecTime: appCache.get('executionTimers').reduce((acc, cur) => acc + cur) / (appCache.get('executionTimers')).length,
    });
  } else res.send({ message: 'You are not authorized. Visit "/api/auth".' });
});
