import Navbar from "./Navbar.jsx"; import Sidebar from "./Sidebar.jsx";
export default function Layout({ children }) {
  return <div className="app"><Navbar /><div className="body"><Sidebar /><main className="content">{children}</main></div></div>;
}
