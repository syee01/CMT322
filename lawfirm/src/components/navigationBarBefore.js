import { Link, useMatch, useResolvedPath } from "react-router-dom"
import firmlogo from "../images/logo1.png"

export default function Navbar() {
  return (
    <nav className="nav">
      <Link to="/" className="site-title">
      <div class="logo-image">
        <img src={firmlogo} alt="logo" width={180} height={50}></img>
      </div>
      </Link>
      <ul>
        <li><CustomLink to="/lawyer">LAWYER</CustomLink></li>
        <li><CustomLink to="/login">LOGIN</CustomLink></li>
        <li><CustomLink to="/signup">SIGN UP</CustomLink></li>
        <li><CustomLink to="/about">CONTACT US</CustomLink></li>
      </ul>
    </nav>
  )
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to)
  const isActive = useMatch({ path: resolvedPath.pathname, end: true })

  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  )
}