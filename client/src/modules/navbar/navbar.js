import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { NavLink } from "react-router-dom";
import NavbarSearch from "./navbar-search";
import { useTranslation } from "react-i18next";

export default function AppNavbar({ routes }) {
  const { t } = useTranslation(); // Initialize the useTranslation hook

  return (
    <Navbar
      bg="light"
      variant="dark"
      className="custom-navbar p-0"
      expand="lg"
      aria-label="CC3S Navigation"
    >
      <Container>
        <Navbar.Brand className="font-title d-inline-block d-lg-none">
          CC3S
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="navbar-nav"
          className="px-0 text-uppercase"
        >
          <i className="bi bi-list me-1"></i>
          Menu
        </Navbar.Toggle>
        <Navbar.Collapse id="navbar-nav" className="align-items-stretch">
          <Nav className="me-auto">
            {routes
              .filter((r) => r.navbar)
              .map((route) => (
                <NavLink
                  className="nav-link text-uppercase text-primary py-0"
                  activeClassName="active text-primary" // Set active class and text-primary
                  key={route.path}
                  to={route.path}
                  end={route.end}
                >
                  {t(route.title)}
                </NavLink>
              ))}
          </Nav>
          {/* <NavbarSearch /> */}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
