import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronUp,
  ChevronDown,
  KeyRound,
  LogOut,
  HomeIcon,
  ChartBarIcon,
  CogIcon,
} from "lucide-react";

const UserProfile = ({ username, email, onLogout, onResetPassword }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const displayName = username || (email ? email.split("@")[0] : "User");

  return (
    <div className="absolute bottom-0 left-0 w-full border-t border-gray-200">
      <div
        className="p-4 hover:bg-gray-50 cursor-pointer"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {displayName}
              </h3>
              <p className="text-xs text-gray-500">{email}</p>
            </div>
          </div>
          {isDropdownOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
        {isDropdownOpen && (
          <div className="mt-2 py-1 border-t border-gray-100">
            <button
              onClick={onResetPassword}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <KeyRound className="w-4 h-4 mr-2" /> Reset Password
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function PCSSidebar({ isSidebarOpen, setIsSidebarOpen, logout }) {
  const sidebarRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [user, setUser] = useState({
    username: "John Doe",
    email: "john.doe@example.com",
  });
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Auth0 Management API configuration
  const config = {
    domain: "pcs-optimus.us.auth0.com",
    clientId: "c3BTFmDeFeJpAHrVjeZBkap1QjVS29EU",
    audience: "https://pcs-optimus.us.auth0.com/api/v2/",
  };

  // Fetch access token
  const getAccessToken = async () => {
    const response = await fetch(`https://${config.domain}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: "aMQ5Y1RAHIGxaLkXKBD7kygiSSFOH_-CRaPT6VHbW9oKrKmb9nnMhcQ2VXPOY5CV",
        audience: config.audience,
        grant_type: "client_credentials",
        scope: "read:users read:users_app_metadata update:users_app_metadata read:user_idp_tokens read:client_grants create:users update:users delete:users read:clients read:client_credentials create:client_credentials",
      }),
    });
    const data = await response.json();
    return data.access_token;
  };

  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      updateMenuItems();
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    setUser(null);
    setMenuItems([]);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = await getAccessToken();
        const response = await fetch(`${config.audience}users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const storedUser = JSON.parse(localStorage.getItem("user"));

          const auth0User = data.find((u) => u.email === storedUser?.email);

          if (auth0User) {
            const userData = {
              username: auth0User.user_metadata?.username || auth0User.email.split("@")[0],
              email: auth0User.email,
            };

            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));

            console.log("Fetched User:", userData);
            updateMenuItems();
          }
        } else {
          console.error("Failed to fetch users:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const updateMenuItems = () => {
    const menuStructure = [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: <HomeIcon size={21} />,
      },
      {
        name: "Historical Data",
        path: "/historical-data",
        icon: <ChartBarIcon size={21} />,
      },
      {
        name: "Device Management",
        path: "/device-management",
        icon: <CogIcon size={21} />,
      },
    ];

    setMenuItems(menuStructure);
    console.log("Updated Menu Items:", menuStructure);
  };

  // Close sidebar if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter menu items based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, menuItems]);

  // Handle "Cmd + K" to focus the search bar
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("search-bar").focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!user) return <div>Loading...</div>;

  const handleNavigate = (path) => {
    if (path !== "#") {
      navigate(path);
      setIsSidebarOpen(false);
    }
  };

  const sendPasswordResetEmail = async () => {
    try {
      const response = await fetch(
        "https://pcs-optimus.us.auth0.com/dbconnections/change_password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: "c3BTFmDeFeJpAHrVjeZBkap1QjVS29EU",
            email: user?.email,
            connection: "Username-Password-Authentication",
          }),
        }
      );

      if (response.ok) {
        setIsOverlayOpen(true);
        setTimeout(() => setIsOverlayOpen(false), 3000);
      } else {
        const errorData = await response.json();
        alert(errorData.error_description || "Failed to send reset email.");
      }
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-200 ${
          isSidebarOpen ? "opacity-100 visible z-20" : "opacity-0 invisible"
        }`}
      ></div>
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white shadow-lg md:w-[396px] w-[366px] transition-transform duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } z-30`}
      >
        <div className="flex items-center justify-between pt-4 pl-4 pr-4 pb-1">
          <div className="flex">
            <img src="/logo192.png" alt="PCS Security Logo" className="h-10 w-auto" />
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="w-14 h-8 flex items-center justify-center font-semibold text-gray-400 hover:text-gray-900"
          >
            X
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative p-4">
          <input
            id="search-bar"
            type="text"
            placeholder="Search"
            className="w-[96%] pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="20"
              height="20"
              viewBox="0,0,256,256"
            >
              <g
                fill="#4d4d4d"
                fillRule="nonzero"
                stroke="none"
                strokeWidth="1"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeMiterlimit="10"
                strokeDasharray=""
                strokeDashoffset="0"
                fontFamily="none"
                fontWeight="none"
                fontSize="none"
                textAnchor="none"
              >
                <g transform="scale(8.53333,8.53333)">
                  <path d="M13,3c-5.511,0 -10,4.489 -10,10c0,5.511 4.489,10 10,10c2.39651,0 4.59738,-0.85101 6.32227,-2.26367l5.9707,5.9707c0.25082,0.26124 0.62327,0.36648 0.97371,0.27512c0.35044,-0.09136 0.62411,-0.36503 0.71547,-0.71547c0.09136,-0.35044 -0.01388,-0.72289 -0.27512,-0.97371l-5.9707,-5.9707c1.41266,-1.72488 2.26367,-3.92576 2.26367,-6.32227c0,-5.511 -4.489,-10 -10,-10zM13,5c4.43012,0 8,3.56988 8,8c0,4.43012 -3.56988,8 -8,8c-4.43012,0 -8,-3.56988 -8,-8c0,-4.43012 3.56988,-8 8,-8z"></path>
                </g>
              </g>
            </svg>
          </span>
          <span className="absolute right-[68px] top-1/2 transform -translate-y-1/2 bg-[#d1d1d157] text-gray-700 text-xs font-semibold px-2 py-1 rounded">
            ⌘
          </span>
          <span className="absolute right-10 top-1/2 transform -translate-y-1/2 bg-[#d1d1d157] text-gray-700 font-medium text-xs px-2 py-1 rounded">
            K
          </span>
        </div>

        {/* Navigation Menu */}
        <ul className="px-4">
          {filteredItems.map((item, index) => (
            <li key={index}>
              <button
                className={`w-full rounded-md flex px-4 py-3 text-left text-gray-700 hover:bg-gray-100 mt-2 ${
                  location.pathname === item.path ? "bg-gray-100" : ""
                }`}
                onClick={() => handleNavigate(item.path)}
              >
                <span className="mr-3">{item.icon}</span> 
                <span className="font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>

        <UserProfile
          username={user?.username}
          email={user?.email}
          onLogout={handleLogout}
          onResetPassword={sendPasswordResetEmail}
        />

        {isOverlayOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg text-center w-64">
              <h2 className="text-[16px] font-semibold text-gray-900">
                Password Reset Sent
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                A reset link has been sent to <strong>{user?.email}</strong>.
                Please check your inbox.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}