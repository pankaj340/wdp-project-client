import React, { useContext} from 'react';
import { useQuery} from '@apollo/client';
import PostCard from '../PostCard'
import { Grid, Transition} from 'semantic-ui-react';
import { AuthContext } from '../../context/auth';
import PostForm from '../../components/PostForm';
import {FETCH_POSTS_QUERY} from '../../util/graphql'
 function Home() {
  const { user } = useContext(AuthContext);
  const { loading, error, data } = useQuery(FETCH_POSTS_QUERY);

  if (loading) return <h1>Loading posts..</h1>;
  if (error) return <h1>Error loading posts: {error.message}</h1>;
  // Ensure data and getPosts are defined
  if (!data || !data.getPosts) {
    return <h1>No posts available</h1>;
  }

  const posts = data.getPosts;
  return (
    <Grid columns={3}>
      <Grid.Row className='page-title'>
        <h1>Recent Posts</h1>
      </Grid.Row>
    <Grid.Row>
      { user && (
        <Grid.Column>
           <PostForm />
        </Grid.Column>
      )}
      {loading ? (
        <h1>Loading posts..</h1>
      ) : (
          <Transition.Group>
            {posts && posts.map(post =>(
          <Grid.Column key ={post.id} style={{marginBottom: 20}}>
            <PostCard post={post}/>
          </Grid.Column>
          ))}
          </Transition.Group>
      )}
    </Grid.Row>
    </Grid>
  );
}

export default Home;