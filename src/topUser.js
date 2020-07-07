const topUser = (data) => {
  const userCount = data.map((el) => el.email)
    .reduce((acc, el) => {
      acc[el] = (acc[el] || 0) + 1;
      return acc;
    }, {});

  return Object.entries(userCount).sort((a, b) => b[1] - a[1])[0];
};
export default topUser;
