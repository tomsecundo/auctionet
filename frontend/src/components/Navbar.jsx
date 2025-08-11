import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-pink-600 text-white p-4 flex justify-between items-center">       
      <Link to="/" className="text-2xl font-bold text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
        <div className="flex items-center">
        <img src="https://img.freepik.com/free-vector/illustration-law-concept_53876-5911.jpg" alt="Your Company" className="h-8 w-auto" /> Auctionet
        </div>
      </Link>
      
      {user ? (
      <div className="flex-1 mx-4 relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 px-4 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-pink-500 mx-auto"
              />
              <span className="absolute right-3 top-2.5 text-gray-500">
                <i className="fa fa-search"></i> {/* Use Font Awesome search icon */}
              </span>
            </div>
      ) : ( <></>)}
      <div>
        {user ? (
          <>
            
            <Link to="/auction" className="mr-4 group text-white transition duration-300 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Auction Room</Link>
            <Link to="/tasks" className="mr-4 group text-white transition duration-300 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">My Listed Items</Link>
            <Link to="/profile" className="mr-4 group text-white transition duration-300 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Profile</Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link
              to="/register"
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-700"
            >
              Join
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
