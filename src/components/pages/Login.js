import React, { useContext, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../util/hooks';
import { AuthContext } from '../../context/auth';
function Login() {
  const context = useContext(AuthContext);
  const navigate = useNavigate(); 
  const [errors, setErrors] = useState({});
  const { onChange, onSubmit, values} = useForm(loginUserCallback,{
    username:'',
    password:''
  })
  const [loginUser , { loading }] = useMutation(LOGIN_USER, {
    update(_, {data: {login: userData}}) {
      context.login(userData)
        navigate('/'); // Redirect to home page
      },
    onError(err) {
      console.error("Error occurred:", err); // Log the error
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        console.log(err.graphQLErrors[0].extensions.exception.errors);
        setErrors(err.graphQLErrors[0].extensions.exception.errors || {});
      } else {
        console.log("An unexpected error occurred:", err);
        setErrors({ general: "An unexpected error occurred." });
      }
    },
    variables: values,
  });
function loginUserCallback(){
  loginUser();
}

  return (
    <div className='form-container'>
      <Form onSubmit={onSubmit} noValidate className={loading ? 'loading' : ''}>
        <h1>Login</h1>
        <Form.Input
          label="Username"
          placeholder="Username.."
          name="username"
          type='text'
          value={values.username}
          error={!!errors.username}
          onChange={onChange}
        />
        <Form.Input
          label="Password"
          placeholder="Password.."
          name="password"
          type='password'
          value={values.password}
          error={!!errors.password}
          onChange={onChange}
        />
        <Button type='submit' primary>
          Login
        </Button>
      </Form>
      {Object.keys(errors).length > 0 && (
        <div className="ui error message">
          <ul className="list">
            {Object.values(errors).map((value, index) => {
              return <li key={index}>{value}</li>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

const LOGIN_USER = gql`
  mutation login(
    $username: String!
    $password: String!
  ) {
    login(
        username: $username  password: $password
    ) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

export default Login; 
