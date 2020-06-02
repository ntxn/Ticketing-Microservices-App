const LandingPage = ({ currentUser }) => {
  return <h1>{currentUser ? 'You are signed in' : 'You Are NOT signed in'}</h1>;
};

// LandingPage.getInitialProps = async (context) => {
//   console.log('Landing page');
//   const client = buildClient(context);
//   const { data } = await client.get('/api/users/currentuser');
//   return data;
// };

export default LandingPage;
