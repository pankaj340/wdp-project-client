import React from 'react';
import { BrowserRouter as Router, Route,Routes} from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import  { AuthProvider } from './context/auth';
import MenuBar from './components/MenuBar';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import SinglePost from './components/pages/SinglePost';
function App() {
  return (
    <AuthProvider>
    <Router>
      <Container>
      <MenuBar/>
      <Routes>
      <Route  path="/" element={<Home/>}/>
      <Route exact path="/login" element={<Login/>}/>
      <Route exact path="/register" element={<Register/>}/>
      <Route  path="/posts/:postId" element={<SinglePost />}/>
      </Routes>
      </Container>
    </Router>
    </AuthProvider>
  );
}

export default App;
