import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";

export default function NavbarSearch() {
  function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const search = form.elements.search.value.trim();
    const site = window.location.origin + window.location.pathname;
    console.log("window.location ", window.location);
    console.log("site ", site);
    const domain = window.location.hostname; // Extract only the domain name
    console.log("domain ", domain);
    const host = window.location.host; // Extract only the domain name
    const query = encodeURIComponent(`site:${host} ${search}`);
    console.log("query ", query);
    const searchUrl = `https://www.google.com/search?q=${query}`;
    window.open(searchUrl, "_blank");
  }

  return (
    <Form
      className="d-flex align-items-stretch mb-0 mb-md-0"
      role="search"
      onSubmit={handleSubmit}
    >
      <InputGroup className="border-white">
        <Form.Control
          className="search-control"
          type="search"
          placeholder="Google Site Search"
          aria-label="search"
          name="search"
        />
        <Button
          variant="outline-secondary"
          className="search-control-button"
          type="submit"
        >
          <i className="bi bi-search"></i>
          <span className="visually-hidden" style={{ color: "#000" }}>
            submit
          </span>
        </Button>
      </InputGroup>
    </Form>
  );
}
