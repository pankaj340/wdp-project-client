import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import ApolloProvider from './ApolloProvider'; // Import your ApolloProvider
ReactDOM.render(<ApolloProvider/>, document.getElementById('root'));
reportWebVitals();
