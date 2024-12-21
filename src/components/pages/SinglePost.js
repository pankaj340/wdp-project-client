import React, { useContext, useState } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/client';
import moment from 'moment';
import { AuthContext } from '../../context/auth';
import LikeButton from '../LikeButton';
import { Button, Icon, Form, Card, Grid, Image, Label } from 'semantic-ui-react';
import DeleteButton from '../DeleteButton';
import { useParams, useNavigate } from 'react-router-dom';

function SinglePost() {
    const { postId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [comment, setComment] = useState('');

    // Fetch the post data
    const { loading, data, error } = useQuery(FETCH_POST_QUERY, {
        variables: { postId },
    });

    // Mutation for submitting a comment
    const [submitComment] = useMutation(SUBMIT_COMMENT_MUTATION, {
        update(cache, { data: { createComment } }) {
            setComment(''); // Clear the input field

            const cachedData = cache.readQuery({
                query: FETCH_POST_QUERY,
                variables: { postId },
            });

            if (cachedData) {
                cache.writeQuery({
                    query: FETCH_POST_QUERY,
                    variables: { postId },
                    data: {
                        getPost: {
                            ...cachedData.getPost,
                            comments: [...cachedData.getPost.comments, createComment],
                            commentCount: cachedData.getPost.commentCount + 1,
                        },
                    },
                });
            }
        },
        variables: {
            postId,
            body: comment,
        },
    });

    // Mutation for deleting a comment
    const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION, {
        update(cache, { data: { deleteComment } }) {
            const cachedData = cache.readQuery({
                query: FETCH_POST_QUERY,
                variables: { postId },
            });

            if (cachedData) {
                cache.writeQuery({
                    query: FETCH_POST_QUERY,
                    variables: { postId },
                    data: {
                        getPost: {
                            ...cachedData.getPost,
                            comments: cachedData.getPost.comments.filter(
                                (c) => c.id !== deleteComment.id
                            ),
                            commentCount: cachedData.getPost.commentCount - 1,
                        },
                    },
                });
            }
        },
        onError(err) {
            console.error(err.message); // Log the error for debugging
        },
    });

    // Delete post callback
    function deletePostCallback() {
        navigate('/');
    }

    if (loading) return <p>Loading post...</p>;
    if (error) return <p>Error loading post: {error.message}</p>;

    const getPost = data?.getPost;

    if (!getPost) {
        return <p>No post found.</p>;
    }

    const { id, body, createdAt, username, comments, likes, likeCount, commentCount } = getPost;

    return (
        <Grid>
            <Grid.Row>
                <Grid.Column width={2}>
                    <Image
                        src="https://react.semantic-ui.com/images/avatar/large/molly.png"
                        size="small"
                        float="right"
                    />
                </Grid.Column>
                <Grid.Column width={10}>
                    <Card fluid>
                        <Card.Content>
                            <Card.Header>{username}</Card.Header>
                            <Card.Meta>{moment(createdAt).fromNow()}</Card.Meta>
                            <Card.Description>{body}</Card.Description>
                        </Card.Content>
                        <hr />
                        <Card.Content extra>
                            <LikeButton user={user} post={{ id, likeCount, likes }} />
                            <Button as="div" labelPosition="right" onClick={() => console.log('Comment on post')}>
                                <Button basic color="blue">
                                    <Icon name="comments" />
                                </Button>
                                <Label basic color="blue" pointing="left">
                                    {commentCount}
                                </Label>
                            </Button>
                            {user && user.username === username && (
                                <DeleteButton postId={id} callback={deletePostCallback} />
                            )}
                        </Card.Content>
                    </Card>
                    {user && (
                        <Card fluid>
                            <Card.Content>
                                <p>Post a comment</p>
                                <Form
                                    onSubmit={(e) => {
                                        e.preventDefault(); // Prevent page reload
                                        submitComment();
                                    }}
                                >
                                    <div className="ui action input fluid">
                                        <input
                                            type="text"
                                            placeholder="Comment.."
                                            name="comment"
                                            value={comment}
                                            onChange={(event) => setComment(event.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            className="ui button teal"
                                            disabled={comment.trim() === ''}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </Form>
                            </Card.Content>
                        </Card>
                    )}
                    {comments.map((comment) => (
                        <Card fluid key={comment.id}>
                            <Card.Content>
                                {user && user.username === comment.username && (
                                    <DeleteButton
                                        postId={id}
                                        commentId={comment.id}
                                        callback={() =>
                                            deleteComment({ variables: { postId, commentId: comment.id } })
                                        }
                                    />
                                )}
                                <Card.Header>{comment.username}</Card.Header>
                                <Card.Meta>{moment(comment.createdAt).fromNow()}</Card.Meta>
                                <Card.Description>{comment.body}</Card.Description>
                            </Card.Content>
                        </Card>
                    ))}
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}

const FETCH_POST_QUERY = gql`
    query($postId: ID!) {
        getPost(postId: $postId) {
            id
            body
            createdAt
            username
            likeCount
            likes {
                username
            }
            commentCount
            comments {
                id
                username
                createdAt
                body
            }
        }
    }
`;

const SUBMIT_COMMENT_MUTATION = gql`
    mutation($postId: String!, $body: String!) {
        createComment(postId: $postId, body: $body) {
            id
            body
            createdAt
            username
        }
    }
`;

const DELETE_COMMENT_MUTATION = gql`
    mutation($postId: String!, $commentId: String!) {
        deleteComment(postId: $postId, commentId: $commentId) {
            id
        }
    }
`;

export default SinglePost;
