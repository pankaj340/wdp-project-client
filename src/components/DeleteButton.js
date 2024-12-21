import React, {useState} from "react";
import gql from 'graphql-tag';
import { useMutation } from "@apollo/client";
import {FETCH_POSTS_QUERY} from '../util/graphql';
import { Button, Confirm, Icon} from 'semantic-ui-react';

function DeleteButton({ postId, commentId ,callback }){
    const [confirmOpen, setConfirmOpen] = useState(false);
    const mutation = commentId ? DELETE_COMMENT_MUTATION : DELETE_POST_MUTATION;
    const [deletePostOrMutation] = useMutation(mutation ,{
        update(proxy){
            setConfirmOpen(false);
           if(!commentId) {
            const data = proxy.readQuery({
              query: FETCH_POSTS_QUERY
         });
         const newPosts = data.getPosts.filter(p => p.id !== postId);
         proxy.writeQuery({ query: FETCH_POSTS_QUERY, data: { getPosts: newPosts}});
        }
            if(callback) callback();
        },
          variables: {
            postId,
            commentId
          },
          onError(err) {
            console.error('Delete Mutation Error:', err);
        if (err.graphQLErrors) {
            err.graphQLErrors.forEach(({ message }) => {
                console.error('GraphQL Error:', message);
            });
        }
        if (err.networkError) {
            console.error('Network Error:', err.networkError);
        }
          },
    });
    return(
        <>
        <Button as="div"
     color='red'
     floated='right'
     onClick={()=> setConfirmOpen(true)}
     >
      <Icon name='trash' style={{ margin: 0}}/>
    </Button>
    <Confirm
       open={confirmOpen}
       onCancel={() =>  setConfirmOpen(false)}
       onConfirm={deletePostOrMutation}
     />
     </>
    );
}

const DELETE_POST_MUTATION = gql`
      mutation deletePost($postId: ID!){
           deletePost(postId: $postId)
      }
`;
const DELETE_COMMENT_MUTATION = gql`
      mutation deleteComment($postId:ID!, $commentId: ID!){
        deleteComment(postId: $postId, commentId: $commentId){
          id
          comments{
            id username createdAt body
          }
          commentCount
        }
      }
`;

export default DeleteButton;