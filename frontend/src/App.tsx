import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import PostDetails from './pages/PostDetails';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:slug" element={<PostDetails />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/new" element={<CreatePost />} />
            <Route path="/admin/edit/:id" element={<EditPost />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default App;
