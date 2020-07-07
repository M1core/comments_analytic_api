import axios from 'axios';

const getComments = async () => {
  const data = await axios.get('https://jsonplaceholder.typicode.com/comments').catch((e) => console.log(e));
  return data.data;
};

export default getComments;
