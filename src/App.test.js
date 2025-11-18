import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement =  screen.getByRole('img');
  expect(linkElement).toBeInTheDocument();
});

test('text availablity',()=>{
  render(<App />);

  const element =  screen.getByText(/ATS App/);
  expect(element).toBeInTheDocument();
})
