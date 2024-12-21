import React, { useContext, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import  { useForm } from '../../util/hooks';
import { AuthContext } from '../../context/auth';
function Register() {
  const context = useContext(AuthContext);
  const navigate = useNavigate(); 
  const [errors, setErrors] = useState({});
  const { onChange, onSubmit, values} = useForm(registerUser, {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [addUser , { loading }] = useMutation(REGISTER_USER, {
    update(_, {data: {register :userData}}) {
     // console.log("Mutation result:", result); 
      context.login(userData);
      navigate('/');
      // Check if the result is defined and has the expected structure
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
  function registerUser(){
    addUser();
  }
  return (
    <div className='form-container'>
      <Form onSubmit={onSubmit} noValidate className={loading ? 'loading' : ''}>
        <h1>Register</h1>
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
          label="Email"
          placeholder="Email.."
          name="email"
          type='email'
          value={values.email}
          error={!!errors.email}
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
        <Form.Input
          label="Confirm Password"
          placeholder="Confirm Password.."
          name="confirmPassword"
          type='password'
          value={values.confirmPassword}
          error={!!errors.confirmPassword}
          onChange={onChange}
        />
        <Button type='submit' primary>
          Register
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

const REGISTER_USER = gql`
  mutation register(
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      registerInput: {
        username: $username
        email: $email
        password: $password
        confirmPassword: $confirmPassword
      }
    ) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

export default Register;


