const topWords = (data) => {
  const comments = data.map((el) => `${el.body} `).toString().toLowerCase().replace(/.,/g, '')
    .split(/[\s\n]/)
    .reduce((acc, el) => {
      acc[el] = (acc[el] || 0) + 1;
      return acc;
    }, {});

  return Object.fromEntries(Object.entries(comments).sort((a, b) => b[1] - a[1]).slice(0, 5));
};

export default topWords;
