import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaBox, FaMapMarkerAlt, FaUser } from "react-icons/fa";

const Dashboard = () => {
  useEffect(() => {
    document.title = "historich-fleur - Dashboard";
  }, []);

  const tabs = [
    { name: "Orderan Saya", path: "orders", icon: <FaBox /> },
    { name: "Alamat", path: "addresses", icon: <FaMapMarkerAlt /> },
    { name: "Detail Akun", path: "account", icon: <FaUser /> },
  ];

  return (
    <div className="pt-24 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-10 text-gray-800">Dashboard</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-1/3 lg:w-1/4">
          <nav className="bg-white rounded-xl shadow-lg p-6">
            <ul className="space-y-3">
              {tabs.map((tab) => (
                <li key={tab.path}>
                  <NavLink
                    to={tab.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        isActive
                          ? "bg-black text-white shadow"
                          : "text-gray-600 hover:bg-gray-100"
                      }`
                    }
                  >
                    {tab.icon}
                    {tab.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="w-full md:w-2/3 lg:w-3/4">
          <div className="bg-white rounded-xl shadow-lg p-6 min-h-[300px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
