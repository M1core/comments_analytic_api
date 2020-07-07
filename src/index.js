import express from 'express';

import getComments from './getComments.js';
import topUser from './topUser.js';
import topWords from './topWords.js';

const app = express();

app.listen(process.env.PORT || 3000, () => console.log('Server working at port:', process.env.PORT || 3000));

app.post('/api/comments', (req, res) => {
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
});
