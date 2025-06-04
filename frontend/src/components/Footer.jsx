import React from 'react';

const Footer = () => {
  return (
    <footer className="text-white bg-secondary mt-10 w-100 bg-primary d-flex flex-column flex-md-row justify-content-center align-items-center gap-2 py-2">
      <p className="mb-0 text-center">© 2025 ACB Bank - All rights reserved.</p>
      <p className="mb-0 text-center">
        Development by <a href="mailto:tienlee.lvt@gmail.com" className="text-info text-decoration-underline ms-1">Tienlee.lvt@gmail.com</a>
      </p>
    </footer>
  );
};

export default Footer;