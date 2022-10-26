import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";

export default function NavbarSearch() {
  function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const search = form.elements.search.value;
    const site = window.location.origin + window.location.pathname;
    const query = encodeURIComponent(`site:${site} ${search}`);
    const searchUrl = `https://www.google.com/search?q=${query}`;
    window.open(searchUrl, "_blank");
  }

  return (
    <Form className="d-flex align-items-stretch mb-4 mb-md-0" role="search" onSubmit={handleSubmit}>
      <InputGroup className="border-white">
        <Form.Control className="search-control" type="search" placeholder="search" aria-label="search" name="search" />
        <Button variant="outline-secondary" className="search-control-button" type="submit">
          <i className="bi bi-search"></i>
          <span className="visually-hidden">submit</span>
        </Button>
      </InputGroup>
    </Form>
  );
}