const popularAuthor = (data) => {
  const userCount = data.reduce((acc, el) => {
    acc[el.email] = (acc[el.email] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(userCount).sort((a, b) => b[1] - a[1])[0];
};
export default popularAuthor;
