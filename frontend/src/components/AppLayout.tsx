import { Outlet } from 'react-router-dom';
import Header from './Header';

const AppLayout = () => {
  return (
    <>
      <Header />
      <main className="public-main">
        <Outlet />
      </main>
    </>
  );
};

export default AppLayout;
