import logo from './logo.svg';
import './App.css';
import { useState } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  console.log(username, password);

  const refreshToken = async () => {
    try {
      const res = await axios.post('http://localhost:30000/api/refresh', { token: user.refreshToken });
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      })
      return res.data;

    } catch (error) {
      console.log(error);
    }
  }

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(  // VID: 50;
    async (config) => {
      let currentDate = new Date();
      const decodeToken = jwt_decode(user.accessToken);
      if (decodeToken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshToken();
        config.headers["authorization"] = "Bearer " + data.accessToken;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    })

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:30000/api/login', { username, password });
      setUser(res.data);

    } catch (err) {
      console.log(err);
    }
  }

  const handleDelete = async (id) => {

    try {
      await axiosJWT.delete('http://localhost:30000/api/users/' + id, {
        headers: { authorization: "Bearer " + user.accessToken }
      });
      setSuccess(true);
      setError(false);
    } catch (error) {
      console.log(error);
      setError(true);
      setSuccess(false);
    }
  }

  return (
    <div className="App">
      {user ? <div className='home'>
        <h3>weelcome to the {user.isAdmin ? 'Admin' : 'User'} dashboard</h3>
        <h3>{user.username}</h3>
        <button onClick={() => handleDelete(1)}>Delete harry</button>
        <button onClick={() => handleDelete(2)}>Delete ron</button>
        {error && (<span>You're not allowed to delete this user!</span>)}
        {success && (<span>User has been deleted!</span>)}

      </div>
        : <form className='login'>
          <input type="text" name="username" onChange={(e) => setUsername(e.target.value)} placeholder='username' />
          <input type="password" name="password" onChange={(e) => setPassword(e.target.value)} placeholder='password' />
          <button onClick={handleSubmit}>login</button>
        </form>
      }
    </div>
  );
}

export default App;
