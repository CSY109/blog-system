import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import PostDetails from './pages/PostDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPosts from './pages/MyPosts';
import Dashboard from './pages/admin/Dashboard';
import Posts from './pages/admin/Posts';
import PostCreate from './pages/admin/PostCreate';
import PostEdit from './pages/admin/PostEdit';
import Users from './pages/admin/Users';
import Tags from './pages/admin/Tags';
import Comments from './pages/admin/Comments';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Public + authenticated user pages — simple header */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/posts/:slug" element={<PostDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Any authenticated user can create/edit posts */}
        <Route element={<ProtectedRoute />}>
          <Route path="/new-post" element={<PostCreate />} />
          <Route path="/edit-post/:id" element={<PostEdit />} />
          <Route path="/my-posts" element={<MyPosts />} />
        </Route>
      </Route>

      {/* Admin pages — with sidebar, admin-only */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/posts" element={<Posts />} />
          <Route path="/admin/posts/new" element={<PostCreate />} />
          <Route path="/admin/posts/edit/:id" element={<PostEdit />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/tags" element={<Tags />} />
          <Route path="/admin/comments" element={<Comments />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
